/**
 * 轻量级 DOM 包装器 - 类似 Vue 3 ref 的简单实现
 * 提供链式调用和简洁的 DOM 操作 API
 */

/**
 * DOM 引用包装类
 * @example
 * const el = ref(".world-relate");
 * el.html("<div>content</div>")   // 设置 HTML
 *   .addClass("active")            // 添加 class
 *   .hide();                        // 隐藏元素
 *
 * el.text("hello")                 // 设置文本
 *   .show();                        // 显示元素
 */
export class DOMRef {
  #element;

  constructor(selector) {
    if (typeof selector === 'string') {
      this.#element = document.querySelector(selector);
      if (!this.#element) {
        console.warn(`DOMRef: 未找到元素 "${selector}"`);
      }
    } else {
      this.#element = selector;
    }
  }

  // ========== 内容操作 ==========

  /**
   * 设置或获取 HTML 内容
   * @param {string} [content] - 如果提供，设置 HTML；否则获取当前 HTML
   * @returns {DOMRef|string} - 返回 this 用于链式调用，获取时返回 HTML 字符串
   */
  html(content) {
    if (content === undefined) {
      return this.#element?.innerHTML || '';
    }
    if (this.#element) {
      this.#element.innerHTML = content;
    }
    return this;
  }

  /**
   * 设置或获取文本内容
   * @param {string} [content] - 如果提供，设置文本；否则获取当前文本
   * @returns {DOMRef|string}
   */
  text(content) {
    if (content === undefined) {
      return this.#element?.textContent || '';
    }
    if (this.#element) {
      this.#element.textContent = content;
    }
    return this;
  }

  /**
   * 清空内容
   * @returns {DOMRef}
   */
  clear() {
    if (this.#element) {
      this.#element.innerHTML = '';
    }
    return this;
  }

  // ========== 类名操作 ==========

  /**
   * 添加类名
   * @param {string|string[]} classes - 类名或类名数组
   * @returns {DOMRef}
   */
  addClass(...classes) {
    if (this.#element) {
      classes.forEach(cls => {
        if (typeof cls === 'string') {
          this.#element.classList.add(...cls.split(' '));
        } else if (Array.isArray(cls)) {
          this.#element.classList.add(...cls);
        }
      });
    }
    return this;
  }

  /**
   * 移除类名
   * @param {string|string[]} classes
   * @returns {DOMRef}
   */
  removeClass(...classes) {
    if (this.#element) {
      classes.forEach(cls => {
        if (typeof cls === 'string') {
          this.#element.classList.remove(...cls.split(' '));
        } else if (Array.isArray(cls)) {
          this.#element.classList.remove(...cls);
        }
      });
    }
    return this;
  }

  /**
   * 切换类名
   * @param {string} className
   * @returns {DOMRef}
   */
  toggleClass(className) {
    if (this.#element) {
      this.#element.classList.toggle(className);
    }
    return this;
  }

  /**
   * 检查是否有某个类名
   * @param {string} className
   * @returns {boolean}
   */
  hasClass(className) {
    return this.#element?.classList.contains(className) || false;
  }

  // ========== 显示隐藏 ==========

  /**
   * 显示元素
   * @returns {DOMRef}
   */
  show() {
    return this.removeClass('hide');
  }

  /**
   * 隐藏元素
   * @returns {DOMRef}
   */
  hide() {
    return this.addClass('hide');
  }

  /**
   * 切换显示隐藏
   * @returns {DOMRef}
   */
  toggle() {
    return this.toggleClass('hide');
  }

  /**
   * 检查是否隐藏
   * @returns {boolean}
   */
  isHidden() {
    return this.hasClass('hide');
  }

  // ========== 属性操作 ==========

  /**
   * 设置或获取属性
   * @param {string} attr - 属性名
   * @param {string} [value] - 属性值，undefined 则获取
   * @returns {DOMRef|string}
   */
  attr(attr, value) {
    if (value === undefined) {
      return this.#element?.getAttribute(attr) || '';
    }
    if (this.#element) {
      this.#element.setAttribute(attr, value);
    }
    return this;
  }

  /**
   * 设置多个属性
   * @param {Object} attrs - 属性对象
   * @returns {DOMRef}
   */
  attrs(attrs) {
    if (this.#element) {
      Object.entries(attrs).forEach(([key, value]) => {
        this.#element.setAttribute(key, value);
      });
    }
    return this;
  }

  // ========== 样式操作 ==========

  /**
   * 设置或获取 CSS 样式
   * @param {string|Object} prop - CSS 属性名或样式对象
   * @param {string} [value] - 属性值
   * @returns {DOMRef|string}
   */
  css(prop, value) {
    if (typeof prop === 'object') {
      if (this.#element) {
        Object.assign(this.#element.style, prop);
      }
      return this;
    }

    if (value === undefined) {
      return this.#element ? getComputedStyle(this.#element).getPropertyValue(prop) : '';
    }

    if (this.#element) {
      this.#element.style[prop] = value;
    }
    return this;
  }

  // ========== 事件操作 ==========

  /**
   * 绑定事件
   * @param {string} event - 事件名
   * @param {Function} handler - 事件处理函数
   * @returns {DOMRef}
   */
  on(event, handler) {
    if (this.#element) {
      this.#element.addEventListener(event, handler);
    }
    return this;
  }

  /**
   * 移除事件
   * @param {string} event - 事件名
   * @param {Function} handler - 事件处理函数
   * @returns {DOMRef}
   */
  off(event, handler) {
    if (this.#element) {
      this.#element.removeEventListener(event, handler);
    }
    return this;
  }

  /**
   * 触发事件
   * @param {string} event - 事件名
   * @returns {DOMRef}
   */
  trigger(event) {
    if (this.#element) {
      this.#element.dispatchEvent(new Event(event));
    }
    return this;
  }

  // ========== 查询操作 ==========

  /**
   * 在当前元素内查询子元素
   * @param {string} selector
   * @returns {DOMRef}
   */
  find(selector) {
    const child = this.#element?.querySelector(selector);
    return new DOMRef(child);
  }

  /**
   * 获取原生 DOM 元素
   * @returns {Element}
   */
  el() {
    return this.#element;
  }

  /**
   * 检查元素是否存在
   * @returns {boolean}
   */
  exists() {
    return this.#element !== null && this.#element !== undefined;
  }
}

/**
 * 便捷函数：创建 DOM 引用
 * @param {string|Element} selector
 * @returns {DOMRef}
 */
export function ref(selector) {
  return new DOMRef(selector);
}

/**
 * DOM 引用集合 - 管理多个常用 DOM 元素
 * @example
 * const dom = createDOMRefs({
 *   relate: '.world-relate',
 *   phonetic: '.world-phonetic',
 *   mean: '.world-mean'
 * });
 *
 * dom.relate.html('<div>content</div>').show();
 * dom.phonetic.text('pronunciation').addClass('active');
 */
export function createDOMRefs(selectors) {
  const refs = {};
  Object.entries(selectors).forEach(([key, selector]) => {
    refs[key] = ref(selector);
  });
  return refs;
}
