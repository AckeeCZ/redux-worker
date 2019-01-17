import { messageOutTypes, EMIT_KEY } from './dependencies';
import Timeout from './utils/Timeout';

export default function startTasksDurationWatcher(storeWorker, { taskDurationTimeout, onRebootWorkerEnd }) {
    const workerIsNotRespondingHandler = () => {
        storeWorker.emit({
            eventType: storeWorker.eventTypes.TASK_DURATION_TIMEOUT,
            signature: EMIT_KEY,
        });
    };

    const timeout = new Timeout(taskDurationTimeout, workerIsNotRespondingHandler);

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

    storeWorker.worker.on('message', messageHandler);

    storeWorker.on(storeWorker.eventTypes.WORKER_TERMINATE, () => {
        timeout.clear();
    });

    storeWorker.on(storeWorker.eventTypes.WORKER_START, onRebootWorkerEnd);

    const stopWatcher = () => {
        timeout.clear();
        storeWorker.worker.off('message', messageHandler);
    };

    return stopWatcher;
}
