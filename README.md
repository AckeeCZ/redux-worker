![ackee|redux-worker](https://img.ack.ee/ackee/image/github/js)

# [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/AckeeCZ/redux-worker/blob/master/LICENSE) [![CI Status](https://img.shields.io/travis/com/AckeeCZ/redux-worker.svg?style=flat)](https://travis-ci.com/AckeeCZ/redux-worker) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://reactjs.org/docs/how-to-contribute.html#your-first-pull-request) [![Dependency Status](https://img.shields.io/david/AckeeCZ/redux-worker.svg?style=flat-square)](https://david-dm.org/AckeeCZ/redux-worker)

# [WIP] redux-worker

React bindings for Redux, where Redux is placed at Web Worker.

### Main features

-   ...

> ### Requirements
>
> ...

---

## Table of contents

-   [Installing](#installing)
-   [Usage](#usage)
-   [API](#api)

---

## <a name="installing"></a>Installing

Using yarn:

```bash
$ yarn add @ackee/redux-worker
```

Using npm:

```bash
$ npm i -S @ackee/redux-worker
```

---

## <a name="usage"></a>Usage

---

### Initialization overview

```js
// ---------------------------------------
//  config/redux-worker/index.js
// ---------------------------------------
import * as ReduxWorker from '@ackee/redux-worker';

const createStoreWorker = () => {
    return new Worker('./Store.worker.js', {
        type: 'module',
        name: 'Store.worker', // optional, for easier debugging
    });
};

ReduxWorker.initialize(createStoreWorker);
```

```js
// ---------------------------------------
//  config/redux-worker/Store.worker.js
// ---------------------------------------
import { configureStoreWorker } from '@ackee/redux-worker';

import configureStore from './createStore';
import getContainerSelector from './getContainerSelectors';

configureStoreWorker(configureStore, getContainerSelector);
```

```js
// ---------------------------------------
//  config/redux-worker/configureStore.js
// ---------------------------------------
import { createStore } from 'redux';

const rootReducer = (state, action) => state;

export default function configureStore() {
    return createStore(rootReducer);
}
```

```js
// ---------------------------------------
//  config/redux-worker/getContainerSelectors.js
// ---------------------------------------
export default function getContainerSelecotors() {
    // import all files that match the regex pattern (e.g. 'Counter.selector.js')
    // require.context(pathToRoot, deepLookUp, regexPattern)
    // NOTE:
    // 1. pathToRoot may be also a webpack alias
    // 2. The path must include also node_modules, if any of them uses `connectWorker` HOC
    return require.context('../../../', true, /\.selector\.js$/);
}
```

## Examples

### Connecting to Redux state with `connectWorker` HOC

```js
// ---------------------------------------
//  modules/counter/constants/index.js
// ---------------------------------------
import { uniqueId } from '@ackee/redux-worker';

export const bridgeIds = {
    COUNTER_BRIDGE: uniqueId('COUNTER_BRIDGE'),
};

// ---------------------------------------
//  modules/counter/containers/Counter.js
// ---------------------------------------
import { connectWorker } from '@ackee/redux-worker';

import { bridgeIds } from '../constants';
import Counter from '../components/Counter';

const mapDispatchToProps = dispatch => ({
    // ...
});

export default connectWorker(bridgeIds.COUNTER_BRIDGE, mapDispatchToProps)(Counter);

// ---------------------------------------
//  containers/Counter.selector.js
// ---------------------------------------
import { registerSelector } from '@ackee/redux-worker';
import { bridgeIds } from '../constants';

const mapStateToProps = state => {
    return {
        // ...
    };
};

registerSelector(bridgeIds.COUNTER_BRIDGE, mapStateToProps);
```

### Rebooting unresponding store worker

```js
// ---------------------------------------
//  config/redux-worker/index.js
// ---------------------------------------
import * as ReduxWorker from '@ackee/redux-worker';

const createStoreWorker = () => {
    return new Worker('./Store.worker.js', {
        type: 'module',
        name: 'Store.worker',
    });
};

ReduxWorker.on(ReduxWorker.eventTypes.TASK_DURATION_TIMEOUT, async () => {
    // worker is terminated, then immediately booted again, new redux store is created
    await ReduxWorker.rebootWorker();
});

ReduxWorker.initialize(createStoreWorker);
```

---

## API
