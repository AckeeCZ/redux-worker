import {
    messagesOut,
    messageTypesIn,
    rootSelector,
    launchTaskDurationWatcher,
    onContainerSelector,
    MainThread,
    ALL_MESSAGES,
    Logger,
} from './dependencies';
import importAll from './utils/importAll';

const createRequestComponentProps = bridgeId => () => {
    MainThread.postMessage(messagesOut.requestComponentProps(bridgeId));
};

const unsubscribes = {};

function setOptionsHandler(message) {
    const { taskDurationWatcher, logLevel } = message.options;

    launchTaskDurationWatcher(taskDurationWatcher);

    Logger.setLogLevel(logLevel);

    MainThread.postMessage(messagesOut.setOptionsComplete());
}

function unsubscribeHandler(message) {
    const { bridgeId } = message;
    const unsubscribeStateObserver = unsubscribes[bridgeId];

    if (unsubscribeStateObserver) {
        delete unsubscribes[bridgeId];
        unsubscribeStateObserver();
    }
}

export default function configureStoreWorker({ configureStore, getSelectors }) {
    // import all mapStateToState selectors
    const selectors = importAll(getSelectors());

    Logger.info(`Number of imported selectors: ${selectors.length}, selectors:`, selectors);

    const store = configureStore();

    const stateChanged = ({ bridgeId, props }) => {
        const state = store.getState();
        const nextState = rootSelector(state, props, bridgeId);

        MainThread.postMessage(messagesOut.stateChanged(bridgeId, nextState));
    };

    const createStateChanged = bridgeId => props => {
        stateChanged({
            bridgeId,
            props,
        });
    };

    MainThread.addMessageListener(ALL_MESSAGES, message => {
        switch (message.type) {
            case messageTypesIn.DISPATCH: {
                store.dispatch(message.action);
                break;
            }

            case messageTypesIn.SUBSCRIBE: {
                const { options, bridgeId } = message;
                const { ownPropsSelectorProvided } = options;
                const stateChangeHandler = ownPropsSelectorProvided
                    ? createRequestComponentProps(bridgeId)
                    : createStateChanged(bridgeId);

                unsubscribes[bridgeId] = store.subscribe(stateChangeHandler);

                // Post initial message with initial state to hydrate the component.
                // But only when the mapStateToProps selector is available
                onContainerSelector(bridgeId, stateChangeHandler);

                break;
            }

            case messageTypesIn.UNSUBCRIBE: {
                unsubscribeHandler(message);
                break;
            }

            case messageTypesIn.SEND_COMPONENT_PROPS: {
                stateChanged(message);
                break;
            }

            case messageTypesIn.SET_OPTIONS_REQUEST: {
                setOptionsHandler(message);
                break;
            }

            default:
        }
    });
}
