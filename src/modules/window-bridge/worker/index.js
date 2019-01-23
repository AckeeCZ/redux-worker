import { MainThread } from './dependencies';
import { executeInWindowRequest } from './messages';

let nextId = 0;

export async function executeInWindow(pathToProperty, args) {
    const id = nextId++;

    const promise = new Promise(resolve => {
        const messageTypeMatcher = message => message.id === id;

        const unsubscribe = MainThread.addMessageListener(messageTypeMatcher, message => {
            unsubscribe();
            resolve(message.payload);
        });
    });

    MainThread.postMessage(executeInWindowRequest(id, pathToProperty, args));

    return promise;
}
