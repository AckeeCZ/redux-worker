import { messagesIn, messageTypesOut } from '../dependencies';

function StoreWorkerBridge(worker, { bridgeId, ownPropsSelectorProvided }) {
    const handlers = {
        stateObserver: null,
        ownPropsSelector: null,
    };

    const dispatch = messagesIn.dispatch(bridgeId);

    const messageHandler = event => {
        const message = event.data;

        if (message.bridgeId !== bridgeId) {
            return;
        }
        switch (message.type) {
            case messageTypesOut.STATE_CHANGED:
                handlers.stateObserver(message.data);
                break;

            case messageTypesOut.REQUEST_COMPONENT_PROPS: {
                const selectedProps = handlers.ownPropsSelector();
                worker.postMessage(messagesIn.sendComponentProps(bridgeId, selectedProps));
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
        setStateObserver(stateObserverHandler) {
            if (handlers.stateObserver) {
                api.removeStateObserver();
            }

            handlers.stateObserver = stateObserverHandler;

            worker.addEventListener('message', messageHandler, false);
            worker.postMessage(messagesIn.subscribe(bridgeId, { ownPropsSelectorProvided }));
        },

        removeStateObserver() {
            if (handlers.stateObserver) {
                worker.removeEventListener('message', messageHandler, false);
                worker.postMessage(messagesIn.unsubscribe(bridgeId));
            }
        },

        postAction(action) {
            worker.postMessage(dispatch(action));
        },

        setOwnPropsSelector(ownPropsSelector) {
            handlers.ownPropsSelector = ownPropsSelector;
        },

        removeOwnPropsSelector() {
            handlers.ownPropsSelector = null;
        },
    };

    return api;
}

export default StoreWorkerBridge;
