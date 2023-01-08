/* eslint-disable */
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { ArrayIterator } from './common/iterator.js';

const HeightMap = /** @class */ (function () {
  function HeightMap() {
    this.heightMap = [];
    this.indexes = {};
  }
  HeightMap.prototype.getContentHeight = function () {
    const last = this.heightMap[this.heightMap.length - 1];
    return !last ? 0 : last.top + last.height;
  };
  HeightMap.prototype.onInsertItems = function (iterator, afterItemId) {
    if (afterItemId === void 0) { afterItemId = null; }
    let item = null;
    let viewItem;
    let i; let
      j;
    let totalSize;
    let sizeDiff = 0;
    if (afterItemId === null) {
      i = 0;
      totalSize = 0;
    } else {
      i = this.indexes[afterItemId] + 1;
      viewItem = this.heightMap[i - 1];
      if (!viewItem) {
        console.error('view item doesnt exist');
        return undefined;
      }
      totalSize = viewItem.top + viewItem.height;
    }
    const boundSplice = this.heightMap.splice.bind(this.heightMap, i, 0);
    const itemsToInsert = [];
    while (item = iterator.next()) {
      viewItem = this.createViewItem(item);
      viewItem.top = totalSize + sizeDiff;
      this.indexes[item.id] = i++;
      itemsToInsert.push(viewItem);
      sizeDiff += viewItem.height;
    }
    boundSplice.apply(this.heightMap, itemsToInsert);
    for (j = i; j < this.heightMap.length; j++) {
      viewItem = this.heightMap[j];
      viewItem.top += sizeDiff;
      this.indexes[viewItem.model.id] = j;
    }
    for (j = itemsToInsert.length - 1; j >= 0; j--) {
      this.onInsertItem(itemsToInsert[j]);
    }
    for (j = this.heightMap.length - 1; j >= i; j--) {
      this.onRefreshItem(this.heightMap[j]);
    }
    return sizeDiff;
  };
  HeightMap.prototype.onInsertItem = function (item) {
    // noop
  };
  // Contiguous items
  HeightMap.prototype.onRemoveItems = function (iterator) {
    let itemId = null;
    let viewItem;
    let startIndex = null;
    let i = 0;
    let sizeDiff = 0;
    while (itemId = iterator.next()) {
      i = this.indexes[itemId];
      viewItem = this.heightMap[i];
      if (!viewItem) {
        console.error('view item doesnt exist');
        return;
      }
      sizeDiff -= viewItem.height;
      delete this.indexes[itemId];
      this.onRemoveItem(viewItem);
      if (startIndex === null) {
        startIndex = i;
      }
    }
    if (sizeDiff === 0 || startIndex === null) {
      return;
    }
    this.heightMap.splice(startIndex, i - startIndex + 1);
    for (i = startIndex; i < this.heightMap.length; i++) {
      viewItem = this.heightMap[i];
      viewItem.top += sizeDiff;
      this.indexes[viewItem.model.id] = i;
      this.onRefreshItem(viewItem);
    }
  };
  HeightMap.prototype.onRemoveItem = function (item) {
    // noop
  };
  HeightMap.prototype.onRefreshItemSet = function (items) {
    const _this = this;
    const sortedItems = items.sort((a, b) => _this.indexes[a.id] - _this.indexes[b.id]);
    this.onRefreshItems(new ArrayIterator(sortedItems));
  };
  // Ordered, but not necessarily contiguous items
  HeightMap.prototype.onRefreshItems = function (iterator) {
    let item = null;
    let viewItem;
    let newHeight;
    let i; let
      j = null;
    let cummDiff = 0;
    while (item = iterator.next()) {
      i = this.indexes[item.id];
      for (; cummDiff !== 0 && j !== null && j < i; j++) {
        viewItem = this.heightMap[j];
        viewItem.top += cummDiff;
        this.onRefreshItem(viewItem);
      }
      viewItem = this.heightMap[i];
      newHeight = item.getHeight();
      viewItem.top += cummDiff;
      cummDiff += newHeight - viewItem.height;
      viewItem.height = newHeight;
      this.onRefreshItem(viewItem, true);
      j = i + 1;
    }
    if (cummDiff !== 0 && j !== null) {
      for (; j < this.heightMap.length; j++) {
        viewItem = this.heightMap[j];
        viewItem.top += cummDiff;
        this.onRefreshItem(viewItem);
      }
    }
  };
  HeightMap.prototype.onRefreshItem = function (item, needsRender) {
    if (needsRender === void 0) { needsRender = false; }
    // noop
  };
  HeightMap.prototype.indexAt = function (position) {
    let left = 0;
    let right = this.heightMap.length;
    let center;
    let item;
    // Binary search
    while (left < right) {
      center = Math.floor((left + right) / 2);
      item = this.heightMap[center];
      if (position < item.top) {
        right = center;
      } else if (position >= item.top + item.height) {
        if (left === center) {
          break;
        }
        left = center;
      } else {
        return center;
      }
    }
    return this.heightMap.length;
  };
  HeightMap.prototype.indexAfter = function (position) {
    return Math.min(this.indexAt(position) + 1, this.heightMap.length);
  };
  HeightMap.prototype.itemAtIndex = function (index) {
    return this.heightMap[index];
  };
  HeightMap.prototype.itemAfter = function (item) {
    return this.heightMap[this.indexes[item.model.id] + 1] || null;
  };
  HeightMap.prototype.createViewItem = function (item) {
    throw new Error('not implemented');
  };
  HeightMap.prototype.dispose = function () {
    this.heightMap = [];
    this.indexes = {};
  };
  return HeightMap;
}());
export { HeightMap };
