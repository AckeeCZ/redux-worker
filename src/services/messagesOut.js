import types from './messageTypesOut';

export const workerIsResponding = () => ({
    type: types.WORKER_IS_RESPONDING,
});

export const stateChanged = (key, data) => ({
    type: types.STATE_CHANGED,
    key,
    data,
});

export const requestComponentProps = key => ({
    type: types.REQUEST_COMPONENT_PROPS,
    key,
});

export const setOptionsComplete = () => ({
    type: types.SET_OPTIONS_COMPLETE,
});
