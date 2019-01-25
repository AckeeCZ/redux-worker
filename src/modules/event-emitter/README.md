# EventEmitter

Simple event emitter for internal custom event types.

## `#on(eventType: Symbol|String, handler: Function) => unsubscribe: Function`

Add an event listener. Unsubscribe method is returned.

```js
function workerTerminatedHandler() {
    console.log('Worker was terminated.');
}

const unsubscribe = eventEmitter.on(eventTypes.WORKER_TERMINATED, workerTerminatedHandler);
```

## `#off(eventType: Symbol|String, handler: Function): Boolean`

Remove an event listener.

```js
// remove exactly one event listener:
const wasRemoved = eventEmitter.off(eventTypes.WORKER_TERMINATED, handler);

// remove all event listener with that event type:
const wereRemoved = eventEmitter.off(eventTypes.WORKER_TERMINATED);
```

## `#emit(eventType: Symbol|String): void`

Trigger all listeners regitered under the `eventType`.

```js
eventEmitter.emit(eventTypes.WORKER_TERMINATED);
```

## Available event types

-   `WORKER_TERMINATED` - Triggered when the store worker is terminated.
-   `WORKER_BOOTED` - Triggered when the store worker is created.
-   `TASK_DURATION_TIMEOUT` - Triggered when the store worker task duration timeout was fired. This is because of the worker stopped responding.

## Example

```js
const emitter = new EventEmitter();

emitter.on(eventTypes.WORKER_TERMINATED, () => {
    console.log('worker terminated');
});

emitter.emit(eventTypes.WORKER_TERMINATED);
```
