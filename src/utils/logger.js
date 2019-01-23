import { logLevels } from '../constants';

let logLevel = null;
let queue = [];
const logger = console;

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
            logger.error(...args);
            break;
        case 2:
            logger.warn(...args);
            break;
        case 3:
            logger.log(...args);
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

export { setLogLevel, error, warn, info };
