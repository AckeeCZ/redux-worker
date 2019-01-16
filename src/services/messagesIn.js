import types from './messageTypesIn';

export const dispatch = bridgeId => action => ({
    type: types.DISPATCH,
    bridgeId,
    action,
});

export const subscribe = (bridgeId, options = {}) => ({
    type: types.SUBSCRIBE,
    bridgeId,
    options,
});

export const unsubscribe = bridgeId => ({
    type: types.UNSUBSCRIBE,
    bridgeId,
});

export const sendComponentProps = (bridgeId, props) => ({
    type: types.SEND_COMPONENT_PROPS,
    bridgeId,
    props,
});

export const setOptionsRequest = options => ({
    type: types.SET_OPTIONS_REQUEST,
    options,
});
