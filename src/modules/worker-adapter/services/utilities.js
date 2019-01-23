import { isFn, isNonEmptyString, isArray, isSym } from '../worker/dependencies';
import { ALL_MESSAGES } from '../constants';

function createMessageTypes(messageType) {
    if (isNonEmptyString(messageType) || isSym(messageType)) {
        return [messageType];
    }

    if (isArray(messageType)) {
        const result = messageType.every(type => isNonEmptyString(type) || isSym(type));

        if (result) {
            return messageType;
        }
    }

    throw new TypeError(
        `'messageType' must be either 'string', 'symbol' or an array with these types. Not a '${typeof messageType}', value: '${messageType}'.`,
    );
}

export function createMessageTypeMatcher(messageType) {
    if (isFn(messageType)) {
        return message => message && messageType(message);
    }

    const messageTypes = new Set(createMessageTypes(messageType));
    const typeMatcher = message => message && (messageTypes.has(message.type) || messageTypes.has(ALL_MESSAGES));

    return typeMatcher;
}
