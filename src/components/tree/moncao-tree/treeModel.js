/* eslint-disable */
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as Assert from './common/assert.js';
import { onUnexpectedError } from './common/errors.js';
import { combinedDisposable, Disposable } from './common/lifecycle.js';
import {
  Event, Emitter, EventMultiplexer, Relay,
} from './common/event.js';

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

const LockData = /** @class */ (function () {
  function LockData(item) {
    this._onDispose = new Emitter();
    this.onDispose = this._onDispose.event;
    this._item = item;
  }
  Object.defineProperty(LockData.prototype, 'item', {
    get() {
      return this._item;
    },
    enumerable: true,
    configurable: true,
  });
  LockData.prototype.dispose = function () {
    if (this._onDispose) {
      this._onDispose.fire();
      this._onDispose.dispose();
      this._onDispose = undefined;
    }
  };
  return LockData;
}());
export { LockData };
const Lock = /** @class */ (function () {
  function Lock() {
    this.locks = Object.create({});
  }
  Lock.prototype.isLocked = function (item) {
    return !!this.locks[item.id];
  };
  Lock.prototype.run = function (item, fn) {
    const _this = this;
    const lock = this.getLock(item);
    if (lock) {
      return new Promise((c, e) => {
        Event.once(lock.onDispose)(() => _this.run(item, fn).then(c, e));
      });
    }
    let result;
    return new Promise((c, e) => {
      if (item.isDisposed()) {
        return e(new Error('Item is disposed.'));
      }
      const lock = _this.locks[item.id] = new LockData(item);
      result = fn().then((r) => {
        delete _this.locks[item.id];
        lock.dispose();
        return r;
      }).then(c, e);
      return result;
    });
  };
  Lock.prototype.getLock = function (item) {
    let key;
    for (key in this.locks) {
      const lock = this.locks[key];
      if (item.intersects(lock.item)) {
        return lock;
      }
    }
    return null;
  };
  return Lock;
}());
export { Lock };
const ItemRegistry = /** @class */ (function () {
  function ItemRegistry() {
    this._isDisposed = false;
    this._onDidRevealItem = new EventMultiplexer();
    this.onDidRevealItem = this._onDidRevealItem.event;
    this._onExpandItem = new EventMultiplexer();
    this.onExpandItem = this._onExpandItem.event;
    this._onDidExpandItem = new EventMultiplexer();
    this.onDidExpandItem = this._onDidExpandItem.event;
    this._onCollapseItem = new EventMultiplexer();
    this.onCollapseItem = this._onCollapseItem.event;
    this._onDidCollapseItem = new EventMultiplexer();
    this.onDidCollapseItem = this._onDidCollapseItem.event;
    this._onDidAddTraitItem = new EventMultiplexer();
    this.onDidAddTraitItem = this._onDidAddTraitItem.event;
    this._onDidRemoveTraitItem = new EventMultiplexer();
    this.onDidRemoveTraitItem = this._onDidRemoveTraitItem.event;
    this._onDidRefreshItem = new EventMultiplexer();
    this.onDidRefreshItem = this._onDidRefreshItem.event;
    this._onRefreshItemChildren = new EventMultiplexer();
    this.onRefreshItemChildren = this._onRefreshItemChildren.event;
    this._onDidRefreshItemChildren = new EventMultiplexer();
    this.onDidRefreshItemChildren = this._onDidRefreshItemChildren.event;
    this._onDidDisposeItem = new EventMultiplexer();
    this.onDidDisposeItem = this._onDidDisposeItem.event;
    this.items = {};
  }
  ItemRegistry.prototype.register = function (item) {
    Assert.ok(!this.isRegistered(item.id), `item already registered: ${item.id}`);
    const disposable = combinedDisposable(this._onDidRevealItem.add(item.onDidReveal), this._onExpandItem.add(item.onExpand), this._onDidExpandItem.add(item.onDidExpand), this._onCollapseItem.add(item.onCollapse), this._onDidCollapseItem.add(item.onDidCollapse), this._onDidAddTraitItem.add(item.onDidAddTrait), this._onDidRemoveTraitItem.add(item.onDidRemoveTrait), this._onDidRefreshItem.add(item.onDidRefresh), this._onRefreshItemChildren.add(item.onRefreshChildren), this._onDidRefreshItemChildren.add(item.onDidRefreshChildren), this._onDidDisposeItem.add(item.onDidDispose));
    this.items[item.id] = { item, disposable };
  };
  ItemRegistry.prototype.deregister = function (item) {
    Assert.ok(this.isRegistered(item.id), `item not registered: ${item.id}`);
    this.items[item.id].disposable.dispose();
    delete this.items[item.id];
  };
  ItemRegistry.prototype.isRegistered = function (id) {
    return this.items.hasOwnProperty(id);
  };
  ItemRegistry.prototype.getItem = function (id) {
    const result = this.items[id];
    return result ? result.item : null;
  };
  ItemRegistry.prototype.dispose = function () {
    this.items = {};
    this._onDidRevealItem.dispose();
    this._onExpandItem.dispose();
    this._onDidExpandItem.dispose();
    this._onCollapseItem.dispose();
    this._onDidCollapseItem.dispose();
    this._onDidAddTraitItem.dispose();
    this._onDidRemoveTraitItem.dispose();
    this._onDidRefreshItem.dispose();
    this._onRefreshItemChildren.dispose();
    this._onDidRefreshItemChildren.dispose();
    this._isDisposed = true;
  };
  ItemRegistry.prototype.isDisposed = function () {
    return this._isDisposed;
  };
  return ItemRegistry;
}());
export { ItemRegistry };
const Item = /** @class */ (function () {
  function Item(id, registry, context, lock, element) {
    this._onDidCreate = new Emitter();
    this._onDidReveal = new Emitter();
    this.onDidReveal = this._onDidReveal.event;
    this._onExpand = new Emitter();
    this.onExpand = this._onExpand.event;
    this._onDidExpand = new Emitter();
    this.onDidExpand = this._onDidExpand.event;
    this._onCollapse = new Emitter();
    this.onCollapse = this._onCollapse.event;
    this._onDidCollapse = new Emitter();
    this.onDidCollapse = this._onDidCollapse.event;
    this._onDidAddTrait = new Emitter();
    this.onDidAddTrait = this._onDidAddTrait.event;
    this._onDidRemoveTrait = new Emitter();
    this.onDidRemoveTrait = this._onDidRemoveTrait.event;
    this._onDidRefresh = new Emitter();
    this.onDidRefresh = this._onDidRefresh.event;
    this._onRefreshChildren = new Emitter();
    this.onRefreshChildren = this._onRefreshChildren.event;
    this._onDidRefreshChildren = new Emitter();
    this.onDidRefreshChildren = this._onDidRefreshChildren.event;
    this._onDidDispose = new Emitter();
    this.onDidDispose = this._onDidDispose.event;
    this.registry = registry;
    this.context = context;
    this.lock = lock;
    this.element = element;
    this.id = id;
    this.registry.register(this);
    this.doesHaveChildren = this.context.dataSource.hasChildren(this.context.tree, this.element);
    this.needsChildrenRefresh = true;
    this.parent = null;
    this.previous = null;
    this.next = null;
    this.firstChild = null;
    this.lastChild = null;
    this.traits = {};
    this.depth = 0;
    this.expanded = !!(this.context.dataSource.shouldAutoexpand && this.context.dataSource.shouldAutoexpand(this.context.tree, element));
    this._onDidCreate.fire(this);
    this.visible = this._isVisible();
    this.height = this._getHeight();
    this._isDisposed = false;
  }
  Item.prototype.getElement = function () {
    return this.element;
  };
  Item.prototype.hasChildren = function () {
    return this.doesHaveChildren;
  };
  Item.prototype.getDepth = function () {
    return this.depth;
  };
  Item.prototype.isVisible = function () {
    return this.visible;
  };
  Item.prototype.setVisible = function (value) {
    this.visible = value;
  };
  Item.prototype.isExpanded = function () {
    return this.expanded;
  };
  /* protected */ Item.prototype._setExpanded = function (value) {
    this.expanded = value;
  };
  Item.prototype.reveal = function (relativeTop) {
    if (relativeTop === void 0) { relativeTop = null; }
    const eventData = { item: this, relativeTop };
    this._onDidReveal.fire(eventData);
  };
  Item.prototype.expand = function () {
    const _this = this;
    if (this.isExpanded() || !this.doesHaveChildren || this.lock.isLocked(this)) {
      return Promise.resolve(false);
    }
    const result = this.lock.run(this, () => {
      if (_this.isExpanded() || !_this.doesHaveChildren) {
        return Promise.resolve(false);
      }
      const eventData = { item: _this };
      let result;
      _this._onExpand.fire(eventData);
      if (_this.needsChildrenRefresh) {
        result = _this.refreshChildren(false, true, true);
      } else {
        result = Promise.resolve(null);
      }
      return result.then(() => {
        _this._setExpanded(true);
        _this._onDidExpand.fire(eventData);
        return true;
      });
    });
    return result.then((r) => {
      if (_this.isDisposed()) {
        return false;
      }
      // Auto expand single child folders
      if (_this.context.options.autoExpandSingleChildren && r && _this.firstChild !== null && _this.firstChild === _this.lastChild && _this.firstChild.isVisible()) {
        return _this.firstChild.expand().then(() => true);
      }
      return r;
    });
  };
  Item.prototype.collapse = function (recursive) {
    const _this = this;
    if (recursive === void 0) { recursive = false; }
    if (recursive) {
      let collapseChildrenPromise_1 = Promise.resolve(null);
      this.forEachChild((child) => {
        collapseChildrenPromise_1 = collapseChildrenPromise_1.then(() => child.collapse(true));
      });
      return collapseChildrenPromise_1.then(() => _this.collapse(false));
    }

    if (!this.isExpanded() || this.lock.isLocked(this)) {
      return Promise.resolve(false);
    }
    return this.lock.run(this, () => {
      const eventData = { item: _this };
      _this._onCollapse.fire(eventData);
      _this._setExpanded(false);
      _this._onDidCollapse.fire(eventData);
      return Promise.resolve(true);
    });
  };
  Item.prototype.addTrait = function (trait) {
    const eventData = { item: this, trait };
    this.traits[trait] = true;
    this._onDidAddTrait.fire(eventData);
  };
  Item.prototype.removeTrait = function (trait) {
    const eventData = { item: this, trait };
    delete this.traits[trait];
    this._onDidRemoveTrait.fire(eventData);
  };
  Item.prototype.hasTrait = function (trait) {
    return this.traits[trait] || false;
  };
  Item.prototype.getAllTraits = function () {
    const result = [];
    let trait;
    for (trait in this.traits) {
      if (this.traits.hasOwnProperty(trait) && this.traits[trait]) {
        result.push(trait);
      }
    }
    return result;
  };
  Item.prototype.getHeight = function () {
    return this.height;
  };
  Item.prototype.refreshChildren = function (recursive, safe, force) {
    const _this = this;
    if (safe === void 0) { safe = false; }
    if (force === void 0) { force = false; }
    if (!force && !this.isExpanded()) {
      var setNeedsChildrenRefresh_1 = function (item) {
        item.needsChildrenRefresh = true;
        item.forEachChild(setNeedsChildrenRefresh_1);
      };
      setNeedsChildrenRefresh_1(this);
      return Promise.resolve(this);
    }
    this.needsChildrenRefresh = false;
    const doRefresh = function () {
      const eventData = { item: _this, isNested: safe };
      _this._onRefreshChildren.fire(eventData);
      let childrenPromise;
      if (_this.doesHaveChildren) {
        childrenPromise = _this.context.dataSource.getChildren(_this.context.tree, _this.element);
      } else {
        childrenPromise = Promise.resolve([]);
      }
      const result = childrenPromise.then((elements) => {
        if (_this.isDisposed() || _this.registry.isDisposed()) {
          return Promise.resolve(null);
        }
        if (!Array.isArray(elements)) {
          return Promise.reject(new Error('Please return an array of children.'));
        }
        elements = !elements ? [] : elements.slice(0);
        elements = _this.sort(elements);
        const staleItems = {};
        while (_this.firstChild !== null) {
          staleItems[_this.firstChild.id] = _this.firstChild;
          _this.removeChild(_this.firstChild);
        }
        for (let i = 0, len = elements.length; i < len; i++) {
          const element = elements[i];
          const id = _this.context.dataSource.getId(_this.context.tree, element);
          const item = staleItems[id] || new Item(id, _this.registry, _this.context, _this.lock, element);
          item.element = element;
          if (recursive) {
            item.needsChildrenRefresh = recursive;
          }
          delete staleItems[id];
          _this.addChild(item);
        }
        for (const staleItemId in staleItems) {
          if (staleItems.hasOwnProperty(staleItemId)) {
            staleItems[staleItemId].dispose();
          }
        }
        if (recursive) {
          return Promise.all(_this.mapEachChild((child) => child.doRefresh(recursive, true)));
        }

        return Promise.all(_this.mapEachChild((child) => {
          if (child.isExpanded() && child.needsChildrenRefresh) {
            return child.doRefresh(recursive, true);
          }

          child.updateVisibility();
          return Promise.resolve(null);
        }));
      });
      return result
        .then(undefined, onUnexpectedError)
        .then(() => _this._onDidRefreshChildren.fire(eventData));
    };
    return safe ? doRefresh() : this.lock.run(this, doRefresh);
  };
  Item.prototype.doRefresh = function (recursive, safe) {
    if (safe === void 0) { safe = false; }
    this.doesHaveChildren = this.context.dataSource.hasChildren(this.context.tree, this.element);
    this.height = this._getHeight();
    this.updateVisibility();
    this._onDidRefresh.fire(this);
    return this.refreshChildren(recursive, safe);
  };
  Item.prototype.updateVisibility = function () {
    this.setVisible(this._isVisible());
  };
  Item.prototype.refresh = function (recursive) {
    return this.doRefresh(recursive);
  };
  Item.prototype.getNavigator = function () {
    return new TreeNavigator(this);
  };
  Item.prototype.intersects = function (other) {
    return this.isAncestorOf(other) || other.isAncestorOf(this);
  };
  Item.prototype.isAncestorOf = function (startItem) {
    let item = startItem;
    while (item) {
      if (item.id === this.id) {
        return true;
      }
      item = item.parent;
    }
    return false;
  };
  Item.prototype.addChild = function (item, afterItem) {
    if (afterItem === void 0) { afterItem = this.lastChild; }
    const isEmpty = this.firstChild === null;
    const atHead = afterItem === null;
    const atTail = afterItem === this.lastChild;
    if (isEmpty) {
      this.firstChild = this.lastChild = item;
      item.next = item.previous = null;
    } else if (atHead) {
      if (!this.firstChild) {
        throw new Error('Invalid tree state');
      }
      this.firstChild.previous = item;
      item.next = this.firstChild;
      item.previous = null;
      this.firstChild = item;
    } else if (atTail) {
      if (!this.lastChild) {
        throw new Error('Invalid tree state');
      }
      this.lastChild.next = item;
      item.next = null;
      item.previous = this.lastChild;
      this.lastChild = item;
    } else {
      item.previous = afterItem;
      if (!afterItem) {
        throw new Error('Invalid tree state');
      }
      item.next = afterItem.next;
      if (!afterItem.next) {
        throw new Error('Invalid tree state');
      }
      afterItem.next.previous = item;
      afterItem.next = item;
    }
    item.parent = this;
    item.depth = this.depth + 1;
  };
  Item.prototype.removeChild = function (item) {
    const isFirstChild = this.firstChild === item;
    const isLastChild = this.lastChild === item;
    if (isFirstChild && isLastChild) {
      this.firstChild = this.lastChild = null;
    } else if (isFirstChild) {
      if (!item.next) {
        throw new Error('Invalid tree state');
      }
      item.next.previous = null;
      this.firstChild = item.next;
    } else if (isLastChild) {
      if (!item.previous) {
        throw new Error('Invalid tree state');
      }
      item.previous.next = null;
      this.lastChild = item.previous;
    } else {
      if (!item.next) {
        throw new Error('Invalid tree state');
      }
      item.next.previous = item.previous;
      if (!item.previous) {
        throw new Error('Invalid tree state');
      }
      item.previous.next = item.next;
    }
    item.parent = null;
    item.depth = NaN;
  };
  Item.prototype.forEachChild = function (fn) {
    let child = this.firstChild;
    let next;
    while (child) {
      next = child.next;
      fn(child);
      child = next;
    }
  };
  Item.prototype.mapEachChild = function (fn) {
    const result = [];
    this.forEachChild((child) => {
      result.push(fn(child));
    });
    return result;
  };
  Item.prototype.sort = function (elements) {
    const _this = this;
    const { sorter } = this.context;
    if (sorter) {
      return elements.sort((element, otherElement) => sorter.compare(_this.context.tree, element, otherElement));
    }
    return elements;
  };
  /* protected */ Item.prototype._getHeight = function () {
    if (!this.context.renderer) {
      return 0;
    }
    return this.context.renderer.getHeight(this.context.tree, this.element);
  };
  /* protected */ Item.prototype._isVisible = function () {
    if (!this.context.filter) {
      return false;
    }
    return this.context.filter.isVisible(this.context.tree, this.element);
  };
  Item.prototype.isDisposed = function () {
    return this._isDisposed;
  };
  Item.prototype.dispose = function () {
    this.forEachChild((child) => child.dispose());
    this.parent = null;
    this.previous = null;
    this.next = null;
    this.firstChild = null;
    this.lastChild = null;
    this._onDidDispose.fire(this);
    this.registry.deregister(this);
    this._onDidCreate.dispose();
    this._onDidReveal.dispose();
    this._onExpand.dispose();
    this._onDidExpand.dispose();
    this._onCollapse.dispose();
    this._onDidCollapse.dispose();
    this._onDidAddTrait.dispose();
    this._onDidRemoveTrait.dispose();
    this._onDidRefresh.dispose();
    this._onRefreshChildren.dispose();
    this._onDidRefreshChildren.dispose();
    this._onDidDispose.dispose();
    this._isDisposed = true;
  };
  return Item;
}());
export { Item };
const RootItem = /** @class */ (function (_super) {
  __extends(RootItem, _super);
  function RootItem(id, registry, context, lock, element) {
    return _super.call(this, id, registry, context, lock, element) || this;
  }
  RootItem.prototype.isVisible = function () {
    return false;
  };
  RootItem.prototype.setVisible = function (value) {
    // no-op
  };
  RootItem.prototype.isExpanded = function () {
    return true;
  };
  /* protected */ RootItem.prototype._setExpanded = function (value) {
    // no-op
  };
  /* protected */ RootItem.prototype._getHeight = function () {
    return 0;
  };
  /* protected */ RootItem.prototype._isVisible = function () {
    return false;
  };
  return RootItem;
}(Item));
var TreeNavigator = /** @class */ (function () {
  function TreeNavigator(item, subTreeOnly) {
    if (subTreeOnly === void 0) { subTreeOnly = true; }
    this.item = item;
    this.start = subTreeOnly ? item : null;
  }
  TreeNavigator.lastDescendantOf = function (item) {
    if (!item) {
      return null;
    }
    if (item instanceof RootItem) {
      return TreeNavigator.lastDescendantOf(item.lastChild);
    }
    if (!item.isVisible()) {
      return TreeNavigator.lastDescendantOf(item.previous);
    }
    if (!item.isExpanded() || item.lastChild === null) {
      return item;
    }
    return TreeNavigator.lastDescendantOf(item.lastChild);
  };
  TreeNavigator.prototype.current = function () {
    return this.item || null;
  };
  TreeNavigator.prototype.next = function () {
    if (this.item) {
      do {
        if ((this.item instanceof RootItem || (this.item.isVisible() && this.item.isExpanded())) && this.item.firstChild) {
          this.item = this.item.firstChild;
        } else if (this.item === this.start) {
          this.item = null;
        } else {
          // select next brother, next uncle, next great-uncle, etc...
          while (this.item && this.item !== this.start && !this.item.next) {
            this.item = this.item.parent;
          }
          if (this.item === this.start) {
            this.item = null;
          }
          this.item = !this.item ? null : this.item.next;
        }
      } while (this.item && !this.item.isVisible());
    }
    return this.item || null;
  };
  TreeNavigator.prototype.previous = function () {
    if (this.item) {
      do {
        const previous = TreeNavigator.lastDescendantOf(this.item.previous);
        if (previous) {
          this.item = previous;
        } else if (this.item.parent && this.item.parent !== this.start && this.item.parent.isVisible()) {
          this.item = this.item.parent;
        } else {
          this.item = null;
        }
      } while (this.item && !this.item.isVisible());
    }
    return this.item || null;
  };
  TreeNavigator.prototype.parent = function () {
    if (this.item) {
      const parent_1 = this.item.parent;
      if (parent_1 && parent_1 !== this.start && parent_1.isVisible()) {
        this.item = parent_1;
      } else {
        this.item = null;
      }
    }
    return this.item || null;
  };
  TreeNavigator.prototype.first = function () {
    this.item = this.start;
    this.next();
    return this.item || null;
  };
  TreeNavigator.prototype.last = function () {
    return TreeNavigator.lastDescendantOf(this.start);
  };
  return TreeNavigator;
}());
export { TreeNavigator };
const TreeModel = /** @class */ (function () {
  function TreeModel(context) {
    this.registry = new ItemRegistry();
    this.registryDisposable = Disposable.None;
    this._onSetInput = new Emitter();
    this.onSetInput = this._onSetInput.event;
    this._onDidSetInput = new Emitter();
    this.onDidSetInput = this._onDidSetInput.event;
    this._onRefresh = new Emitter();
    this.onRefresh = this._onRefresh.event;
    this._onDidRefresh = new Emitter();
    this.onDidRefresh = this._onDidRefresh.event;
    this._onDidHighlight = new Emitter();
    this.onDidHighlight = this._onDidHighlight.event;
    this._onDidSelect = new Emitter();
    this.onDidSelect = this._onDidSelect.event;
    this._onDidFocus = new Emitter();
    this.onDidFocus = this._onDidFocus.event;
    this._onDidRevealItem = new Relay();
    this.onDidRevealItem = this._onDidRevealItem.event;
    this._onExpandItem = new Relay();
    this.onExpandItem = this._onExpandItem.event;
    this._onDidExpandItem = new Relay();
    this.onDidExpandItem = this._onDidExpandItem.event;
    this._onCollapseItem = new Relay();
    this.onCollapseItem = this._onCollapseItem.event;
    this._onDidCollapseItem = new Relay();
    this.onDidCollapseItem = this._onDidCollapseItem.event;
    this._onDidAddTraitItem = new Relay();
    this.onDidAddTraitItem = this._onDidAddTraitItem.event;
    this._onDidRemoveTraitItem = new Relay();
    this.onDidRemoveTraitItem = this._onDidRemoveTraitItem.event;
    this._onDidRefreshItem = new Relay();
    this.onDidRefreshItem = this._onDidRefreshItem.event;
    this._onRefreshItemChildren = new Relay();
    this.onRefreshItemChildren = this._onRefreshItemChildren.event;
    this._onDidRefreshItemChildren = new Relay();
    this.onDidRefreshItemChildren = this._onDidRefreshItemChildren.event;
    this._onDidDisposeItem = new Relay();
    this.context = context;
    this.input = null;
    this.traitsToItems = {};
  }
  TreeModel.prototype.setInput = function (element) {
    const _this = this;
    let eventData = { item: this.input };
    this._onSetInput.fire(eventData);
    this.setSelection([]);
    this.setFocus();
    this.setHighlight();
    this.lock = new Lock();
    if (this.input) {
      this.input.dispose();
    }
    if (this.registry) {
      this.registry.dispose();
      this.registryDisposable.dispose();
    }
    this.registry = new ItemRegistry();
    this._onDidRevealItem.input = this.registry.onDidRevealItem;
    this._onExpandItem.input = this.registry.onExpandItem;
    this._onDidExpandItem.input = this.registry.onDidExpandItem;
    this._onCollapseItem.input = this.registry.onCollapseItem;
    this._onDidCollapseItem.input = this.registry.onDidCollapseItem;
    this._onDidAddTraitItem.input = this.registry.onDidAddTraitItem;
    this._onDidRemoveTraitItem.input = this.registry.onDidRemoveTraitItem;
    this._onDidRefreshItem.input = this.registry.onDidRefreshItem;
    this._onRefreshItemChildren.input = this.registry.onRefreshItemChildren;
    this._onDidRefreshItemChildren.input = this.registry.onDidRefreshItemChildren;
    this._onDidDisposeItem.input = this.registry.onDidDisposeItem;
    this.registryDisposable = this.registry.onDidDisposeItem((item) => item.getAllTraits().forEach((trait) => delete _this.traitsToItems[trait][item.id]));
    const id = this.context.dataSource.getId(this.context.tree, element);
    this.input = new RootItem(id, this.registry, this.context, this.lock, element);
    eventData = { item: this.input };
    this._onDidSetInput.fire(eventData);
    return this.refresh(this.input);
  };
  TreeModel.prototype.getInput = function () {
    return this.input ? this.input.getElement() : null;
  };
  TreeModel.prototype.refresh = function (element, recursive) {
    const _this = this;
    if (element === void 0) { element = null; }
    if (recursive === void 0) { recursive = true; }
    const item = this.getItem(element);
    if (!item) {
      return Promise.resolve(null);
    }
    const eventData = { item, recursive };
    this._onRefresh.fire(eventData);
    return item.refresh(recursive).then(() => {
      _this._onDidRefresh.fire(eventData);
    });
  };
  TreeModel.prototype.expand = function (element) {
    const item = this.getItem(element);
    if (!item) {
      return Promise.resolve(false);
    }
    return item.expand();
  };
  TreeModel.prototype.collapse = function (element, recursive) {
    if (recursive === void 0) { recursive = false; }
    const item = this.getItem(element);
    if (!item) {
      return Promise.resolve(false);
    }
    return item.collapse(recursive);
  };
  TreeModel.prototype.toggleExpansion = function (element, recursive) {
    if (recursive === void 0) { recursive = false; }
    return this.isExpanded(element) ? this.collapse(element, recursive) : this.expand(element);
  };
  TreeModel.prototype.isExpanded = function (element) {
    const item = this.getItem(element);
    if (!item) {
      return false;
    }
    return item.isExpanded();
  };
  TreeModel.prototype.reveal = function (element, relativeTop) {
    const _this = this;
    if (relativeTop === void 0) { relativeTop = null; }
    return this.resolveUnknownParentChain(element).then((chain) => {
      let result = Promise.resolve(null);
      chain.forEach((e) => {
        result = result.then(() => _this.expand(e));
      });
      return result;
    }).then(() => {
      const item = _this.getItem(element);
      if (item) {
        return item.reveal(relativeTop);
      }
    });
  };
  TreeModel.prototype.resolveUnknownParentChain = function (element) {
    const _this = this;
    return this.context.dataSource.getParent(this.context.tree, element).then((parent) => {
      if (!parent) {
        return Promise.resolve([]);
      }
      return _this.resolveUnknownParentChain(parent).then((result) => {
        result.push(parent);
        return result;
      });
    });
  };
  TreeModel.prototype.setHighlight = function (element, eventPayload) {
    this.setTraits('highlighted', element ? [element] : []);
    const eventData = { highlight: this.getHighlight(), payload: eventPayload };
    this._onDidHighlight.fire(eventData);
  };
  TreeModel.prototype.getHighlight = function (includeHidden) {
    if (includeHidden === void 0) { includeHidden = false; }
    const result = this.getElementsWithTrait('highlighted', includeHidden);
    return result.length === 0 ? null : result[0];
  };
  TreeModel.prototype.setSelection = function (elements, eventPayload) {
    this.setTraits('selected', elements);
    const eventData = { selection: this.getSelection(), payload: eventPayload };
    this._onDidSelect.fire(eventData);
  };
  TreeModel.prototype.getSelection = function (includeHidden) {
    if (includeHidden === void 0) { includeHidden = false; }
    return this.getElementsWithTrait('selected', includeHidden);
  };
  TreeModel.prototype.setFocus = function (element, eventPayload) {
    this.setTraits('focused', element ? [element] : []);
    const eventData = { focus: this.getFocus(), payload: eventPayload };
    this._onDidFocus.fire(eventData);
  };
  TreeModel.prototype.getFocus = function (includeHidden) {
    if (includeHidden === void 0) { includeHidden = false; }
    const result = this.getElementsWithTrait('focused', includeHidden);
    return result.length === 0 ? null : result[0];
  };
  TreeModel.prototype.focusNext = function (count, eventPayload) {
    if (count === void 0) { count = 1; }
    let item = this.getFocus() || this.input;
    let nextItem;
    const nav = this.getNavigator(item, false);
    for (let i = 0; i < count; i++) {
      nextItem = nav.next();
      if (!nextItem) {
        break;
      }
      item = nextItem;
    }
    this.setFocus(item, eventPayload);
  };
  TreeModel.prototype.focusPrevious = function (count, eventPayload) {
    if (count === void 0) { count = 1; }
    let item = this.getFocus() || this.input;
    let previousItem;
    const nav = this.getNavigator(item, false);
    for (let i = 0; i < count; i++) {
      previousItem = nav.previous();
      if (!previousItem) {
        break;
      }
      item = previousItem;
    }
    this.setFocus(item, eventPayload);
  };
  TreeModel.prototype.focusParent = function (eventPayload) {
    const item = this.getFocus() || this.input;
    const nav = this.getNavigator(item, false);
    const parent = nav.parent();
    if (parent) {
      this.setFocus(parent, eventPayload);
    }
  };
  TreeModel.prototype.focusFirstChild = function (eventPayload) {
    const item = this.getItem(this.getFocus() || this.input);
    const nav = this.getNavigator(item, false);
    const next = nav.next();
    const parent = nav.parent();
    if (parent === item) {
      this.setFocus(next, eventPayload);
    }
  };
  TreeModel.prototype.focusFirst = function (eventPayload, from) {
    this.focusNth(0, eventPayload, from);
  };
  TreeModel.prototype.focusNth = function (index, eventPayload, from) {
    const navItem = this.getParent(from);
    const nav = this.getNavigator(navItem);
    let item = nav.first();
    for (let i = 0; i < index; i++) {
      item = nav.next();
    }
    if (item) {
      this.setFocus(item, eventPayload);
    }
  };
  TreeModel.prototype.focusLast = function (eventPayload, from) {
    const navItem = this.getParent(from);
    let item;
    if (from && navItem) {
      item = navItem.lastChild;
    } else {
      const nav = this.getNavigator(navItem);
      item = nav.last();
    }
    if (item) {
      this.setFocus(item, eventPayload);
    }
  };
  TreeModel.prototype.getParent = function (from) {
    if (from) {
      const fromItem = this.getItem(from);
      if (fromItem && fromItem.parent) {
        return fromItem.parent;
      }
    }
    return this.getItem(this.input);
  };
  TreeModel.prototype.getNavigator = function (element, subTreeOnly) {
    if (element === void 0) { element = null; }
    if (subTreeOnly === void 0) { subTreeOnly = true; }
    return new TreeNavigator(this.getItem(element), subTreeOnly);
  };
  TreeModel.prototype.getItem = function (element) {
    if (element === void 0) { element = null; }
    if (element === null) {
      return this.input;
    }
    if (element instanceof Item) {
      return element;
    }
    if (typeof element === 'string') {
      return this.registry.getItem(element);
    }

    return this.registry.getItem(this.context.dataSource.getId(this.context.tree, element));
  };
  TreeModel.prototype.removeTraits = function (trait, elements) {
    const items = this.traitsToItems[trait] || {};
    let item;
    let id;
    if (elements.length === 0) {
      for (id in items) {
        if (items.hasOwnProperty(id)) {
          item = items[id];
          item.removeTrait(trait);
        }
      }
      delete this.traitsToItems[trait];
    } else {
      for (let i = 0, len = elements.length; i < len; i++) {
        item = this.getItem(elements[i]);
        if (item) {
          item.removeTrait(trait);
          delete items[item.id];
        }
      }
    }
  };
  TreeModel.prototype.setTraits = function (trait, elements) {
    if (elements.length === 0) {
      this.removeTraits(trait, elements);
    } else {
      const items = {};
      let item = void 0;
      for (var i = 0, len = elements.length; i < len; i++) {
        item = this.getItem(elements[i]);
        if (item) {
          items[item.id] = item;
        }
      }
      const traitItems = this.traitsToItems[trait] || {};
      const itemsToRemoveTrait = [];
      let id = void 0;
      for (id in traitItems) {
        if (traitItems.hasOwnProperty(id)) {
          if (items.hasOwnProperty(id)) {
            delete items[id];
          } else {
            itemsToRemoveTrait.push(traitItems[id]);
          }
        }
      }
      for (var i = 0, len = itemsToRemoveTrait.length; i < len; i++) {
        item = itemsToRemoveTrait[i];
        item.removeTrait(trait);
        delete traitItems[item.id];
      }
      for (id in items) {
        if (items.hasOwnProperty(id)) {
          item = items[id];
          item.addTrait(trait);
          traitItems[id] = item;
        }
      }
      this.traitsToItems[trait] = traitItems;
    }
  };
  TreeModel.prototype.getElementsWithTrait = function (trait, includeHidden) {
    const elements = [];
    const items = this.traitsToItems[trait] || {};
    let id;
    for (id in items) {
      if (items.hasOwnProperty(id) && (items[id].isVisible() || includeHidden)) {
        elements.push(items[id].getElement());
      }
    }
    return elements;
  };
  TreeModel.prototype.dispose = function () {
    this.registry.dispose();
    this._onSetInput.dispose();
    this._onDidSetInput.dispose();
    this._onRefresh.dispose();
    this._onDidRefresh.dispose();
    this._onDidHighlight.dispose();
    this._onDidSelect.dispose();
    this._onDidFocus.dispose();
    this._onDidRevealItem.dispose();
    this._onExpandItem.dispose();
    this._onDidExpandItem.dispose();
    this._onCollapseItem.dispose();
    this._onDidCollapseItem.dispose();
    this._onDidAddTraitItem.dispose();
    this._onDidRemoveTraitItem.dispose();
    this._onDidRefreshItem.dispose();
    this._onRefreshItemChildren.dispose();
    this._onDidRefreshItemChildren.dispose();
    this._onDidDisposeItem.dispose();
  };
  return TreeModel;
}());
export { TreeModel };
