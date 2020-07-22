// @ts-check

'use strict';

/**
 * @private
 * @param {string} str
 * @returns {string}
 */
const capitalize = (str) =>
  str
    ? str[0].toUpperCase() + str.slice(1)
    : '';

/**
 * @private
 * @param {string} str
 * @returns {string}
 */
const kebabToCamelCase = (str) =>
  (str || '')
    .split('-')
    .map((word, i) => i === 0 ? word : capitalize(word))
    .join('');

// $ and $$ matches http://blissfuljs.com/

/** @typedef {Document|DocumentFragment|Element} ElementContainer */

/**
 * Mostly for internal use. Ensures that the node is of an element container type, mostly helps type validation
 *
 * @param {Node} elem
 * @returns {ElementContainer|undefined}
 */
export const ensureElementContainer = function (elem) {
  if (elem instanceof Document) return elem;
  if (elem instanceof DocumentFragment) return elem;
  if (elem instanceof Element) return elem;
};

/**
 * Mostly for internal use. Ensures that the node is an actual HTML element, mostly helps type validation
 *
 * @template {Node} T
 * @param {T} elem
 * @returns {(T & HTMLElement)|undefined}
 */
export const ensureHTMLElement = function (elem) {
  if (elem.nodeType !== Node.ELEMENT_NODE) return;
  if (elem instanceof HTMLElement) return elem;
};

/**
 * Mostly for internal use. Ensures that a list of nodes only contains HTML elements, mostly helps type validation
 *
 * @template {Node} T
 * @param {T[]} elems
 * @returns {(T & HTMLElement)[]}
 */
export const ensureHTMLElements = (elems) => {
  /**
   * @private
   * @type {(T & HTMLElement)[]}
   */
  const purified = [];

  return elems.reduce((result, elem) => {
    if (elem instanceof HTMLElement) result.push(elem);
    return result;
  }, purified);
};

/**
 * Get an array of HTML elements that matches the specified selector
 *
 * @template {string|Node[]|NodeListOf<Node>} T
 * @param {T} selector
 * @param {ElementContainer} [context] If set, only looks up elements within the context container
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
 * Like {@link $$}, but returns only a single HTML element
 *
 * If one needs to match against the context container element itself, then use {@link elemByClass} instead
 *
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
 * Adds text nodes to the supplied element, persisting newlines by adding br elements for each newline
 *
 * @param {Element} elem
 * @param {string} text
 */
export const addText = function (elem, text) {
  String(text).split('\n').forEach(function (text, index) {
    if (index !== 0) { createChild(elem, 'br'); }
    appendChild(elem, document.createTextNode(text));
  });
};

/**
 * @param {Element} elem
 * @param {string} className
 * @returns {boolean}
 */
export const hasClass = (elem, className) => elem.classList ? elem.classList.contains(className) : false;

/**
 * @param {Element} elem
 * @param {string} className
 * @returns {void}
 */
export const removeClass = (elem, className) => elem.classList.remove(className);

/**
 * @param {Element} elem
 * @param {string} className
 * @returns {void}
 */
export const addClass = (elem, className) => elem.classList.add(className);

/**
 * @param {Element} elem
 * @param {string} className
 * @returns {void}
 */
export const toggleClass = (elem, className) => { elem.classList.toggle(className); };

/**
 * Helper to append many children nodes at once
 *
 * @param {ElementContainer} elem
 * @param {...Node} children
 */
export const appendChild = function (elem, ...children) {
  for (const child of children) {
    elem.append(child);
  }
};

/**
 * Helper to easily set a collection of attributes
 *
 * @param {Element} elem
 * @param {{ [attributeName: string]: string }} attributes
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
 * Iterates over all children in a container and removes them all
 *
 * @param {ElementContainer} elem
 */
export const emptyElement = function (elem) {
  while (elem.firstChild) {
    elem.firstChild.remove();
  }
};

/**
 * Helper that makes one don't have to do kebab case conversion oneself
 *
 * @param {HTMLElement} elem
 * @param {string} attribute Should be in kebab case
 * @returns {string|undefined}
 */
export const getDataAttribute = function (elem, attribute) {
  attribute = kebabToCamelCase(attribute);
  return elem.dataset[attribute];
};

/**
 * Helper that makes one don't have to do kebab case conversion oneself
 *
 * @param {HTMLElement} elem
 * @param {string} attribute Should be in kebab case
 * @param {string} value
 */
export const setDataAttribute = function (elem, attribute, value) {
  attribute = kebabToCamelCase(attribute);
  elem.dataset[attribute] = value;
};

/**
 * Helper to easily create a new HTML element, with all that one would need for that
 *
 * @param {string} tag
 * @param {string|string[]|{ [attributeName: string]: string }} [classNameOrAttributes]
 * @param {string} [text]
 * @returns {HTMLElement}
 */
export const createElement = function (tag, classNameOrAttributes, text) {
  const newElem = document.createElement(tag);

  if (classNameOrAttributes) {
    if (typeof classNameOrAttributes === 'object' && !Array.isArray(classNameOrAttributes)) {
      setAttributes(newElem, classNameOrAttributes);
    } else {
      newElem.className = Array.isArray(classNameOrAttributes)
        ? classNameOrAttributes.join(' ')
        : classNameOrAttributes;
    }
  }

  if (text) {
    addText(newElem, text);
  }

  return newElem;
};

/**
 * Like {@link createElement}, but also appends the created element to a container
 *
 * Helpful when creating multiple elements within one another as one can then send the result of one as the container to the other.
 *
 * @param {ElementContainer} elem
 * @param {string} tag
 * @param {string|string[]|{ [attributeName: string]: string }} [classNameOrAttributes]
 * @param {string} [text]
 * @returns {HTMLElement}
 */
export const createChild = function (elem, tag, classNameOrAttributes, text) {
  const child = createElement(tag, classNameOrAttributes, text);
  appendChild(elem, child);
  return child;
};

/**
 * Iterates over the parents of a node and returns the first one that has the specified class name
 *
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
 * Like {@link $}, but with class name rather than selector + also matches against the context itself, not just elements within it
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
 * Like {@link elemByClass} but replaces {@link $$} instead and either returns the context itself if it matches, or a list of matching elements within it
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
