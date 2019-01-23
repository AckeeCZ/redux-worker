import { messageOutTypes, eventEmitter, eventTypes, WorkerThread, Logger } from './dependencies';
import Timeout from './utils/Timeout';

export default function startTasksDurationWatcher({ taskDurationTimeout, onRebootWorkerEnd }) {
    const workerIsNotRespondingHandler = () => {
        Logger.info(
            `'TASK_DURATION_TIMEOUT' event fired. The store worker didn't report itself to the main thread for ${taskDurationTimeout}ms.`,
        );

        eventEmitter.emit(eventTypes.TASK_DURATION_TIMEOUT);
    };

    const timeout = new Timeout(taskDurationTimeout, workerIsNotRespondingHandler);

    const messageHandler = message => {
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

    const unsubscribes = new Set();

    unsubscribes.add(
        WorkerThread.addMessageListener(
            [messageOutTypes.SET_OPTIONS_COMPLETE, messageOutTypes.WORKER_IS_RESPONDING],
            messageHandler,
        ),
    );

    unsubscribes.add(
        eventEmitter.on(eventTypes.WORKER_TERMINATED, () => {
            timeout.clear();
        }),
    );

    unsubscribes.add(eventEmitter.on(eventTypes.WORKER_BOOTED, onRebootWorkerEnd));

    const stopWatcher = () => {
        timeout.clear();

        for (const unsubscribe of unsubscribes.values()) {
            unsubscribe();
        }
    };

    return stopWatcher;
}
