let id = 1000;

export default function uniqueId(prefix) {
    const suffixId = Number(id++).toString(36);

    return prefix ? `${prefix}_${suffixId}` : suffixId;
}
