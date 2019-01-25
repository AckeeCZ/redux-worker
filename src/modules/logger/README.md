# `logger`

A wrapper around the `console` object that adds some custom functionality such as:

-   Respect current log level.
-   The log level can be changed dynamically by method called `setLogLevel`.
-   Enqueue any incoming logs until the `setLogLevel` method is called.
-   There're three log types: `error`, `warn` and `info`.

## API

### `logLevels: Objects`

An object containing following log levels:

`INFO > WARN > ERROR > SILENT`

```js
const logLevels = {
    SILENT: 0, // logs out nothing
    ERROR: 1, // logs out console.error
    WARN: 2, // logs out console.(error|warn)
    INFO: 3, // logs out console.(warn|error|log\info)
};
```

### `setLogLevel(logLevel: Number): void`

Dynamically sets the log level.

> You have to call it at least once to initialize the logger. Until then, all logs (calls of `error`, `warn` or `info`) are enqueued. When the logger is initialize, the queue is processed and cleared.

```js
// log nothing, disable the logger completely
setLogLevel(logLevels.SILENT);
```

### `error(any): void`

Wrapper around `console.error` method. It'll log out a message only if the log level is at least `ERROR`.

```js
error('My error message');
```

### `warn(any): void`

Wrapper around `console.warn` method. It'll log out a message only if the log level is at least `WARN`.

```js
warn('My warn message');
```

### `info(any): void`

Wrapper around `console.log` method. It'll log out a message only if the log level is at least `INFO`.

```js
info('My info message');
```

### `defaultLogLevel: Number`

The `defaultLogLevel` variable is assigned based on current value of the `NODE_ENV` variable.

**`logLevel` is `null` by default. This is just helpful value when you calling the `setLogLevel` method for the first time**

```js
const logLevelEnum = {
    development: logLevels.INFO,
    production: logLevels.SILENT,
    [undefined]: logLevels.ERROR,
};

const defaultLogLevel = logLevelEnum[process.env.NODE];
```

---

## Examples

```js
import * as Logger from './modules/logger';

// Nothing is going to be log out,
// because the 'setLogLevel' has been called yet.
Logger.error('Something went wrong.');
Logger.info(`Hello world`);

Logger.setLogLevel(Logger.logLevels.INFO);

// Now the error message will log out to console:
// > 'Something went wrong.'
// > 'Hello world'
```

```js
import * as Logger from './modules/logger';

Logger.setLogLevel(Logger.logLevels.ERROR);

Logger.error('Something went wrong.');
Logger.info(`Hello world`);

// Only the error message will be log out
// since the log level is at least 'ERROR'.
// > 'Something went wrong.'
```
