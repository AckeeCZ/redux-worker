import { createMessageTypeMatcher } from '../services/utilities';

const listeners = new Map();

function noop() {}

export function removeMessageListener(listener) {
    const handler = listeners.get(listener);

    if (handler) {
        self.removeEventListener('message', handler);
    }

    return listeners.delete(listener);
}

export function addMessageListener(messageType, listener) {
    if (listeners.has(listener)) {
        return noop;
    }

    const messageTypeMatcher = createMessageTypeMatcher(messageType);

    function handler(event) {
        const message = event.data;

        if (messageTypeMatcher(message)) {
            listener(message);
        }
    }

    self.addEventListener('message', handler);

    listeners.set(listener, handler);

    return () => removeMessageListener(listener);
}

export function postMessage(...args) {
    self.postMessage(...args);
}
