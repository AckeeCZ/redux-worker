import { messageTypes as types } from './dependencies';

export const executeInWindowRequest = (id, pathToProperty, args = []) => ({
    type: types.EXECUTE_IN_WINDOW_REQUEST,
    id,
    pathToProperty,
    args,
});
