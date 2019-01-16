import types from './messageTypesOut';

export const workerIsResponding = () => ({
    type: types.WORKER_IS_RESPONDING,
});

export const stateChanged = (bridgeId, data) => ({
    type: types.STATE_CHANGED,
    bridgeId,
    data,
});

export const requestComponentProps = bridgeId => ({
    type: types.REQUEST_COMPONENT_PROPS,
    bridgeId,
});

export const setOptionsComplete = () => ({
    type: types.SET_OPTIONS_COMPLETE,
});
