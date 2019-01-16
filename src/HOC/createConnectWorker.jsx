import React from 'react';
import StoreWorkerBridge from '../utils/StoreWorkerBridge';

import { createActionCreators } from './utils';

// TODO: use some better utility
function isEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}

// TODO:
// 'createConnectWorker' should be async.
// It should create new bridge only if mapStateToProps selector was provided or null argument was explicitly passed instead.
// Otherwise there is a risk of a race condition.
const createConnectWorker = (storeWorker, { bridgeId, mapDispatchToProps, propsSelector }) => (
    WrappedComponent,
    Loader,
) => {
    const signedStoreWorker = new StoreWorkerBridge(storeWorker, {
        bridgeId,
        propsSelectorProvided: propsSelector !== undefined,
    });

    const mapDispatchToPropsWithOwnProps = propsSelector && typeof mapDispatchToProps === 'function';

    function getActionCreators(props) {
        return createActionCreators(
            signedStoreWorker.postAction,
            mapDispatchToProps,
            mapDispatchToPropsWithOwnProps ? propsSelector(props) : undefined,
        );
    }

    class StoreWorkerConnector extends React.Component {
        state = null;

        constructor(props) {
            super(props);

            this.actionCreators = getActionCreators(props);
        }

        componentDidMount() {
            if (propsSelector) {
                signedStoreWorker.setPropsSelector(() => propsSelector(this.props));
            }

            signedStoreWorker.setStateObserver(data => {
                this.setState(data);
            });
        }

        componentDidUpdate(prevProps) {
            if (mapDispatchToPropsWithOwnProps && !isEqual(this.props, prevProps)) {
                this.actionCreators = getActionCreators(prevProps);
            }
        }

        componentWillUnmount() {
            signedStoreWorker.removeStateObserver();

            if (propsSelector) {
                signedStoreWorker.removePropsSelector();
            }
        }

        render() {
            if (!this.state) {
                return Loader ? <Loader /> : null;
            }

            return (
                <WrappedComponent
                    {...{
                        ...this.props,
                        ...this.state,
                        ...this.actionCreators,
                        dispatch: signedStoreWorker.postAction,
                    }}
                />
            );
        }
    }

    return StoreWorkerConnector;
};

export default createConnectWorker;
