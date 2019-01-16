import { messagesOut } from './dependencies';

let intervalId = null;

export function launchTaskDurationWatcher(taskDurationWatcher) {
    if (taskDurationWatcher.enabled && !intervalId) {
        const workerIsResponding = messagesOut.workerIsResponding();
        const sendReport = () => {
            self.postMessage(workerIsResponding);
        };

        intervalId = self.setInterval(sendReport, taskDurationWatcher.reportStatusInPeriod);
    }
}
