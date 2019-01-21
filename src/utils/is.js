export const isFn = val => typeof val === 'function';
export const isStr = val => typeof val === 'string';
export const isSym = val => typeof val === 'symbol';
export const isNonEmptyString = val => isStr(val) && val.length > 0;
