import { messageOutTypes } from './dependencies';
import Timeout from './utils/Timeout';

export default function startTasksDurationWatcher(worker, { taskDurationTimeout }) {
    const notRespondingWorkerHandler = () => {
        // TODO: a developer should provide handler function for this event
        // anyway i am not sure if it should be provided in config method (e.g. `config/index.js`)
        // or dynamically by some another method (e.g. workerNotRespondingHandler())
        const shouldRestart = window.confirm(`Store worker is not responding.\nIt'll restarted in the moment...`);

        if (shouldRestart) {
            worker.terminate();
        }

        // TODO: find out create new StoreWorker dynamically
        // maybe use message channel for sending redux-like actions
        // to control creating and terminating store and reinitializating the StoreWorkerBridge
    };

    const timeout = new Timeout(taskDurationTimeout, notRespondingWorkerHandler);

    const messageHandler = event => {
        const message = event.data;

        switch (message.type) {
            case messageOutTypes.SET_OPTIONS_COMPLETE:
                timeout.start();
                break;

            case messageOutTypes.WORKER_IS_RESPONDING:
                timeout.restart();
                break;

            default:
        }
    };

    worker.addEventListener('message', messageHandler, false);

    const stopWatcher = () => {
        timeout.clear();
        worker.removeEventListener('message', messageHandler, false);
    };

    return stopWatcher;
}
