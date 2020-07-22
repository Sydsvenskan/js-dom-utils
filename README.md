# DOM Utils

Basic small typed DOM helpers that aids in the creation of vanilla JS code.

Makes it easy to query, create and modify DOM-nodes – consider it a mini-`jQuery`. Somewhat inspired by [Bliss.js](http://blissfuljs.com/).

## Installation

```bash
yarn add @hdsydsvenskan/dom-utils
```

## Release new version

Follow [Semantic Versioning](http://semver.org/) and use [np](https://www.npmjs.com/package/np) and a version like `patch | minor | major | prepatch | preminor | premajor | prerelease | 1.2.3`

```bash
np patch
```

## Usage

```javascript
import {
  $,
  createChild
} from '@hdsydsvenskan/dom-utils';

const elem = $('.a-nice-selector');

createChild(elem, 'div', 'a-nice-selector__bemish-elem', 'With some nice text in it');
```
