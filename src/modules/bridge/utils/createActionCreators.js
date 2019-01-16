import { isFn } from '../dependencies';

export default function createActionCreators(dispatch, mapDispatchToProps, ownProps) {
    if (mapDispatchToProps === undefined || mapDispatchToProps === null) {
        return {};
    }

    if (isFn(mapDispatchToProps)) {
        return mapDispatchToProps(dispatch, ownProps);
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
}
