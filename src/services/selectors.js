import { isFn } from '../utils/is';
import * as Logger from '../utils/logger';

const selectors = new Map();
const listeners = new Map();

function assertInput(bridgeId, mapStateToProps) {
    if (selectors.has(bridgeId)) {
        throw new Error(
            `Each 'mapStateToProps' selector must be provided with unique 'bridgeId'. The ${bridgeId} bridgeId is already in use.`,
        );
    }

    if (!isFn(mapStateToProps)) {
        throw new TypeError(`2nd parameter must be a function, not a '${typeof mapStateToProps}'.`);
    }
}

export function registerSelector(bridgeId, mapStateToProps) {
    assertInput(bridgeId, mapStateToProps);

    selectors.set(bridgeId, mapStateToProps);

    const listener = listeners.get(bridgeId);

    if (listener) {
        listeners.delete(bridgeId);
        listener();
    }
}

export function onContainerSelector(bridgeId, handler) {
    if (selectors.has(bridgeId)) {
        handler();
    } else {
        listeners.set(bridgeId, handler);
    }
}

export function rootSelector(state, ownProps, bridgeId) {
    const mapStateToProps = selectors.get(bridgeId);

    if (mapStateToProps) {
        return mapStateToProps(state, ownProps, bridgeId);
    }

    Logger.error(`No 'mapStateToProps' selector was found for the '${bridgeId}' bridge ID.`);

    return state;
}
