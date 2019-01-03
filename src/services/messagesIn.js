import types from './messageTypesIn';

export const dispatch = key => action => ({
    type: types.DISPATCH,
    key,
    action,
});

export const subscribe = (key, options = {}) => ({
    type: types.SUBSCRIBE,
    key,
    options,
});

export const unsubscribe = key => ({
    type: types.UNSUBSCRIBE,
    key,
});

export const sendComponentProps = (key, props) => ({
    type: types.SEND_COMPONENT_PROPS,
    key,
    props,
});

export const setOptionsRequest = options => ({
    type: types.SET_OPTIONS_REQUEST,
    options,
});
