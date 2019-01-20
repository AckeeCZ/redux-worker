import { addWorkerListener, postMessageToWorker } from './dependencies';

import { executeInWindowSuccess, executeInWindowFailure } from './services/messagesIn';
import messageOutTypes from './services/messageOutTypes';

function processWindowMethodExecution({ id, pathToProperty, args }) {
    const propertyNames = pathToProperty.split('.');
    const property = {
        ref: null,
        closestContext: window,
    };
    const lastIndex = propertyNames.length - 1;

    // TODO: refactor this:
    propertyNames.forEach((propertyName, index) => {
        property.ref = property.closestContext[propertyName];

        const isLast = index >= lastIndex;

        switch (typeof property.ref) {
            case 'object': {
                // move to a child property of currect context
                if (isLast) {
                    postMessageToWorker(executeInWindowSuccess(id, property.ref));
                } else {
                    property.closestContext = property.ref;
                }

                break;
            }
            case 'function': {
                if (isLast) {
                    // method found, call it with provided arguments
                    // then send the result back
                    const mayBePromise = property.ref.call(property.closestContext, ...args);

                    Promise.resolve(mayBePromise).then(result => {
                        postMessageToWorker(executeInWindowSuccess(id, result));
                    });
                } else {
                    property.closestContext = property.ref;
                }

                break;
            }

            case 'undefined': {
                if (isLast) {
                    postMessageToWorker(executeInWindowSuccess(id, property.ref));
                } else {
                    // return special message, or don't create this 'case' block at all?
                    // or throw an error? God knows.
                    // TODO: error message
                    const error = new Error('TODO');

                    postMessageToWorker(executeInWindowFailure(id, error));
                }

                break;
            }
            default: {
                if (isLast) {
                    const value = property.ref;

                    // NOTE: consider different action (_VALUE, instead of _RESULT)
                    postMessageToWorker(executeInWindowSuccess(id, value));
                } else {
                    property.closestContext = property.ref;
                }
            }
        }
    });
}

export function initializeWindowBridge() {
    addWorkerListener('message', event => {
        const message = event.data;

        if (message.type === messageOutTypes.EXECUTE_IN_WINDOW_REQUEST) {
            processWindowMethodExecution(message);
        }
    });
}
