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
-   [API - Window context](#api-window)
    -   [initialize](#api-window-initialize)
    -   [connectWorker](#api-window-connectWorker)
    -   [terminateWorker](#api-window-terminateWorker)
    -   [bootWorker](#api-window-bootWorker)
    -   [rebootWorker](#api-window-rebootWorker)
    -   [on](#api-window-on)
    -   [off](#api-window-off)
    -   [eventTypes](#api-window-eventTypes)
-   [API - Worker context](#api-worker)
    -   [configureStoreWorker](#api-worker-confifureStoreWorker)
    -   [registerSelector](#api-worker-registerSelector)
    -   [executeInWindow](#api-worker-executeInWindow)
-   [API - Unspecified context](#api)
    -   [uniqueId](#api-uniqueId)

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

ReduxWorker.initialize(createStoreWorker, {
    taskDurationWatcher: {
        enabled: true,
    },
});
```

---

## <a name="api-window"></a>API - Window context

### <a name="api-window-initialize"></a>`async initialize(createStoreWorker, [config]): void`

What does it do:

-   Store worker is booted (Redux Store is created).
-   An configuration object is created and sent to the worker.
-   The task duration watcher is started.
-   The window bridge is initialized (see [`executeInWindow`](#api-worker-executeInWindow) section).

#### Parameters

-   `createStoreWorker: Function` - Function that returns new store worker.
-   `config: Object` optional with following defaults:

    ```js
    {
        taskDurationWatcher: {
            enabled: process.env.NODE_ENV !== 'development',

            /* If the store worker doesn't report itself
               in 4s to the main thread, then the worker is considered to be non-responding and the ReduxWorker.eventTypes.TASK_DURATION_TIMEOUT event is fired. */
            unrespondingTimeout: 1000 * 4, // ms

            /* How often should the store worker report itself to the tasksDurationWatcher module. Note that each report resets the unrespondingTimeout.
            So reportStatusInPeriod + messageHopDelay <  unrespondingTimeout.
            */
            reportStatusInPeriod: 1000 * 3, // ms
        }
    }
    ```

#### Example

```js
// ...

ReduxWorker.initialize(createStoreWorker).then(() => {
    console.log('Store worker is ready');
});
```

#### Notes

-   This method can be called only once, otherwise an error is thrown.
-   The `connectWorker` HOC can be safely used before this method is called. But since the store worker isn't ready at that moment, nothing will be rendered and all incoming messages to the worker are going to be queued.

---

### <a name="api-window-connectWorker"></a>`connectWorker(bridgeId, [mapDispatchToProps], [ownPropsSelector]): React.Component`

What does it do:

-   Creates a new bridge to store worker.
-   TODO

#### Parameters

-   `bridgeId: String` - An unique ID among other instances of `connectWorker`. See helper utility [`uniqueId`](#api-uniqueId)
-   `mapDispatchToProps: Function|Object`
    -   `Function`: 1st argument is dispatch method that send Redux actions to the store worker. 2nd argument is `ownProps` object which is returned from `ownPropSelector`.
    -   `Object`: Properties are Redux action creators.
-   `ownPropsSelector: Function` - Function that receives all component props and returns props that are only required in the `mapDispatchToProps` and `mapStateToProps` (e.g. `userId`).

### Returns

A React component wrapped by `connectWorker` HOC.

#### Example

```js
// --------------------
// Foo.js (main thread context)
// --------------------
import { connectWorker } from '@ackee/redux-worker';
import Foo from '../components/Foo';

const mapDispatchToProps = (dispatch, selectedOwnProps) => ({
    // ...
});

const ownPropSelector = componentProps => ({
    // ...
});

// The mapStateToProps selector is placed at `Foo.selector.js` file
export default connectWorker('FOO_BRIDGE', mapDispatchToProps, ownPropsSelector)(Foo);
```

```js
// --------------------
// Foo.selector.js (worker context)
// --------------------
import { registerSelector } from '@ackee/redux-worker';

const mapStateToProps = (state, selectedOwnProps) => ({
    // ...
});

registerSelector('FOO_BRIDGE', mapStateToProps);
```

## API - Worker context

### <a name="api-worker-registerSelector"></a>`registerSelector(bridgeId, mapStateToProps): void`

### <a name="api-worker-executeInWindow"></a>`async executeInWindow(pathToProperty, [args]): any`

## API - unspecified context

### <a name="api-uniqueId"></a>`unqiueId(void): String`
