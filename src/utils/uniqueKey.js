let id = 1000;

export default function uniqueKey(prefix) {
    const suffixKey = Number(id++).toString(36);

    return prefix ? `${prefix}_${suffixKey}` : suffixKey;
}
