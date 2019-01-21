import { messagesIn, messageTypesOut, postMessageToWorker, addWorkerListener } from '../dependencies';

function StoreWorkerBridge(bridgeId, { ownPropsSelectorProvided }) {
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
                postMessageToWorker(messagesIn.sendComponentProps(bridgeId, selectedProps));
                break;
            }

            default:
        }
    };

    let unsubscribeMessageHandler = null;

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

            // The 3rd argument will be called everytime when 'messageHandler' is successfully registered.
            // This is useful when worker is rebooted and all message handlers are registered again.
            unsubscribeMessageHandler = addWorkerListener('message', messageHandler, () => {
                postMessageToWorker(messagesIn.subscribe(bridgeId, { ownPropsSelectorProvided }));
            });
        },

        removeStateObserver() {
            if (handlers.stateObserver) {
                unsubscribeMessageHandler();
                postMessageToWorker(messagesIn.unsubscribe(bridgeId));
            }
        },

        postAction(action) {
            postMessageToWorker(dispatch(action));
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
