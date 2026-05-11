const STORAGE_KEY = 'mirror_history';

export function saveEntry(data) {
    const history = loadHistory();
    history.push({
        timestamp: new Date().toISOString(),
        polarity_score: data.polarity_score,
        validation: data.validation,
        song: data.song,
        action: data.action
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function loadHistory() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

export function clearHistory() {
    localStorage.removeItem(STORAGE_KEY);
}

export function getImpactDays() {
    const history = loadHistory();
    if (history.length === 0) return 0;
    const uniqueDays = new Set(history.map(e => e.timestamp.slice(0, 10)));
    return uniqueDays.size;
}
