// @ts-check

'use strict';

/** @type {(str: string) => string} */
const capitalize = (str) =>
  str
    ? str[0].toUpperCase() + str.slice(1)
    : '';

/** @type {(str: string) => string} */
const kebabToCamelCase = (str) =>
  (str || '')
    .split('-')
    .map((word, i) => i === 0 ? word : capitalize(word))
    .join('');

// $ and $$ matches http://blissfuljs.com/

/** @typedef {Document|DocumentFragment|Element} ElementContainer */

/**
 * @param {Node} elem
 * @returns {ElementContainer|undefined}
 */
export const ensureElementContainer = function (elem) {
  if (elem instanceof Document) return elem;
  if (elem instanceof DocumentFragment) return elem;
  if (elem instanceof Element) return elem;
};

/**
 * @template {Node} T
 * @param {T} elem
 * @returns {(T & HTMLElement)|undefined}
 */
export const ensureHTMLElement = function (elem) {
  if (elem.nodeType !== Node.ELEMENT_NODE) return;
  if (elem instanceof HTMLElement) return elem;
};

/**
 * @template {Node} T
 * @param {T[]} elems
 * @returns {(T & HTMLElement)[]}
 */
export const ensureHTMLElements = (elems) => {
  /** @type {(T & HTMLElement)[]} */
  const purified = [];

  return elems.reduce((result, elem) => {
    if (elem instanceof HTMLElement) result.push(elem);
    return result;
  }, purified);
};

/**
 * @template {string|Node[]|NodeListOf<Node>} T
 * @param {T} selector
 * @param {ElementContainer} [context]
 * @returns {import('./advanced-types').TypeOf$<T>[]}
 */
export const $$ = function (selector, context) {
  const result = typeof selector === 'string'
    ? (context || document).querySelectorAll(selector)
    : selector;

  // @ts-ignore
  return result instanceof NodeList ? ensureHTMLElements([...result]) : [];
};

/**
 * @template {string|Node} T
 * @param {T} selector
 * @param {ElementContainer} [context]
 * @returns {import('./advanced-types').TypeOf$<T>|undefined}
 */
export const $ = function (selector, context) {
  const result = typeof selector === 'string'
    ? (context || document).querySelector(selector) || undefined
    : selector;

  // @ts-ignore
  return result instanceof Node ? ensureHTMLElement(result) : undefined;
};

/**
 * @param {Element} tag
 * @param {string} text
 */
export const addText = function (tag, text) {
  String(text).split('\n').forEach(function (text, index) {
    if (index !== 0) { createChild(tag, 'br'); }
    appendChild(tag, document.createTextNode(text));
  });
};

/** @type {(elem: Element, className: string) => boolean} */
export const hasClass = (elem, className) => elem.classList ? elem.classList.contains(className) : false;

/** @type {(elem: Element, className: string) => void} */
export const removeClass = (elem, className) => elem.classList.remove(className);

/** @type {(elem: Element, className: string) => void} */
export const addClass = (elem, className) => elem.classList.add(className);

/** @type {(elem: Element, className: string) => void} */
export const toggleClass = (elem, className) => { elem.classList.toggle(className); };

/**
 * @deprecated Do not use, will get removed in future versions
 * @param {Element} elem
 * @param {string} className
 * @param {number} [timeoutMs]
 */
export const transitionOut = function (elem, className, timeoutMs = 2000) {
  const listener = function () {
    clearTimeout(timer);
    elem.removeEventListener('transitionend', listener);
    removeElement(elem);
  };
  const timer = setTimeout(listener, timeoutMs);
  elem.addEventListener('transitionend', listener);
  addClass(elem, className);
};

/**
 * @param {ElementContainer} elem
 * @param {...Node} children
 */
export const appendChild = function (elem, ...children) {
  for (const child of children) {
    elem.append(child);
  }
};

/** @typedef {{ [attributeName: string]: string }} AttributesList */

/**
 * @param {Element} elem
 * @param {AttributesList} attributes
 */
export const setAttributes = (elem, attributes) => {
  for (const attribute of Object.keys(attributes)) {
    if (attributes[attribute]) {
      elem.setAttribute(attribute, attributes[attribute]);
    }
  }
};

/**
 * @deprecated Use element.remove() instead
 * @param {Element} elem
 * @returns {void}
 */
export const removeElement = (elem) => elem.remove ? elem.remove() : undefined;

/**
 * @param {ElementContainer} elem
 */
export const emptyElement = function (elem) {
  while (elem.firstChild) {
    elem.firstChild.remove();
  }
};

/**
 * @param {HTMLElement} elem
 * @param {string} attribute kebabCase
 * @returns {string|undefined}
 */
export const getDataAttribute = function (elem, attribute) {
  attribute = kebabToCamelCase(attribute);
  return elem.dataset[attribute];
};

/**
 * @param {HTMLElement} elem
 * @param {string} attribute kebabCase
 * @param {string} value
 */
export const setDataAttribute = function (elem, attribute, value) {
  attribute = kebabToCamelCase(attribute);
  elem.dataset[attribute] = value;
};

/**
 * @param {string} tag
 * @param {string|string[]|AttributesList} [className]
 * @param {string} [text]
 * @returns {HTMLElement}
 */
export const createElement = function (tag, className, text) {
  const newElem = document.createElement(tag);

  if (className) {
    if (typeof className === 'object' && !Array.isArray(className)) {
      setAttributes(newElem, className);
    } else {
      newElem.className = Array.isArray(className)
        ? className.join(' ')
        : className;
    }
  }

  if (text) {
    addText(newElem, text);
  }

  return newElem;
};

/**
 * @param {ElementContainer} elem
 * @param {string} tag
 * @param {string|string[]|AttributesList} [className]
 * @param {string} [text]
 * @returns {HTMLElement}
 */
export const createChild = function (elem, tag, className, text) {
  const child = createElement(tag, className, text);
  appendChild(elem, child);
  return child;
};

/**
 * @param {Node} elem
 * @param {string} className
 * @returns {HTMLElement|undefined}
 */
export const closestByClass = function (elem, className) {
  while (elem.parentNode && elem.parentNode instanceof Element) {
    elem = elem.parentNode;
    if (elem instanceof HTMLElement && elem.classList.contains(className)) {
      return elem;
    }
  }
};

/**
 * Like $(), but only for class names + checks whether any context itself matches and then returns that directly
 *
 * Useful in connection with things like dynamic features
 *
 * @param {string} className
 * @param {ElementContainer} [context]
 * @returns {HTMLElement|undefined}
 */
export const elemByClass = function (className, context) {
  if (context instanceof Element && hasClass(context, className)) return ensureHTMLElement(context);
  return $('.' + className, context);
};

/**
 * Like $$(), but only for class names + checks whether any context itself matches and then returns that directly
 *
 * Useful in connection with things like dynamic features
 *
 * @param {string} className
 * @param {ElementContainer} [context]
 * @returns {HTMLElement[]}
 */
export const elemsByClass = function (className, context) {
  if (context instanceof Element && hasClass(context, className)) return ensureHTMLElements([context]);
  return $$('.' + className, context);
};

/**
 * @template {Node} T
 * @param {Node} elem
 * @param {T} child
 * @returns {T}
 */
export const insertBefore = function (elem, child) {
  if (!elem.parentNode || !elem.parentNode.insertBefore) return child;

  elem.parentNode.insertBefore(child, elem);

  return child;
};
