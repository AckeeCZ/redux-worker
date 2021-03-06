import { logLevels, logLevelEnum, MESSAGE_PREFIX } from './constants';
import { logger } from './config';

let logLevel = null;
let queue = [];

function validateLogLevel(nextLogLevel) {
    const validLogLevels = Object.values(logLevels);

    if (!validLogLevels.includes(nextLogLevel)) {
        throw new Error(`'logLevel' must be one of [${validLogLevels.join(', ')}], not a '${nextLogLevel}'.`);
    }
}

function log(level, args) {
    if (level > logLevel) {
        return;
    }

    switch (level) {
        case 1:
            logger.error(MESSAGE_PREFIX, ...args);
            break;
        case 2:
            logger.warn(MESSAGE_PREFIX, ...args);
            break;
        case 3:
            logger.log(MESSAGE_PREFIX, ...args);
            break;
        default:
    }
}

function setLogLevel(nextLogLevel) {
    validateLogLevel(nextLogLevel);

    logLevel = nextLogLevel;

    for (const [level, args] of queue) {
        log(level, args);
    }

    queue = [];
}

function createLogMessageLevel(level) {
    validateLogLevel(level);

    return (...args) => {
        if (logLevel === null) {
            queue.push([level, args]);
        } else {
            log(level, args);
        }
    };
}

const error = createLogMessageLevel(logLevels.ERROR);
const warn = createLogMessageLevel(logLevels.WARN);
const info = createLogMessageLevel(logLevels.INFO);

const defaultLogLevel = logLevelEnum[process.env.NODE];

export { setLogLevel, logLevels, error, warn, info, defaultLogLevel };
