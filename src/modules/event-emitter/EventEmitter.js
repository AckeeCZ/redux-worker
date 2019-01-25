import { isNonEmptyString, isSym } from './dependencies';

function validateEventType(eventType) {
    if (!isNonEmptyString(eventType) && !isSym(eventType)) {
        throw new TypeError(`'eventType' must a non-empty string or a symbol. Received value: ${eventType}.`);
    }
}

export default class EventEmitter {
    constructor() {
        this.handlers = new Map();
    }

    emit(eventType) {
        validateEventType(eventType);

        const listeners = this.handlers.get(eventType) || new Set();

        for (const listener of listeners.values()) {
            listener();
        }
    }

    on = (eventType, listener) => {
        validateEventType(eventType);

        const listeners = this.handlers.get(eventType) || new Set();

        const success = listeners.add(listener);

        if (success) {
            this.handlers.set(eventType, listeners);
        }

        return () => this.off(eventType, listener);
    };

    off = (eventType, listener) => {
        validateEventType(eventType);

        if (!listener) {
            return this.handlers.delete(eventType);
        }

        const listeners = this.handlers.get(eventType) || new Set();

        const success = listeners.delete(listener);

        this.handlers.set(listeners);

        return success;
    };
}
