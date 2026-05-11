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
    const completed = getLegacyCompletedDays();
    const allDays = new Set([
        ...history.map(e => e.timestamp.slice(0, 10)),
        ...completed
    ]);
    return allDays.size;
}

export function getUserId() {
    let id = localStorage.getItem('mirror_user_id');
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem('mirror_user_id', id);
    }
    return id;
}

export function getLegacyCompletedDays() {
    try {
        return JSON.parse(localStorage.getItem('mirror_legacy_days')) || [];
    } catch {
        return [];
    }
}

export function markLegacyCompletedToday() {
    const days = getLegacyCompletedDays();
    const today = new Date().toISOString().slice(0, 10);
    if (!days.includes(today)) {
        days.push(today);
        localStorage.setItem('mirror_legacy_days', JSON.stringify(days));
    }
}
