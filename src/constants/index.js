export const logLevels = {
    SILENT: 0, // logs out nothing
    ERROR: 1, // logs out console.error
    WARN: 2, // logs out console.(error|warn)
    INFO: 3, // logs out console.(warn|error|log\info)
};

export const logLevelEnum = {
    development: logLevels.INFO,
    production: logLevels.SILENT,
    [undefined]: logLevels.ERROR,
};
