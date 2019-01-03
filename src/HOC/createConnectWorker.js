import React from 'react';
import StoreWorkerBridge from '../utils/StoreWorkerBridge';

import { createActionCreators } from './utils';

const createConnectWorker = ({ id, storeWorker, mapDispatchToProps, propsSelector }) => WrappedComponent => {
    const signedStoreWorker = new StoreWorkerBridge({
        worker: storeWorker,
        messageKey: id,
        propsSelectorProvided: propsSelector !== undefined,
    });

    const actionCreators = createActionCreators(signedStoreWorker.postAction, mapDispatchToProps);

    class StoreWorkerConnector extends React.Component {
        state = null;

        componentDidMount() {
            if (propsSelector) {
                signedStoreWorker.setPropsSelector(() => propsSelector(this.props));
            }

            signedStoreWorker.setStateObserver(data => {
                this.setState(data);
            });
        }

        componentWillUnmount() {
            signedStoreWorker.removeStateObserver();

            if (propsSelector) {
                signedStoreWorker.removePropsSelector();
            }
        }

        render() {
            // TODO:
            if (!this.state) {
                return null;
            }

            return (
                <WrappedComponent
                    {...{
                        ...this.props,
                        ...this.state,
                        ...actionCreators,
                        dispatch: signedStoreWorker.postAction,
                    }}
                />
            );
        }
    }

    return StoreWorkerConnector;
};

export default createConnectWorker;
