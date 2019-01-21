import types from './messageOutTypes';

export const executeInWindowSuccess = (id, payload, error) => ({
    type: types.EXECUTE_IN_WINDOW_SUCCESS,
    id,
    payload,
    error,
});

export const executeInWindowFailure = (id, error) => ({
    type: types.EXECUTE_IN_WINDOW_FAILURE,
    id,
    error,
});
