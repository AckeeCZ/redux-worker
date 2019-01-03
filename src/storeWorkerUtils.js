import messageTypesIn from './services/messageTypesIn';
import * as messagesOut from './services/messagesOut';

const createRequestComponentProps = messageKey => () => {
    postMessage(messagesOut.requestComponentProps(messageKey));
};

const unsubscribes = {};

function optionsChangedHandler(options) {
    if (options.taskDurationWatcher.enabled) {
        setInterval(() => {
            postMessage(messagesOut.workerIsResponding());
        }, options.taskDurationWatcher.reportStatusInPeriod);
    }
}

export const initMessageHandler = ({ store, rootSelector }) => {
    const stateChanged = ({ key, props }) => {
        const state = store.getState();
        const nextState = rootSelector(state, props, key);

        postMessage(messagesOut.stateChanged(key, nextState));
    };

    const createStateChanged = messageKey => props => {
        stateChanged({
            key: messageKey,
            props,
        });
    };

    onmessage = event => {
        const message = event.data;

        // console.log(message);

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
                optionsChangedHandler(message.options);
                postMessage(messagesOut.setOptionsComplete());
                break;
            }

            default:
        }
    };
};
