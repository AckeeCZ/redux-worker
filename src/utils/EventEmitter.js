export const eventTypes = Object.freeze({
    WORKER_TERMINATED: Symbol('WORKER_TERMINATED'),
    WORKER_BOOTED: Symbol('WORKER_BOOTED'),
    TASK_DURATION_TIMEOUT: Symbol('TASK_DURATION_TIMEOUT'),
});

export default class EventEmitter {
    constructor() {
        this.handlers = new Map();
    }

    emit(eventType) {
        const listeners = this.handlers.get(eventType) || new Set();

        for (const listener of listeners.values()) {
            listener();
        }
    }

    on = (eventType, listener) => {
        const listeners = this.handlers.get(eventType) || new Set();

        const success = listeners.add(listener);

        if (success) {
            this.handlers.set(eventType, listeners);
        }

        return () => this.off(eventType, listener);
    };

    off = (eventType, listener) => {
        if (!listener) {
            return this.handlers.delete(eventType);
        }

        const listeners = this.handlers.get(eventType) || new Set();

        const success = listeners.delete(listener);

        this.handlers.set(listeners);

        return success;
    };
}
