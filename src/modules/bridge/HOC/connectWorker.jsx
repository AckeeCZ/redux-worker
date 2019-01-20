import { React, isEqual, isFn } from '../dependencies';

import StoreWorkerBridge from '../utils/StoreWorkerBridge';
import createActionCreators from '../utils/createActionCreators';

const connectWorker = (bridgeId, mapDispatchToProps, ownPropsSelector) => (WrappedComponent, Loader) => {
    const ownPropsSelectorProvided = isFn(ownPropsSelector);
    const signedStoreWorker = new StoreWorkerBridge(bridgeId, {
        ownPropsSelectorProvided,
    });

    const mapDispatchToPropsWithOwnProps = ownPropsSelectorProvided && isFn(mapDispatchToProps);

    function getActionCreators(props) {
        return createActionCreators(
            signedStoreWorker.postAction,
            mapDispatchToProps,
            mapDispatchToPropsWithOwnProps ? ownPropsSelector(props) : undefined,
        );
    }

    class StoreWorkerConnector extends React.Component {
        state = null;

        constructor(props) {
            super(props);

            this.actionCreators = getActionCreators(props);
        }

        componentDidMount() {
            if (ownPropsSelectorProvided) {
                signedStoreWorker.setOwnPropsSelector(() => ownPropsSelector(this.props));
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

            if (ownPropsSelectorProvided) {
                signedStoreWorker.removeOwnPropsSelector();
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

export default connectWorker;
