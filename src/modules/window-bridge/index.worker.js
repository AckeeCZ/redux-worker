import { executeInWindowRequest } from './services/messagesOut';

let nextId = 0;

export async function executeInWindow(pathToProperty, args) {
    // TODO: this need to better optimized
    const id = nextId++;

    const promise = new Promise(resolve => {
        function handler(event) {
            const message = event.data;

            if (message.id === id) {
                self.removeEventListener('message', handler);

                // TODO: handle the message

                resolve(message.payload);
            }
        }

        self.addEventListener('message', handler);
    });

    self.postMessage(executeInWindowRequest(id, pathToProperty, args));

    return promise;
}