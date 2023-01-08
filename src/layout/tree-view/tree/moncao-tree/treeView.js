/* eslint-disable */
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as Platform from './common/platform.js';
import * as Browser from './browser/browser.js';
import * as Lifecycle from './common/lifecycle.js';
import * as DOM from './browser/dom.js';
import * as Diff from './common/diff/diff.js';
import * as Touch from './browser/touch.js';
import * as strings from './common/strings.js';
import * as Mouse from './browser/mouseEvent.js';
import * as Keyboard from './browser/keyboardEvent.js';
import * as dnd from './treeDnd.js';
import { ArrayIterator, MappedIterator } from './common/iterator.js';
import { ScrollableElement } from './browser/ui/scrollbar/scrollableElement.js';
import { HeightMap } from './treeViewModel.js';
import * as _ from './tree.js';
import { Emitter } from './common/event.js';
import { DataTransfers, StaticDND } from './browser/dnd.js';
import { DefaultTreestyler } from './treeDefaults.js';
import { Delayer, timeout } from './common/async.js';

const __extends = (this && this.__extends) || (function () {
  var extendStatics = function (d, b) {
    extendStatics = Object.setPrototypeOf
            || ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; })
            || function (d, b) { for (const p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
  };
  return function (d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}());

function removeFromParent(element) {
  try {
    element.parentElement.removeChild(element);
  } catch (e) {
    // this will throw if this happens due to a blur event, nasty business
  }
}
const RowCache = /** @class */ (function () {
  function RowCache(context) {
    this.context = context;
    this._cache = { '': [] };
  }
  RowCache.prototype.alloc = function (templateId) {
    let result = this.cache(templateId).pop();
    if (!result) {
      const content = document.createElement('div');
      content.className = 'content';
      const row = document.createElement('div');
      row.appendChild(content);
      let templateData = null;
      try {
        templateData = this.context.renderer.renderTemplate(this.context.tree, templateId, content);
      } catch (err) {
        console.error('Tree usage error: exception while rendering template');
        console.error(err);
      }
      result = {
        element: row,
        templateId,
        templateData,
      };
    }
    return result;
  };
  RowCache.prototype.release = function (templateId, row) {
    removeFromParent(row.element);
    this.cache(templateId).push(row);
  };
  RowCache.prototype.cache = function (templateId) {
    return this._cache[templateId] || (this._cache[templateId] = []);
  };
  RowCache.prototype.garbageCollect = function () {
    const _this = this;
    if (this._cache) {
      Object.keys(this._cache).forEach((templateId) => {
        _this._cache[templateId].forEach((cachedRow) => {
          _this.context.renderer.disposeTemplate(_this.context.tree, templateId, cachedRow.templateData);
          cachedRow.element = null;
          cachedRow.templateData = null;
        });
        delete _this._cache[templateId];
      });
    }
  };
  RowCache.prototype.dispose = function () {
    this.garbageCollect();
    this._cache = null;
  };
  return RowCache;
}());
export { RowCache };
const ViewItem = /** @class */ (function () {
  function ViewItem(context, model) {
    const _this = this;
    this.width = 0;
    this.needsRender = false;
    this.uri = null;
    this.unbindDragStart = Lifecycle.Disposable.None;
    this._draggable = false;
    this.context = context;
    this.model = model;
    this.id = this.model.id;
    this.row = null;
    this.top = 0;
    this.height = model.getHeight();
    this._styles = {};
    model.getAllTraits().forEach((t) => _this._styles[t] = true);
    if (model.isExpanded()) {
      this.addClass('expanded');
    }
  }
  Object.defineProperty(ViewItem.prototype, 'expanded', {
    set(value) {
      value ? this.addClass('expanded') : this.removeClass('expanded');
    },
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(ViewItem.prototype, 'loading', {
    set(value) {
      value ? this.addClass('codicon-loading') : this.removeClass('codicon-loading');
    },
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(ViewItem.prototype, 'draggable', {
    get() {
      return this._draggable;
    },
    set(value) {
      this._draggable = value;
      this.render(true);
    },
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(ViewItem.prototype, 'dropTarget', {
    set(value) {
      value ? this.addClass('drop-target') : this.removeClass('drop-target');
    },
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(ViewItem.prototype, 'element', {
    get() {
      return (this.row && this.row.element);
    },
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(ViewItem.prototype, 'templateId', {
    get() {
      return this._templateId || (this._templateId = (this.context.renderer.getTemplateId && this.context.renderer.getTemplateId(this.context.tree, this.model.getElement())));
    },
    enumerable: true,
    configurable: true,
  });
  ViewItem.prototype.addClass = function (name) {
    this._styles[name] = true;
    this.render(true);
  };
  ViewItem.prototype.removeClass = function (name) {
    delete this._styles[name]; // is this slow?
    this.render(true);
  };
  ViewItem.prototype.render = function (skipUserRender) {
    const _this = this;
    if (skipUserRender === void 0) { skipUserRender = false; }
    if (!this.model || !this.element) {
      return;
    }
    const classes = ['monaco-tree-row'];
    classes.push.apply(classes, Object.keys(this._styles));
    if (this.model.hasChildren()) {
      classes.push('has-children');
    }
    this.element.className = classes.join(' ');
    this.element.draggable = this.draggable;
    this.element.style.height = `${this.height}px`;
    // ARIA
    this.element.setAttribute('role', 'treeitem');
    const accessibility = this.context.accessibilityProvider;
    const ariaLabel = accessibility.getAriaLabel(this.context.tree, this.model.getElement());
    if (ariaLabel) {
      this.element.setAttribute('aria-label', ariaLabel);
    }
    if (accessibility.getPosInSet && accessibility.getSetSize) {
      this.element.setAttribute('aria-setsize', accessibility.getSetSize());
      this.element.setAttribute('aria-posinset', accessibility.getPosInSet(this.context.tree, this.model.getElement()));
    }
    if (this.model.hasTrait('focused')) {
      const base64Id = strings.safeBtoa(this.model.id);
      this.element.setAttribute('aria-selected', 'true');
      this.element.setAttribute('id', base64Id);
    } else {
      this.element.setAttribute('aria-selected', 'false');
      this.element.removeAttribute('id');
    }
    if (this.model.hasChildren()) {
      this.element.setAttribute('aria-expanded', String(!!this._styles.expanded));
    } else {
      this.element.removeAttribute('aria-expanded');
    }
    this.element.setAttribute('aria-level', String(this.model.getDepth()));
    if (this.context.options.paddingOnRow) {
      this.element.style.paddingLeft = `${this.context.options.twistiePixels + ((this.model.getDepth() - 1) * this.context.options.indentPixels)}px`;
    } else {
      this.element.style.paddingLeft = `${(this.model.getDepth() - 1) * this.context.options.indentPixels}px`;
      this.row.element.firstElementChild.style.paddingLeft = `${this.context.options.twistiePixels}px`;
    }
    const uri = this.context.dnd.getDragURI(this.context.tree, this.model.getElement());
    if (uri !== this.uri) {
      if (this.unbindDragStart) {
        this.unbindDragStart.dispose();
      }
      if (uri) {
        this.uri = uri;
        this.draggable = true;
        this.unbindDragStart = DOM.addDisposableListener(this.element, 'dragstart', (e) => {
          _this.onDragStart(e);
        });
      } else {
        this.uri = null;
      }
    }
    if (!skipUserRender && this.element) {
      let paddingLeft = 0;
      if (this.context.horizontalScrolling) {
        const style = window.getComputedStyle(this.element);
        paddingLeft = parseFloat(style.paddingLeft);
      }
      if (this.context.horizontalScrolling) {
        this.element.style.width = Browser.isFirefox ? '-moz-fit-content' : 'fit-content';
      }
      try {
        this.context.renderer.renderElement(this.context.tree, this.model.getElement(), this.templateId, this.row.templateData);
      } catch (err) {
        console.error('Tree usage error: exception while rendering element');
        console.error(err);
      }
      if (this.context.horizontalScrolling) {
        this.width = DOM.getContentWidth(this.element) + paddingLeft;
        this.element.style.width = '';
      }
    }
  };
  ViewItem.prototype.insertInDOM = function (container, afterElement) {
    if (!this.row) {
      this.row = this.context.cache.alloc(this.templateId);
      // used in reverse lookup from HTMLElement to Item
      this.element[TreeView.BINDING] = this;
    }
    if (this.element.parentElement) {
      return;
    }
    if (afterElement === null) {
      container.appendChild(this.element);
    } else {
      try {
        container.insertBefore(this.element, afterElement);
      } catch (e) {
        console.warn('Failed to locate previous tree element');
        container.appendChild(this.element);
      }
    }
    this.render();
  };
  ViewItem.prototype.removeFromDOM = function () {
    if (!this.row) {
      return;
    }
    this.unbindDragStart.dispose();
    this.uri = null;
    this.element[TreeView.BINDING] = null;
    this.context.cache.release(this.templateId, this.row);
    this.row = null;
  };
  ViewItem.prototype.dispose = function () {
    this.row = null;
  };
  return ViewItem;
}());
export { ViewItem };
const RootViewItem = /** @class */ (function (_super) {
  __extends(RootViewItem, _super);
  function RootViewItem(context, model, wrapper) {
    const _this = _super.call(this, context, model) || this;
    _this.row = {
      element: wrapper,
      templateData: null,
      templateId: null,
    };
    return _this;
  }
  RootViewItem.prototype.render = function () {
    if (!this.model || !this.element) {
      return;
    }
    const classes = ['monaco-tree-wrapper'];
    classes.push.apply(classes, Object.keys(this._styles));
    if (this.model.hasChildren()) {
      classes.push('has-children');
    }
    this.element.className = classes.join(' ');
  };
  RootViewItem.prototype.insertInDOM = function (container, afterElement) {
    // noop
  };
  RootViewItem.prototype.removeFromDOM = function () {
    // noop
  };
  return RootViewItem;
}(ViewItem));
function reactionEquals(one, other) {
  if (!one && !other) {
    return true;
  }
  if (!one || !other) {
    return false;
  }
  if (one.accept !== other.accept) {
    return false;
  }
  if (one.bubble !== other.bubble) {
    return false;
  }
  if (one.effect !== other.effect) {
    return false;
  }

  return true;
}
var TreeView = /** @class */ (function (_super) {
  __extends(TreeView, _super);
  function TreeView(context, container) {
    const _this = _super.call(this) || this;
    _this.model = null;
    _this.lastPointerType = '';
    _this.lastClickTimeStamp = 0;
    _this.contentWidthUpdateDelayer = new Delayer(50);
    _this.isRefreshing = false;
    _this.refreshingPreviousChildrenIds = {};
    _this.currentDragAndDropData = null;
    _this.currentDropTarget = null;
    _this.currentDropTargets = null;
    _this.currentDropDisposable = Lifecycle.Disposable.None;
    _this.gestureDisposable = Lifecycle.Disposable.None;
    _this.dragAndDropScrollInterval = null;
    _this.dragAndDropScrollTimeout = null;
    _this.dragAndDropMouseY = null;
    _this.highlightedItemWasDraggable = false;
    _this.onHiddenScrollTop = null;
    _this._onDOMFocus = new Emitter();
    _this.onDOMFocus = _this._onDOMFocus.event;
    _this._onDOMBlur = new Emitter();
    _this._onDidScroll = new Emitter();
    TreeView.counter++;
    _this.instance = TreeView.counter;
    const horizontalScrollMode = typeof context.options.horizontalScrollMode === 'undefined' ? 2 /* Hidden */ : context.options.horizontalScrollMode;
    _this.horizontalScrolling = horizontalScrollMode !== 2;
    _this.context = {
      dataSource: context.dataSource,
      renderer: context.renderer,
      controller: context.controller,
      dnd: context.dnd,
      filter: context.filter,
      sorter: context.sorter,
      tree: context.tree,
      accessibilityProvider: context.accessibilityProvider,
      options: context.options,
      cache: new RowCache(context),
      horizontalScrolling: _this.horizontalScrolling,
    };
    _this.modelListeners = [];
    _this.viewListeners = [];
    _this.items = {};
    _this.domNode = document.createElement('div');
    _this.domNode.className = `monaco-tree no-focused-item monaco-tree-instance-${_this.instance}`;
    // to allow direct tabbing into the tree instead of first focusing the tree
    _this.domNode.tabIndex = context.options.preventRootFocus ? -1 : 0;
    _this.styleElement = DOM.createStyleSheet(_this.domNode);
    _this.treeStyler = context.styler || new DefaultTreestyler(_this.styleElement, `monaco-tree-instance-${_this.instance}`);
    // ARIA
    _this.domNode.setAttribute('role', 'tree');
    if (_this.context.options.ariaLabel) {
      _this.domNode.setAttribute('aria-label', _this.context.options.ariaLabel);
    }
    if (_this.context.options.alwaysFocused) {
      DOM.addClass(_this.domNode, 'focused');
    }
    if (!_this.context.options.paddingOnRow) {
      DOM.addClass(_this.domNode, 'no-row-padding');
    }
    _this.wrapper = document.createElement('div');
    _this.wrapper.className = 'monaco-tree-wrapper';
    _this.scrollableElement = new ScrollableElement(_this.wrapper, {
      alwaysConsumeMouseWheel: true,
      horizontal: horizontalScrollMode,
      vertical: (typeof context.options.verticalScrollMode !== 'undefined' ? context.options.verticalScrollMode : 1 /* Auto */),
      useShadows: context.options.useShadows,
    });
    _this.scrollableElement.onScroll((e) => {
      _this.render(e.scrollTop, e.height, e.scrollLeft, e.width, e.scrollWidth);
      _this._onDidScroll.fire();
    });
    if (Browser.isIE) {
      _this.wrapper.style.msTouchAction = 'none';
      _this.wrapper.style.msContentZooming = 'none';
    } else {
      _this.gestureDisposable = Touch.Gesture.addTarget(_this.wrapper);
    }
    _this.rowsContainer = document.createElement('div');
    _this.rowsContainer.className = 'monaco-tree-rows';
    if (context.options.showTwistie) {
      _this.rowsContainer.className += ' show-twisties';
    }
    const focusTracker = DOM.trackFocus(_this.domNode);
    _this.viewListeners.push(focusTracker.onDidFocus(() => _this.onFocus()));
    _this.viewListeners.push(focusTracker.onDidBlur(() => _this.onBlur()));
    _this.viewListeners.push(focusTracker);
    _this.viewListeners.push(DOM.addDisposableListener(_this.domNode, 'keydown', (e) => _this.onKeyDown(e)));
    _this.viewListeners.push(DOM.addDisposableListener(_this.domNode, 'keyup', (e) => _this.onKeyUp(e)));
    _this.viewListeners.push(DOM.addDisposableListener(_this.domNode, 'mousedown', (e) => _this.onMouseDown(e)));
    _this.viewListeners.push(DOM.addDisposableListener(_this.domNode, 'mouseup', (e) => _this.onMouseUp(e)));
    _this.viewListeners.push(DOM.addDisposableListener(_this.wrapper, 'auxclick', (e) => {
      if (e && e.button === 1) {
        _this.onMouseMiddleClick(e);
      }
    }));
    _this.viewListeners.push(DOM.addDisposableListener(_this.wrapper, 'click', (e) => _this.onClick(e)));
    _this.viewListeners.push(DOM.addDisposableListener(_this.domNode, 'contextmenu', (e) => _this.onContextMenu(e)));
    _this.viewListeners.push(DOM.addDisposableListener(_this.wrapper, Touch.EventType.Tap, (e) => _this.onTap(e)));
    _this.viewListeners.push(DOM.addDisposableListener(_this.wrapper, Touch.EventType.Change, (e) => _this.onTouchChange(e)));
    if (Browser.isIE) {
      _this.viewListeners.push(DOM.addDisposableListener(_this.wrapper, 'MSPointerDown', (e) => _this.onMsPointerDown(e)));
      _this.viewListeners.push(DOM.addDisposableListener(_this.wrapper, 'MSGestureTap', (e) => _this.onMsGestureTap(e)));
      // these events come too fast, we throttle them
      _this.viewListeners.push(DOM.addDisposableThrottledListener(_this.wrapper, 'MSGestureChange', (e) => _this.onThrottledMsGestureChange(e), (lastEvent, event) => {
        event.stopPropagation();
        event.preventDefault();
        const result = { translationY: event.translationY, translationX: event.translationX };
        if (lastEvent) {
          result.translationY += lastEvent.translationY;
          result.translationX += lastEvent.translationX;
        }
        return result;
      }));
    }
    _this.viewListeners.push(DOM.addDisposableListener(window, 'dragover', (e) => _this.onDragOver(e)));
    _this.viewListeners.push(DOM.addDisposableListener(_this.wrapper, 'drop', (e) => _this.onDrop(e)));
    _this.viewListeners.push(DOM.addDisposableListener(window, 'dragend', (e) => _this.onDragEnd(e)));
    _this.viewListeners.push(DOM.addDisposableListener(window, 'dragleave', (e) => _this.onDragOver(e)));
    _this.wrapper.appendChild(_this.rowsContainer);
    _this.domNode.appendChild(_this.scrollableElement.getDomNode());
    container.appendChild(_this.domNode);
    _this.lastRenderTop = 0;
    _this.lastRenderHeight = 0;
    _this.didJustPressContextMenuKey = false;
    _this.currentDropTarget = null;
    _this.currentDropTargets = [];
    _this.shouldInvalidateDropReaction = false;
    _this.dragAndDropScrollInterval = null;
    _this.dragAndDropScrollTimeout = null;
    _this.onRowsChanged();
    _this.layout();
    _this.setupMSGesture();
    _this.applyStyles(context.options);
    return _this;
  }
  TreeView.prototype.applyStyles = function (styles) {
    this.treeStyler.style(styles);
  };
  TreeView.prototype.createViewItem = function (item) {
    return new ViewItem(this.context, item);
  };
  TreeView.prototype.getHTMLElement = function () {
    return this.domNode;
  };
  TreeView.prototype.focus = function () {
    this.domNode.focus();
  };
  TreeView.prototype.isFocused = function () {
    return document.activeElement === this.domNode;
  };
  TreeView.prototype.blur = function () {
    this.domNode.blur();
  };
  TreeView.prototype.setupMSGesture = function () {
    const _this = this;
    if (window.MSGesture) {
      this.msGesture = new MSGesture();
      setTimeout(() => _this.msGesture.target = _this.wrapper, 100); // TODO@joh, TODO@IETeam
    }
  };
  TreeView.prototype.isTreeVisible = function () {
    return this.onHiddenScrollTop === null;
  };
  TreeView.prototype.layout = function (height, width) {
    if (!this.isTreeVisible()) {
      return;
    }
    this.viewHeight = height || DOM.getContentHeight(this.wrapper); // render
    this.scrollHeight = this.getContentHeight();
    if (this.horizontalScrolling) {
      this.viewWidth = width || DOM.getContentWidth(this.wrapper);
    }
  };
  TreeView.prototype.render = function (scrollTop, viewHeight, scrollLeft, viewWidth, scrollWidth) {
    let i;
    let stop;
    const renderTop = scrollTop;
    const renderBottom = scrollTop + viewHeight;
    const thisRenderBottom = this.lastRenderTop + this.lastRenderHeight;
    // when view scrolls down, start rendering from the renderBottom
    for (i = this.indexAfter(renderBottom) - 1, stop = this.indexAt(Math.max(thisRenderBottom, renderTop)); i >= stop; i--) {
      this.insertItemInDOM(this.itemAtIndex(i));
    }
    // when view scrolls up, start rendering from either this.renderTop or renderBottom
    for (i = Math.min(this.indexAt(this.lastRenderTop), this.indexAfter(renderBottom)) - 1, stop = this.indexAt(renderTop); i >= stop; i--) {
      this.insertItemInDOM(this.itemAtIndex(i));
    }
    // when view scrolls down, start unrendering from renderTop
    for (i = this.indexAt(this.lastRenderTop), stop = Math.min(this.indexAt(renderTop), this.indexAfter(thisRenderBottom)); i < stop; i++) {
      this.removeItemFromDOM(this.itemAtIndex(i));
    }
    // when view scrolls up, start unrendering from either renderBottom this.renderTop
    for (i = Math.max(this.indexAfter(renderBottom), this.indexAt(this.lastRenderTop)), stop = this.indexAfter(thisRenderBottom); i < stop; i++) {
      this.removeItemFromDOM(this.itemAtIndex(i));
    }
    const topItem = this.itemAtIndex(this.indexAt(renderTop));
    if (topItem) {
      this.rowsContainer.style.top = `${topItem.top - renderTop}px`;
    }
    if (this.horizontalScrolling) {
      this.rowsContainer.style.left = `${-scrollLeft}px`;
      this.rowsContainer.style.width = `${Math.max(scrollWidth, viewWidth)}px`;
    }
    this.lastRenderTop = renderTop;
    this.lastRenderHeight = renderBottom - renderTop;
  };
  TreeView.prototype.setModel = function (newModel) {
    this.releaseModel();
    this.model = newModel;
    this.model.onRefresh(this.onRefreshing, this, this.modelListeners);
    this.model.onDidRefresh(this.onRefreshed, this, this.modelListeners);
    this.model.onSetInput(this.onClearingInput, this, this.modelListeners);
    this.model.onDidSetInput(this.onSetInput, this, this.modelListeners);
    this.model.onDidFocus(this.onModelFocusChange, this, this.modelListeners);
    this.model.onRefreshItemChildren(this.onItemChildrenRefreshing, this, this.modelListeners);
    this.model.onDidRefreshItemChildren(this.onItemChildrenRefreshed, this, this.modelListeners);
    this.model.onDidRefreshItem(this.onItemRefresh, this, this.modelListeners);
    this.model.onExpandItem(this.onItemExpanding, this, this.modelListeners);
    this.model.onDidExpandItem(this.onItemExpanded, this, this.modelListeners);
    this.model.onCollapseItem(this.onItemCollapsing, this, this.modelListeners);
    this.model.onDidRevealItem(this.onItemReveal, this, this.modelListeners);
    this.model.onDidAddTraitItem(this.onItemAddTrait, this, this.modelListeners);
    this.model.onDidRemoveTraitItem(this.onItemRemoveTrait, this, this.modelListeners);
  };
  TreeView.prototype.onRefreshing = function () {
    this.isRefreshing = true;
  };
  TreeView.prototype.onRefreshed = function () {
    this.isRefreshing = false;
    this.onRowsChanged();
  };
  TreeView.prototype.onRowsChanged = function (scrollTop) {
    if (scrollTop === void 0) { scrollTop = this.scrollTop; }
    if (this.isRefreshing) {
      return;
    }
    this.scrollTop = scrollTop;
    this.updateScrollWidth();
  };
  TreeView.prototype.updateScrollWidth = function () {
    const _this = this;
    if (!this.horizontalScrolling) {
      return;
    }
    this.contentWidthUpdateDelayer.trigger(() => {
      const keys = Object.keys(_this.items);
      let scrollWidth = 0;
      for (let _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
        const key = keys_1[_i];
        scrollWidth = Math.max(scrollWidth, _this.items[key].width);
      }
      _this.scrollWidth = scrollWidth + 10;
    });
  };
  TreeView.prototype.focusNextPage = function (eventPayload) {
    const _this = this;
    let lastPageIndex = this.indexAt(this.scrollTop + this.viewHeight);
    lastPageIndex = lastPageIndex === 0 ? 0 : lastPageIndex - 1;
    const lastPageElement = this.itemAtIndex(lastPageIndex).model.getElement();
    const currentlyFocusedElement = this.model.getFocus();
    if (currentlyFocusedElement !== lastPageElement) {
      this.model.setFocus(lastPageElement, eventPayload);
    } else {
      const previousScrollTop = this.scrollTop;
      this.scrollTop += this.viewHeight;
      if (this.scrollTop !== previousScrollTop) {
        // Let the scroll event listener run
        setTimeout(() => {
          _this.focusNextPage(eventPayload);
        }, 0);
      }
    }
  };
  TreeView.prototype.focusPreviousPage = function (eventPayload) {
    const _this = this;
    let firstPageIndex;
    if (this.scrollTop === 0) {
      firstPageIndex = this.indexAt(this.scrollTop);
    } else {
      firstPageIndex = this.indexAfter(this.scrollTop - 1);
    }
    const firstPageElement = this.itemAtIndex(firstPageIndex).model.getElement();
    const currentlyFocusedElement = this.model.getFocus();
    if (currentlyFocusedElement !== firstPageElement) {
      this.model.setFocus(firstPageElement, eventPayload);
    } else {
      const previousScrollTop = this.scrollTop;
      this.scrollTop -= this.viewHeight;
      if (this.scrollTop !== previousScrollTop) {
        // Let the scroll event listener run
        setTimeout(() => {
          _this.focusPreviousPage(eventPayload);
        }, 0);
      }
    }
  };
  Object.defineProperty(TreeView.prototype, 'viewHeight', {
    get() {
      const scrollDimensions = this.scrollableElement.getScrollDimensions();
      return scrollDimensions.height;
    },
    set(height) {
      this.scrollableElement.setScrollDimensions({ height });
    },
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(TreeView.prototype, 'scrollHeight', {
    set(scrollHeight) {
      scrollHeight += (this.horizontalScrolling ? 10 : 0);
      this.scrollableElement.setScrollDimensions({ scrollHeight });
    },
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(TreeView.prototype, 'viewWidth', {
    get() {
      const scrollDimensions = this.scrollableElement.getScrollDimensions();
      return scrollDimensions.width;
    },
    set(viewWidth) {
      this.scrollableElement.setScrollDimensions({ width: viewWidth });
    },
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(TreeView.prototype, 'scrollWidth', {
    set(scrollWidth) {
      this.scrollableElement.setScrollDimensions({ scrollWidth });
    },
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(TreeView.prototype, 'scrollTop', {
    get() {
      const scrollPosition = this.scrollableElement.getScrollPosition();
      return scrollPosition.scrollTop;
    },
    set(scrollTop) {
      const scrollHeight = this.getContentHeight() + (this.horizontalScrolling ? 10 : 0);
      this.scrollableElement.setScrollDimensions({ scrollHeight });
      this.scrollableElement.setScrollPosition({ scrollTop });
    },
    enumerable: true,
    configurable: true,
  });
  // Events
  TreeView.prototype.onClearingInput = function (e) {
    const { item } = e;
    if (item) {
      this.onRemoveItems(new MappedIterator(item.getNavigator(), ((item) => item && item.id)));
      this.onRowsChanged();
    }
  };
  TreeView.prototype.onSetInput = function (e) {
    this.context.cache.garbageCollect();
    this.inputItem = new RootViewItem(this.context, e.item, this.wrapper);
  };
  TreeView.prototype.onItemChildrenRefreshing = function (e) {
    const { item } = e;
    const viewItem = this.items[item.id];
    if (viewItem && this.context.options.showLoading) {
      viewItem.loadingTimer = setTimeout(() => {
        viewItem.loadingTimer = 0;
        viewItem.loading = true;
      }, TreeView.LOADING_DECORATION_DELAY);
    }
    if (!e.isNested) {
      const childrenIds = [];
      const navigator_1 = item.getNavigator();
      let childItem = void 0;
      while (childItem = navigator_1.next()) {
        childrenIds.push(childItem.id);
      }
      this.refreshingPreviousChildrenIds[item.id] = childrenIds;
    }
  };
  TreeView.prototype.onItemChildrenRefreshed = function (e) {
    const _this = this;
    const { item } = e;
    const viewItem = this.items[item.id];
    if (viewItem) {
      if (viewItem.loadingTimer) {
        clearTimeout(viewItem.loadingTimer);
        viewItem.loadingTimer = 0;
      }
      viewItem.loading = false;
    }
    if (!e.isNested) {
      const previousChildrenIds_1 = this.refreshingPreviousChildrenIds[item.id];
      const afterModelItems_1 = [];
      const navigator_2 = item.getNavigator();
      let childItem = void 0;
      while (childItem = navigator_2.next()) {
        afterModelItems_1.push(childItem);
      }
      const skipDiff = Math.abs(previousChildrenIds_1.length - afterModelItems_1.length) > 1000;
      let diff = [];
      let doToInsertItemsAlreadyExist = false;
      if (!skipDiff) {
        const lcs = new Diff.LcsDiff({
          getElements() { return previousChildrenIds_1; },
        }, {
          getElements() { return afterModelItems_1.map((item) => item.id); },
        }, null);
        diff = lcs.ComputeDiff(false).changes;
        // this means that the result of the diff algorithm would result
        // in inserting items that were already registered. this can only
        // happen if the data provider returns bad ids OR if the sorting
        // of the elements has changed
        doToInsertItemsAlreadyExist = diff.some((d) => {
          if (d.modifiedLength > 0) {
            for (let i = d.modifiedStart, len = d.modifiedStart + d.modifiedLength; i < len; i++) {
              if (_this.items.hasOwnProperty(afterModelItems_1[i].id)) {
                return true;
              }
            }
          }
          return false;
        });
      }
      // 50 is an optimization number, at some point we're better off
      // just replacing everything
      if (!skipDiff && !doToInsertItemsAlreadyExist && diff.length < 50) {
        for (let _i = 0, diff_1 = diff; _i < diff_1.length; _i++) {
          const diffChange = diff_1[_i];
          if (diffChange.originalLength > 0) {
            this.onRemoveItems(new ArrayIterator(previousChildrenIds_1, diffChange.originalStart, diffChange.originalStart + diffChange.originalLength));
          }
          if (diffChange.modifiedLength > 0) {
            let beforeItem = afterModelItems_1[diffChange.modifiedStart - 1] || item;
            beforeItem = beforeItem.getDepth() > 0 ? beforeItem : null;
            this.onInsertItems(new ArrayIterator(afterModelItems_1, diffChange.modifiedStart, diffChange.modifiedStart + diffChange.modifiedLength), beforeItem ? beforeItem.id : null);
          }
        }
      } else if (skipDiff || diff.length) {
        this.onRemoveItems(new ArrayIterator(previousChildrenIds_1));
        this.onInsertItems(new ArrayIterator(afterModelItems_1), item.getDepth() > 0 ? item.id : null);
      }
      if (skipDiff || diff.length) {
        this.onRowsChanged();
      }
    }
  };
  TreeView.prototype.onItemRefresh = function (item) {
    this.onItemsRefresh([item]);
  };
  TreeView.prototype.onItemsRefresh = function (items) {
    const _this = this;
    this.onRefreshItemSet(items.filter((item) => _this.items.hasOwnProperty(item.id)));
    this.onRowsChanged();
  };
  TreeView.prototype.onItemExpanding = function (e) {
    const viewItem = this.items[e.item.id];
    if (viewItem) {
      viewItem.expanded = true;
    }
  };
  TreeView.prototype.onItemExpanded = function (e) {
    const { item } = e;
    const viewItem = this.items[item.id];
    if (viewItem) {
      viewItem.expanded = true;
      const height = this.onInsertItems(item.getNavigator(), item.id) || 0;
      let { scrollTop } = this;
      if (viewItem.top + viewItem.height <= this.scrollTop) {
        scrollTop += height;
      }
      this.onRowsChanged(scrollTop);
    }
  };
  TreeView.prototype.onItemCollapsing = function (e) {
    const { item } = e;
    const viewItem = this.items[item.id];
    if (viewItem) {
      viewItem.expanded = false;
      this.onRemoveItems(new MappedIterator(item.getNavigator(), ((item) => item && item.id)));
      this.onRowsChanged();
    }
  };
  TreeView.prototype.onItemReveal = function (e) {
    const { item } = e;
    let { relativeTop } = e;
    const viewItem = this.items[item.id];
    if (viewItem) {
      if (relativeTop !== null) {
        relativeTop = relativeTop < 0 ? 0 : relativeTop;
        relativeTop = relativeTop > 1 ? 1 : relativeTop;
        // y = mx + b
        const m = viewItem.height - this.viewHeight;
        this.scrollTop = m * relativeTop + viewItem.top;
      } else {
        const viewItemBottom = viewItem.top + viewItem.height;
        const wrapperBottom = this.scrollTop + this.viewHeight;
        if (viewItem.top < this.scrollTop) {
          this.scrollTop = viewItem.top;
        } else if (viewItemBottom >= wrapperBottom) {
          this.scrollTop = viewItemBottom - this.viewHeight;
        }
      }
    }
  };
  TreeView.prototype.onItemAddTrait = function (e) {
    const { item } = e;
    const { trait } = e;
    const viewItem = this.items[item.id];
    if (viewItem) {
      viewItem.addClass(trait);
    }
    if (trait === 'highlighted') {
      DOM.addClass(this.domNode, trait);
      // Ugly Firefox fix: input fields can't be selected if parent nodes are draggable
      if (viewItem) {
        this.highlightedItemWasDraggable = !!viewItem.draggable;
        if (viewItem.draggable) {
          viewItem.draggable = false;
        }
      }
    }
  };
  TreeView.prototype.onItemRemoveTrait = function (e) {
    const { item } = e;
    const { trait } = e;
    const viewItem = this.items[item.id];
    if (viewItem) {
      viewItem.removeClass(trait);
    }
    if (trait === 'highlighted') {
      DOM.removeClass(this.domNode, trait);
      // Ugly Firefox fix: input fields can't be selected if parent nodes are draggable
      if (this.highlightedItemWasDraggable) {
        viewItem.draggable = true;
      }
      this.highlightedItemWasDraggable = false;
    }
  };
  TreeView.prototype.onModelFocusChange = function () {
    const focus = this.model && this.model.getFocus();
    DOM.toggleClass(this.domNode, 'no-focused-item', !focus);
    // ARIA
    if (focus) {
      this.domNode.setAttribute('aria-activedescendant', strings.safeBtoa(this.context.dataSource.getId(this.context.tree, focus)));
    } else {
      this.domNode.removeAttribute('aria-activedescendant');
    }
  };
  // HeightMap "events"
  TreeView.prototype.onInsertItem = function (item) {
    const _this = this;
    item.onDragStart = function (e) { _this.onDragStart(item, e); };
    item.needsRender = true;
    this.refreshViewItem(item);
    this.items[item.id] = item;
  };
  TreeView.prototype.onRefreshItem = function (item, needsRender) {
    if (needsRender === void 0) { needsRender = false; }
    item.needsRender = item.needsRender || needsRender;
    this.refreshViewItem(item);
  };
  TreeView.prototype.onRemoveItem = function (item) {
    this.removeItemFromDOM(item);
    item.dispose();
    delete this.items[item.id];
  };
  // ViewItem refresh
  TreeView.prototype.refreshViewItem = function (item) {
    item.render();
    if (this.shouldBeRendered(item)) {
      this.insertItemInDOM(item);
    } else {
      this.removeItemFromDOM(item);
    }
  };
  // DOM Events
  TreeView.prototype.onClick = function (e) {
    if (this.lastPointerType && this.lastPointerType !== 'mouse') {
      return;
    }
    const event = new Mouse.StandardMouseEvent(e);
    const item = this.getItemAround(event.target);
    if (!item) {
      return;
    }
    if (Browser.isIE && Date.now() - this.lastClickTimeStamp < 300) {
      // IE10+ doesn't set the detail property correctly. While IE10 simply
      // counts the number of clicks, IE11 reports always 1. To align with
      // other browser, we set the value to 2 if clicks events come in a 300ms
      // sequence.
      event.detail = 2;
    }
    this.lastClickTimeStamp = Date.now();
    this.context.controller.onClick(this.context.tree, item.model.getElement(), event);
  };
  TreeView.prototype.onMouseMiddleClick = function (e) {
    if (!this.context.controller.onMouseMiddleClick) {
      return;
    }
    const event = new Mouse.StandardMouseEvent(e);
    const item = this.getItemAround(event.target);
    if (!item) {
      return;
    }
    this.context.controller.onMouseMiddleClick(this.context.tree, item.model.getElement(), event);
  };
  TreeView.prototype.onMouseDown = function (e) {
    this.didJustPressContextMenuKey = false;
    if (!this.context.controller.onMouseDown) {
      return;
    }
    if (this.lastPointerType && this.lastPointerType !== 'mouse') {
      return;
    }
    const event = new Mouse.StandardMouseEvent(e);
    if (event.ctrlKey && Platform.isNative && Platform.isMacintosh) {
      return;
    }
    const item = this.getItemAround(event.target);
    if (!item) {
      return;
    }
    this.context.controller.onMouseDown(this.context.tree, item.model.getElement(), event);
  };
  TreeView.prototype.onMouseUp = function (e) {
    if (!this.context.controller.onMouseUp) {
      return;
    }
    if (this.lastPointerType && this.lastPointerType !== 'mouse') {
      return;
    }
    const event = new Mouse.StandardMouseEvent(e);
    if (event.ctrlKey && Platform.isNative && Platform.isMacintosh) {
      return;
    }
    const item = this.getItemAround(event.target);
    if (!item) {
      return;
    }
    this.context.controller.onMouseUp(this.context.tree, item.model.getElement(), event);
  };
  TreeView.prototype.onTap = function (e) {
    const item = this.getItemAround(e.initialTarget);
    if (!item) {
      return;
    }
    this.context.controller.onTap(this.context.tree, item.model.getElement(), e);
  };
  TreeView.prototype.onTouchChange = function (event) {
    event.preventDefault();
    event.stopPropagation();
    this.scrollTop -= event.translationY;
  };
  TreeView.prototype.onContextMenu = function (event) {
    let resultEvent;
    let element;
    if (event instanceof KeyboardEvent || this.didJustPressContextMenuKey) {
      this.didJustPressContextMenuKey = false;
      const keyboardEvent = new Keyboard.StandardKeyboardEvent(event);
      element = this.model.getFocus();
      let position = void 0;
      if (!element) {
        element = this.model.getInput();
        position = DOM.getDomNodePagePosition(this.inputItem.element);
      } else {
        const id = this.context.dataSource.getId(this.context.tree, element);
        const viewItem = this.items[id];
        position = DOM.getDomNodePagePosition(viewItem.element);
      }
      resultEvent = new _.KeyboardContextMenuEvent(position.left + position.width, position.top, keyboardEvent);
    } else {
      const mouseEvent = new Mouse.StandardMouseEvent(event);
      const item = this.getItemAround(mouseEvent.target);
      if (!item) {
        return;
      }
      element = item.model.getElement();
      resultEvent = new _.MouseContextMenuEvent(mouseEvent);
    }
    this.context.controller.onContextMenu(this.context.tree, element, resultEvent);
  };
  TreeView.prototype.onKeyDown = function (e) {
    const event = new Keyboard.StandardKeyboardEvent(e);
    this.didJustPressContextMenuKey = event.keyCode === 58 /* ContextMenu */ || (event.shiftKey && event.keyCode === 68 /* F10 */);
    if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'input') {
      return; // Ignore event if target is a form input field (avoids browser specific issues)
    }
    if (this.didJustPressContextMenuKey) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.context.controller.onKeyDown(this.context.tree, event);
  };
  TreeView.prototype.onKeyUp = function (e) {
    if (this.didJustPressContextMenuKey) {
      this.onContextMenu(e);
    }
    this.didJustPressContextMenuKey = false;
    this.context.controller.onKeyUp(this.context.tree, new Keyboard.StandardKeyboardEvent(e));
  };
  TreeView.prototype.onDragStart = function (item, e) {
    if (this.model.getHighlight()) {
      return;
    }
    const element = item.model.getElement();
    const selection = this.model.getSelection();
    let elements;
    if (selection.indexOf(element) > -1) {
      elements = selection;
    } else {
      elements = [element];
    }
    e.dataTransfer.effectAllowed = 'copyMove';
    e.dataTransfer.setData(DataTransfers.RESOURCES, JSON.stringify([item.uri]));
    if (e.dataTransfer.setDragImage) {
      let label = void 0;
      if (this.context.dnd.getDragLabel) {
        label = this.context.dnd.getDragLabel(this.context.tree, elements);
      } else {
        label = String(elements.length);
      }
      const dragImage_1 = document.createElement('div');
      dragImage_1.className = 'monaco-tree-drag-image';
      dragImage_1.textContent = label;
      document.body.appendChild(dragImage_1);
      e.dataTransfer.setDragImage(dragImage_1, -10, -10);
      setTimeout(() => document.body.removeChild(dragImage_1), 0);
    }
    this.currentDragAndDropData = new dnd.ElementsDragAndDropData(elements);
    StaticDND.CurrentDragAndDropData = new dnd.ExternalElementsDragAndDropData(elements);
    this.context.dnd.onDragStart(this.context.tree, this.currentDragAndDropData, new Mouse.DragMouseEvent(e));
  };
  TreeView.prototype.setupDragAndDropScrollInterval = function () {
    const _this = this;
    const viewTop = DOM.getTopLeftOffset(this.wrapper).top;
    if (!this.dragAndDropScrollInterval) {
      this.dragAndDropScrollInterval = window.setInterval(() => {
        if (_this.dragAndDropMouseY === null) {
          return;
        }
        const diff = _this.dragAndDropMouseY - viewTop;
        let scrollDiff = 0;
        const upperLimit = _this.viewHeight - 35;
        if (diff < 35) {
          scrollDiff = Math.max(-14, 0.2 * (diff - 35));
        } else if (diff > upperLimit) {
          scrollDiff = Math.min(14, 0.2 * (diff - upperLimit));
        }
        _this.scrollTop += scrollDiff;
      }, 10);
      this.cancelDragAndDropScrollTimeout();
      this.dragAndDropScrollTimeout = window.setTimeout(() => {
        _this.cancelDragAndDropScrollInterval();
        _this.dragAndDropScrollTimeout = null;
      }, 1000);
    }
  };
  TreeView.prototype.cancelDragAndDropScrollInterval = function () {
    if (this.dragAndDropScrollInterval) {
      window.clearInterval(this.dragAndDropScrollInterval);
      this.dragAndDropScrollInterval = null;
    }
    this.cancelDragAndDropScrollTimeout();
  };
  TreeView.prototype.cancelDragAndDropScrollTimeout = function () {
    if (this.dragAndDropScrollTimeout) {
      window.clearTimeout(this.dragAndDropScrollTimeout);
      this.dragAndDropScrollTimeout = null;
    }
  };
  TreeView.prototype.onDragOver = function (e) {
    const _this = this;
    e.preventDefault(); // needed so that the drop event fires (https://stackoverflow.com/questions/21339924/drop-event-not-firing-in-chrome)
    const event = new Mouse.DragMouseEvent(e);
    let viewItem = this.getItemAround(event.target);
    if (!viewItem || (event.posx === 0 && event.posy === 0 && event.browserEvent.type === DOM.EventType.DRAG_LEAVE)) {
      // dragging outside of tree
      if (this.currentDropTarget) {
        // clear previously hovered element feedback
        this.currentDropTargets.forEach((i) => i.dropTarget = false);
        this.currentDropTargets = [];
        this.currentDropDisposable.dispose();
      }
      this.cancelDragAndDropScrollInterval();
      this.currentDropTarget = null;
      this.currentDropElement = null;
      this.dragAndDropMouseY = null;
      return false;
    }
    // dragging inside the tree
    this.setupDragAndDropScrollInterval();
    this.dragAndDropMouseY = event.posy;
    if (!this.currentDragAndDropData) {
      // just started dragging
      if (StaticDND.CurrentDragAndDropData) {
        this.currentDragAndDropData = StaticDND.CurrentDragAndDropData;
      } else {
        if (!event.dataTransfer.types) {
          return false;
        }
        this.currentDragAndDropData = new dnd.DesktopDragAndDropData();
      }
    }
    this.currentDragAndDropData.update(event.browserEvent.dataTransfer);
    let element;
    let item = viewItem.model;
    let reaction;
    // check the bubble up behavior
    do {
      element = item ? item.getElement() : this.model.getInput();
      reaction = this.context.dnd.onDragOver(this.context.tree, this.currentDragAndDropData, element, event);
      if (!reaction || reaction.bubble !== 1 /* BUBBLE_UP */) {
        break;
      }
      item = item && item.parent;
    } while (item);
    if (!item) {
      this.currentDropElement = null;
      return false;
    }
    const canDrop = reaction && reaction.accept;
    if (canDrop) {
      this.currentDropElement = item.getElement();
      event.preventDefault();
      event.dataTransfer.dropEffect = reaction.effect === 0 /* COPY */ ? 'copy' : 'move';
    } else {
      this.currentDropElement = null;
    }
    // item is the model item where drop() should be called
    // can be null
    const currentDropTarget = item.id === this.inputItem.id ? this.inputItem : this.items[item.id];
    if (this.shouldInvalidateDropReaction || this.currentDropTarget !== currentDropTarget || !reactionEquals(this.currentDropElementReaction, reaction)) {
      this.shouldInvalidateDropReaction = false;
      if (this.currentDropTarget) {
        this.currentDropTargets.forEach((i) => i.dropTarget = false);
        this.currentDropTargets = [];
        this.currentDropDisposable.dispose();
      }
      this.currentDropTarget = currentDropTarget;
      this.currentDropElementReaction = reaction;
      if (canDrop) {
        // setup hover feedback for drop target
        if (this.currentDropTarget) {
          this.currentDropTarget.dropTarget = true;
          this.currentDropTargets.push(this.currentDropTarget);
        }
        if (reaction.bubble === 0 /* BUBBLE_DOWN */) {
          const nav = item.getNavigator();
          let child = void 0;
          while (child = nav.next()) {
            viewItem = this.items[child.id];
            if (viewItem) {
              viewItem.dropTarget = true;
              this.currentDropTargets.push(viewItem);
            }
          }
        }
        if (reaction.autoExpand) {
          const timeoutPromise_1 = timeout(500);
          this.currentDropDisposable = Lifecycle.toDisposable(() => timeoutPromise_1.cancel());
          timeoutPromise_1
            .then(() => _this.context.tree.expand(_this.currentDropElement))
            .then(() => _this.shouldInvalidateDropReaction = true);
        }
      }
    }
    return true;
  };
  TreeView.prototype.onDrop = function (e) {
    if (this.currentDropElement) {
      const event_1 = new Mouse.DragMouseEvent(e);
      event_1.preventDefault();
      this.currentDragAndDropData.update(event_1.browserEvent.dataTransfer);
      this.context.dnd.drop(this.context.tree, this.currentDragAndDropData, this.currentDropElement, event_1);
      this.onDragEnd(e);
    }
    this.cancelDragAndDropScrollInterval();
  };
  TreeView.prototype.onDragEnd = function (e) {
    if (this.currentDropTarget) {
      this.currentDropTargets.forEach((i) => i.dropTarget = false);
      this.currentDropTargets = [];
    }
    this.currentDropDisposable.dispose();
    this.cancelDragAndDropScrollInterval();
    this.currentDragAndDropData = null;
    StaticDND.CurrentDragAndDropData = undefined;
    this.currentDropElement = null;
    this.currentDropTarget = null;
    this.dragAndDropMouseY = null;
  };
  TreeView.prototype.onFocus = function () {
    if (!this.context.options.alwaysFocused) {
      DOM.addClass(this.domNode, 'focused');
    }
    this._onDOMFocus.fire();
  };
  TreeView.prototype.onBlur = function () {
    if (!this.context.options.alwaysFocused) {
      DOM.removeClass(this.domNode, 'focused');
    }
    this.domNode.removeAttribute('aria-activedescendant'); // ARIA
    this._onDOMBlur.fire();
  };
  // MS specific DOM Events
  TreeView.prototype.onMsPointerDown = function (event) {
    if (!this.msGesture) {
      return;
    }
    // Circumvent IE11 breaking change in e.pointerType & TypeScript's stale definitions
    const { pointerType } = event;
    if (pointerType === (event.MSPOINTER_TYPE_MOUSE || 'mouse')) {
      this.lastPointerType = 'mouse';
      return;
    }
    if (pointerType === (event.MSPOINTER_TYPE_TOUCH || 'touch')) {
      this.lastPointerType = 'touch';
    } else {
      return;
    }
    event.stopPropagation();
    event.preventDefault();
    this.msGesture.addPointer(event.pointerId);
  };
  TreeView.prototype.onThrottledMsGestureChange = function (event) {
    this.scrollTop -= event.translationY;
  };
  TreeView.prototype.onMsGestureTap = function (event) {
    event.initialTarget = document.elementFromPoint(event.clientX, event.clientY);
    this.onTap(event);
  };
  // DOM changes
  TreeView.prototype.insertItemInDOM = function (item) {
    let elementAfter = null;
    const itemAfter = this.itemAfter(item);
    if (itemAfter && itemAfter.element) {
      elementAfter = itemAfter.element;
    }
    item.insertInDOM(this.rowsContainer, elementAfter);
  };
  TreeView.prototype.removeItemFromDOM = function (item) {
    if (!item) {
      return;
    }
    item.removeFromDOM();
  };
  // Helpers
  TreeView.prototype.shouldBeRendered = function (item) {
    return item.top < this.lastRenderTop + this.lastRenderHeight && item.top + item.height > this.lastRenderTop;
  };
  TreeView.prototype.getItemAround = function (element) {
    let candidate = this.inputItem;
    let el = element;
    do {
      if (el[TreeView.BINDING]) {
        candidate = el[TreeView.BINDING];
      }
      if (el === this.wrapper || el === this.domNode) {
        return candidate;
      }
      if (el === this.scrollableElement.getDomNode() || el === document.body) {
        return undefined;
      }
    } while (el = el.parentElement);
    return undefined;
  };
  // Cleanup
  TreeView.prototype.releaseModel = function () {
    if (this.model) {
      this.modelListeners = Lifecycle.dispose(this.modelListeners);
      this.model = null;
    }
  };
  TreeView.prototype.dispose = function () {
    const _this = this;
    // TODO@joao: improve
    this.scrollableElement.dispose();
    this.releaseModel();
    this.viewListeners = Lifecycle.dispose(this.viewListeners);
    this._onDOMFocus.dispose();
    this._onDOMBlur.dispose();
    if (this.domNode.parentNode) {
      this.domNode.parentNode.removeChild(this.domNode);
    }
    if (this.items) {
      Object.keys(this.items).forEach((key) => _this.items[key].removeFromDOM());
    }
    if (this.context.cache) {
      this.context.cache.dispose();
    }
    this.gestureDisposable.dispose();
    _super.prototype.dispose.call(this);
  };
  TreeView.BINDING = 'monaco-tree-row';
  TreeView.LOADING_DECORATION_DELAY = 800;
  TreeView.counter = 0;
  return TreeView;
}(HeightMap));
export { TreeView };
