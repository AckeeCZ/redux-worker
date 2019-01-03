export const createActionCreators = (dispatch, mapDispatchToProps) => {
    if (mapDispatchToProps === undefined || mapDispatchToProps === null) {
        return {};
    }

    if (typeof mapDispatchToProps === 'function') {
        return mapDispatchToProps(dispatch);
    }

    if (typeof mapDispatchToProps === 'object' && !Array.isArray(mapDispatchToProps)) {
        const actionCreators = {};

        for (const [key, action] of Object.entries(mapDispatchToProps)) {
            actionCreators[key] = (...args) => {
                dispatch(action(...args));
            };
        }

        return actionCreators;
    }

    throw new TypeError(
        `mapDispatchToProps received invalid 1st argument, it must either a 'function' or an 'object', not '${typeof mapDispatchToProps}'.`,
    );
};
