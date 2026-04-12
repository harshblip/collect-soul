
export const formatSeconds = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (secs === 0) {
        return `${mins}min${mins > 1 ? 's' : ''}`;
    }
    return `${mins}min${mins > 1 ? 's' : ''} ${secs}s`;
}