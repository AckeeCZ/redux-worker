const selectors = new Map();

function assertInput(bridgeId, mapStateToProps) {
    if (selectors.has(bridgeId)) {
        // TODO:
        throw new Error(`[collision occured]`);
    }

    if (typeof mapStateToProps !== 'function') {
        throw new TypeError(`2nd parameter must be a function, not a '${typeof mapStateToProps}'.`);
    }
}

export const registerContainerSelector = (bridgeId, mapStateToProps) => {
    assertInput(bridgeId, mapStateToProps);

    selectors.set(bridgeId, mapStateToProps);

    // TODO: now create the new bridge for this bridgeId
};

export default function selector(state, ownProps, bridgeId) {
    const mapStateToProps = selectors.get(bridgeId);

    if (mapStateToProps) {
        return mapStateToProps(state, ownProps, bridgeId);
    }

    console.error(`No 'mapStateToProps' selector was found for the '${bridgeId}' bridge key.`);

    return state;
}
