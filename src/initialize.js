import * as messagesIn from './services/messagesIn';
import mergeConfigs from './utils/mergeConfigs';

import { WorkerThread } from './modules/worker-adapter/main';
import { startTasksDurationWatcher } from './modules/task-duration-watcher/main';
import { initializeWindowBridge } from './modules/window-bridge/main';
import * as Logger from './modules/logger';

import defaultConfig from './config/defaultConfig';

function initialize(createStoreWorker, customConfig) {
    const options = mergeConfigs(defaultConfig, customConfig);

    if (WorkerThread.isInitialized()) {
        throw new Error(`redux-worker: The 'initialize' can't be called more than once.`);
    }

    WorkerThread.initialize(createStoreWorker);

    const postOptions = () => {
        WorkerThread.postMessage(messagesIn.setOptionsRequest(options));
    };

    postOptions();

    if (options.taskDurationWatcher.enabled) {
        startTasksDurationWatcher({
            taskDurationTimeout: options.taskDurationWatcher.unrespondingTimeout,
            onRebootWorkerEnd: postOptions,
        });
    }

    Logger.setLogLevel(options.logLevel);

    initializeWindowBridge();
}

export default initialize;
