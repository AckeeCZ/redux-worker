export default function mergeConfigs(defaultConfig = {}, customConfig = {}) {
    const config = {
        ...defaultConfig,
        ...customConfig,
        taskDurationWatcher: {
            ...defaultConfig.taskDurationWatcher,
            ...customConfig.taskDurationWatcher,
        },
    };

    return config;
}
