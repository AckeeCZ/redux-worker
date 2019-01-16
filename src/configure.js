import createConnectWorker from './HOC/createConnectWorker';
import * as messagesIn from './services/messagesIn';
import * as defaultConfig from './config';
import mergeConfigs from './utils/mergeConfigs';
import startTasksDurationWatcher from './utils/tasksDurationWatcher';

function configure(storeWorker, customConfig) {
    const options = mergeConfigs(defaultConfig, customConfig);

    if (options.taskDurationWatcher.enabled) {
        const { unrespondingTimeout } = options.taskDurationWatcher;

        startTasksDurationWatcher(storeWorker, {
            taskDurationTimeout: unrespondingTimeout,
        });
    }

    storeWorker.postMessage(messagesIn.setOptionsRequest(options));

    return {
        connectWorker(bridgeId, mapDispatchToProps, propsSelector) {
            return createConnectWorker(storeWorker, {
                bridgeId,
                mapDispatchToProps,
                propsSelector,
            });
        },
    };
}

export default configure;
