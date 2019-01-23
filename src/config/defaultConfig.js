import { logLevelEnum } from '../constants';

const defaultConfig = {
    // Used to control how much details the package outputs.
    logLevel: logLevelEnum[process.env.NODE_ENV],
};

export default Object.freeze(defaultConfig);
