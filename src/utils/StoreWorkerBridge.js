import * as messagesIn from '../services/messagesIn';
import messageTypesOut from '../services/messageTypesOut';

/*
	receive seleceted messages (only messages where message.key === messageKey)
	send 
	NOTE: what about missed messages? (received message before the listener is set up)
*/
function StoreWorkerBridge({ worker, messageKey, propsSelectorProvided }) {
    const handlers = {
        stateChanged: null,
        propsSelector: null,
    };

    const dispatch = messagesIn.dispatch(messageKey);

    const messageHandler = event => {
        const message = event.data;

        if (message.key !== messageKey) {
            return;
        }

        switch (message.type) {
            case messageTypesOut.STATE_CHANGED:
                handlers.stateChanged(message.data);
                break;

            case messageTypesOut.REQUEST_COMPONENT_PROPS: {
                const selectedProps = handlers.propsSelector();
                worker.postMessage(messagesIn.sendComponentProps(messageKey, selectedProps));
                break;
            }

            default:
        }
    };

    const api = {
        /*
			1. validate input - handler
			2. create and set messageHandler
			3. dispatch the subscribe message 
				-> a new state change handler is created
				-> corresponding selector is called and component's initial state is set up  
		*/
        setStateObserver(handler) {
            if (handlers.stateChanged) {
                api.removeStateObserver();
            }

            if (typeof handler !== 'function') {
                throw new TypeError(`setStateObserver: 1st argument must be a function, not a '${typeof handler}'.`);
            }

            handlers.stateChanged = handler;

            worker.addEventListener('message', messageHandler, false);
            worker.postMessage(messagesIn.subscribe(messageKey, { propsSelectorProvided }));
        },

        removeStateObserver() {
            if (!handlers.stateChanged) {
                return;
            }

            worker.removeEventListener('message', messageHandler, false);
            worker.postMessage(messagesIn.unsubscribe(messageKey));
        },

        postAction(action) {
            worker.postMessage(dispatch(action));
        },

        setPropsSelector(handler) {
            handlers.propsSelector = handler;
        },

        removePropsSelector() {
            handlers.propsSelector = null;
        },
    };

    return api;
}

export default StoreWorkerBridge;
