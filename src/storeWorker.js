import messageTypesIn from './services/messageTypesIn';
import * as messagesOut from './services/messagesOut';
import selector from './services/selectors';

const createRequestComponentProps = messageKey => () => {
    self.postMessage(messagesOut.requestComponentProps(messageKey));
};

const unsubscribes = {};

function launchTaskDurationWatcher(taskDurationWatcher) {
    if (taskDurationWatcher.enabled) {
        const workerIsResponding = messagesOut.workerIsResponding();
        const sendReport = () => {
            self.postMessage(workerIsResponding);
        };

        self.setInterval(sendReport, taskDurationWatcher.reportStatusInPeriod);
    }
}

function importAll(context) {
    return context.keys().map(context);
}

export const initMessageHandler = (configureStore, getContainerSelectors) => {
    // import all mapStateToState selectors
    importAll(getContainerSelectors());

    const store = configureStore();

    const stateChanged = ({ key, props }) => {
        const state = store.getState();
        const nextState = selector(state, props, key);

        self.postMessage(messagesOut.stateChanged(key, nextState));
    };

    const createStateChanged = messageKey => props => {
        stateChanged({
            key: messageKey,
            props,
        });
    };

    self.onmessage = event => {
        const message = event.data;

        switch (message.type) {
            case messageTypesIn.DISPATCH: {
                store.dispatch(message.action);
                break;
            }

            case messageTypesIn.SUBSCRIBE: {
                const { propsSelectorProvided } = message.options;
                const stateChangeHandler = propsSelectorProvided
                    ? createRequestComponentProps(message.key)
                    : createStateChanged(message.key);

                unsubscribes[message.key] = store.subscribe(stateChangeHandler);

                // post initial message with initial state to hydrate the component
                stateChangeHandler();

                break;
            }

            case messageTypesIn.UNSUBCRIBE: {
                const { key } = message;
                const unsubscribe = unsubscribes[key];

                if (unsubscribe) {
                    delete unsubscribes[key];
                    unsubscribe();
                }
                break;
            }

            case messageTypesIn.SEND_COMPONENT_PROPS: {
                stateChanged(message);
                break;
            }

            case messageTypesIn.SET_OPTIONS_REQUEST: {
                launchTaskDurationWatcher(message.options.taskDurationWatcher);
                self.postMessage(messagesOut.setOptionsComplete());
                break;
            }

            default:
        }
    };
};
