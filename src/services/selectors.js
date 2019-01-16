const selectors = {};

function assertInput(bridgeKey, mapStateToProps) {
    if (selectors[bridgeKey]) {
        // TODO:
        throw new Error(`[collision occured]`);
    }

    if (typeof mapStateToProps !== 'function') {
        throw new TypeError(`2nd parameter must be a function, not a '${typeof mapStateToProps}'.`);
    }
}

export const registerContainerSelector = (bridgeKey, mapStateToProps) => {
    console.log({
        bridgeKey,
        mapStateToProps,
    });

    // assertInput(bridgeKey, mapStateToProps.default);

    selectors[bridgeKey] = mapStateToProps;
};

export const clearContainerSelectors = () => {
    selectors.clear();
};

export default function selector(state, ownProps, bridgeKey) {
    const mapStateToProps = selectors[bridgeKey];

    if (mapStateToProps) {
        return mapStateToProps(state, ownProps, bridgeKey);
    }

    console.error(`No 'mapStateToProps' selector found for the '${bridgeKey}' bridge key.`);

    return state;
}
