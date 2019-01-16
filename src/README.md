# What is it

# Why is has been created

# Benefits

# Limitations

## HMR aren't supported

# Configuration

# Usage examples

# API References

# Required config props

-   configureStore
    -   must return redux store
    -   NOTE: also imports root reducer, saga, setups middlewares and enhancers
-   path or import function to root selector

---

# Challanges I've met with

## Fully dynamic `import()` isn't supported

Therefore modules can't be dynamically loaded inside a worker.

### Why it was required?

`create` method would received path to root selector and path to `configureStore` file. Then these paths would be sent to worker where they would be dynamically loaded as whole modules.

## Inline worker is possible to create, but without dependencies

Inline worker is possible create as follows:

```js
const fn = () => {
    // worker content
};
const blob = new Blob([`(${fn})()`], {
    type: 'text/javascript',
});
const url = window.URL.createObjectURL(blob);
const worker = new Worker(url);
```

however, if the `fn` function would required external dependencies, I haven't found any way to pass those dependencies inside the worker context of the `fn` function.

## Container must be signed with (unique) key

`connectWorker` is designed to be as much similar to `connect` method from `react-redux` as possible. But there're some differences, since we've moved the redux store to a web worker.

`connectWorker(key: String, [mapDispatchToProps: Function|Object], [ownPropsSelector: Function]) => React Component`

So anytime you use `connectWorker`, you pass unique key as first argument. `connectWorker` creates bridge between the worker and the container, where each message is signed with that key.

`mapStateToProps` is placed in separated file, because it runs in the worker thread and if we'd placed at the same file with `connectWorker`, then circular dependency would occure.

`ownPropsSelector` is function for selecting component props that will be sent to the worker and passed as 2nd argument to the `mapStateToProps` function. Since we need to send them to the worker, we want to lower the payload as must as possible and send only necessary props (e.g. `ownPropsSelector` would select user ID, the ID is then used for selecting only required user from the state and sending the user back from the worker the to the component).
