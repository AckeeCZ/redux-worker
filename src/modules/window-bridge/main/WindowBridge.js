import { WorkerThread, messageTypes, Logger } from './dependencies';

import { executeInWindowSuccess, executeInWindowFailure } from './messages';

function getClosestContext(propertyNames) {
    let closestContext = window;

    propertyNames.slice(0, propertyNames.length - 1).forEach((propertyName, index) => {
        closestContext = closestContext[propertyName];

        if (closestContext === undefined) {
            const validPart = propertyNames.slice(0, index).join('.');
            const invalidPart = propertyNames.slice(index).join('.');

            throw new Error(
                `executeInWindow: Invalid 'pathToProperty', valid part: '${validPart}', invalid part: '${invalidPart}'`,
            );
        }
    });

    return closestContext;
}

async function processWindowMethodExecution({ id, pathToProperty, args }) {
    try {
        const propertyNames = pathToProperty.split('.');
        const closestContext = getClosestContext(propertyNames);
        const lastPropertyName = propertyNames[propertyNames.length - 1];
        let result = closestContext[lastPropertyName];

        if (typeof result === 'function') {
            // method found, call it with provided arguments
            // then send the result back
            result = await result.call(closestContext, ...args);
        }

        WorkerThread.postMessage(executeInWindowSuccess(id, result));
    } catch (e) {
        Logger.error(e);

        WorkerThread.postMessage(executeInWindowFailure(id, e.message));
    }
}

export function initializeWindowBridge() {
    const unsubscribe = WorkerThread.addMessageListener(
        messageTypes.EXECUTE_IN_WINDOW_REQUEST,
        processWindowMethodExecution,
    );

    return unsubscribe;
}
