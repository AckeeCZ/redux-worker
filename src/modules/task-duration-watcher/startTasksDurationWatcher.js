import { messageOutTypes, eventEmitter, eventTypes, addWorkerListener } from './dependencies';
import Timeout from './utils/Timeout';

export default function startTasksDurationWatcher({ taskDurationTimeout, onRebootWorkerEnd }) {
    const workerIsNotRespondingHandler = () => {
        if (process.env.NODE_ENV === 'development') {
            console.error('Store worker is not responding.');
        }

        eventEmitter.emit(eventTypes.TASK_DURATION_TIMEOUT);
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

    const removeMessageListener = addWorkerListener('message', messageHandler);

    eventEmitter.on(eventTypes.WORKER_TERMINATE, () => {
        timeout.clear();
    });

    eventEmitter.on(eventTypes.WORKER_START, onRebootWorkerEnd);

    const stopWatcher = () => {
        timeout.clear();
        removeMessageListener();
    };

    return stopWatcher;
}
