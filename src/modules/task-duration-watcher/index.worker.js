import { messagesOut } from './dependencies';

let intervalId = null;

export function launchTaskDurationWatcher(taskDurationWatcher) {
    if (!taskDurationWatcher.enabled || intervalId) {
        return;
    }

    intervalId = self.setInterval(() => {
        self.postMessage(messagesOut.workerIsResponding());
    }, taskDurationWatcher.reportStatusInPeriod);
}
