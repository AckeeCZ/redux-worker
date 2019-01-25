import { defaultLogLevel } from '../modules/logger';
import { config as taskDurationWatcherConfig } from '../modules/task-duration-watcher/main';

const defaultConfig = {
    // Used to control how much details the package outputs.
    logLevel: defaultLogLevel,
    taskDurationWatcher: taskDurationWatcherConfig,
};

export default Object.freeze(defaultConfig);
