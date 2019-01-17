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

#### <a name="configure"></a>`configure(storeWorker, config: Object) => Object`

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

const { connectWorker } = ReduxWorker.configure(createStoreWorker);

export { connectWorker };
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
    // import all files that match the regex pattern (e.g. 'Counter.mapStateToProps.js')
    // require.context(pathToRoot, deepLookUp, regexPattern)
    // NOTE: pathToRoot may be also a webpack alias
    return require.context('../../', true, /\.mapStateToProps\.js$/);
}
```

## Examples

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

const { connectWorker, storeWorker } = ReduxWorker.configure(createStoreWorker);

storeWorker.on(storeWorker.eventTypes.TASK_DURATION_TIMEOUT, async () => {
    // worker is terminated, then immediately booted again, new redux store is created
    // and therefore app is reseted to initial state
    await storeWorker.reboot();
});

export { connectWorker };
```

---

## API
