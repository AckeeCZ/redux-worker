import { messagesOut, MainThread } from './dependencies';

let intervalId = null;

export default function launchTaskDurationWatcher(taskDurationWatcher) {
    if (!taskDurationWatcher.enabled || intervalId) {
        return;
    }

    intervalId = self.setInterval(() => {
        MainThread.postMessage(messagesOut.workerIsResponding());
    }, taskDurationWatcher.reportStatusInPeriod);
}
