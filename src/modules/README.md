# Modules

## Two contexts

There're two different contexts, one is the `window` context (the main thread) and the other is worker context (the worker thread).

A module might have a `main` or/and a `worker` directory. The `main` dir. is for the `window` context and the `worker` dir. is for the web worker context.  
Some modules don't have any of those directories, because they might be used under both contexts. Examples of such modules are the `logger` and the `event-emitter`.
