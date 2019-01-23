export default function Timeout(duration, onTimeoutEnd) {
    let id = null;

    const api = {
        start: () => {
            id = setTimeout(onTimeoutEnd, duration);
        },
        clear() {
            if (id) {
                clearTimeout(id);
                id = null;
            }
        },
        restart() {
            api.clear();
            api.start();
        },
    };

    return api;
}
