export default {
    // startTasksDurationWatcher is enabled only in non-development NODE_ENV,
    // because when any error occurs writing code (syntax error, type error, etc.),
    // worker wouldn't have been probably initialized, so it won't be responding
    // and therefore 'taskDurationTimeout' alert will be thrown
    enabled: process.env.NODE_ENV !== 'development',

    // if the store worker doesn't report itself
    // in 9s, then it's the worker is considered as non-responding
    // and it's terminated
    unrespondingTimeout: 1000 * 4, // ms

    // how often should the store worker
    // report itself to the tasksDurationWatcher
    // (each report resets the unrespondingTimeout)
    reportStatusInPeriod: 1000 * 3, // ms
};
