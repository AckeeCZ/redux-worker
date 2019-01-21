# Design Iterations

## The initial configuration of `redux-worker`

The initial configuration looked like this:

```js
// your-project/src/redux-worker/config.js
import { configure } from '@ackee/redux-worker';

const createStoreWorker = () =>
    new Worker('./path-to-store-worker', {
        type: 'module',
    });

const { connectWorker } = configure(createStoreWorker);

export { connectWorker };
```

So what are actually looking at?

-   The store worker is created (details aren't important at this moment).
-   The `configure` method is called once within a project. **And it connects the main thread with worker thread**.
-   Once the connection is established between these contexts, it's possible to use the `connectWorker` HOC to connect a React component with Redux store placed at the store worker.
-   This works perfectly well within the project, but what about scenerio when you have node module, that needs to be connected to Redux store? **Would it be possible to use `connectWorker` in the node modules**? Well, it wouldn't, at least not with this design.

Before I introduce you to a solution that tackles this design issue, here is why I designed it this way initially:

-   There is a sequence that is going strictly chronologically:
    -   configure method is called
        -   worker adapter creates store worker
            -   redux store is created
            -   all mapStateToProps selectors are loaded / imported
            -   on message event listener is setup
        -   (optional) task duration watcher is started - worker starts report it self to the main thread
        -   options are send to the worker
        -   `connectWorker` HOC is returned
    -   then the `connectWorker` is called (**it can't be called before, because it's returned by the configure method**)

This design solves the issue that `configure` method must be called before the `connectWorker`. However we can't use it in node modules.

New design - with the requirement that `connectWorker` has to able to be used in node modules:
The new solution could on abstract level look like this:

> `connectWorker` is called, if the store worker is available, the new bridge between the container and the worker is created as before. If the worker isn't available, then the creation of the bridge should be queue and processed when `configure` method is called.
