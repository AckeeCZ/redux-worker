import * as messagesIn from './services/messagesIn';
import mergeConfigs from './utils/mergeConfigs';
import { isWorkerInitialized, initializeWorker, postMessageToWorker } from './modules/worker-adapter';
import { startTasksDurationWatcher, config as taskDurationWatcherConfig } from './modules/task-duration-watcher';
import { initializeWindowBridge } from './modules/window-bridge';

const defaultConfig = {
    taskDurationWatcher: taskDurationWatcherConfig,
};

function initialize(createStoreWorker, customConfig) {
    const options = mergeConfigs(defaultConfig, customConfig);

    if (isWorkerInitialized()) {
        throw new Error(`redux-worker: The 'initialize' can't be called more than once.`);
    }

    initializeWorker(createStoreWorker);

    const postOptions = () => {
        postMessageToWorker(messagesIn.setOptionsRequest(options));
    };

    postOptions();

    if (options.taskDurationWatcher.enabled) {
        startTasksDurationWatcher({
            taskDurationTimeout: options.taskDurationWatcher.unrespondingTimeout,
            onRebootWorkerEnd: postOptions,
        });
    }

    initializeWindowBridge();
}

export default initialize;
