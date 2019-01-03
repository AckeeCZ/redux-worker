function combineSelectors(selectors = {}) {
    // validate input first to prevent runtime errors
    for (const [k, v] of Object.entries(selectors)) {
        if (typeof v !== 'function') {
            throw new TypeError(
                `combineSelectors: selector must be a 'function', not '${typeof v}'. Check the '${k}' property.`,
            );
        }
    }

    return function selector(state, ownProps, messageId) {
        const componentSelector = selectors[messageId];

        return componentSelector ? componentSelector(state, ownProps) : state;
    };
}

export default combineSelectors;
