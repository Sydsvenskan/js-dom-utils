/// <reference lib="dom"/>

import {
  expectAssignable,
  expectType
} from 'tsd';

import dom = require('..');

// This file will never run, it's used with the "tsd" tool validate types

const {
  ensureHTMLElement,
  ensureHTMLElements,
  $,
  getDataAttribute
} = dom;

const elem0 = document.getElementById('foo');

if (elem0) {
  const node = elem0.parentNode;
  expectType<(Node & ParentNode)|null>(node);

  // ******* ensureHTMLElement *******
  expectType<HTMLElement|undefined>(ensureHTMLElement(elem0));
  node && expectType<HTMLElement|undefined>(ensureHTMLElement(elem0));

  // ******* ensureHTMLElement *******
  expectType<HTMLElement[]>(ensureHTMLElements([elem0]));
  node && expectType<HTMLElement[]>(ensureHTMLElements([elem0]));
}

// ******* $ *******

const elem = $('.wow');

expectType<HTMLElement|undefined>(elem);
expectAssignable<Element|undefined>(elem);
expectAssignable<Node|undefined>(elem);

// ******* $ + getDataAttribute *******

const attribute = elem && getDataAttribute(elem, 'foo');

expectType<string|undefined>(attribute);


