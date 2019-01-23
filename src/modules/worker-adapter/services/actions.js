import types from './actionTypes';

export const addEventListener = (...args) => ({
    type: types.ADD_EVENT_LISTENER,
    methodName: 'addEventListener',
    args,
});

export const removeEventListener = (...args) => ({
    type: types.REMOVE_EVENT_LISTENER,
    methodName: 'removeEventListener',
    args,
});

export const postMessage = args => ({
    type: types.POST_MESSAGE,
    methodName: 'postMessage',
    args,
});

export const terminate = options => ({
    type: types.TERMINATE,
    methodName: 'terminate',
    options: {
        clearHandlers: false,
        clearQueue: true,
        ...options,
    },
});
