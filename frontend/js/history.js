const STORAGE_KEY = 'mirror_history';

// ── Storage ───────────────────────────────────────────────────────────────────

function saveEntry(data) {
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

function loadHistory() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function groupByDay(entries) {
    const days = {};
    for (const entry of entries) {
        const day = entry.timestamp.slice(0, 10);
        if (!days[day]) days[day] = [];
        days[day].push(entry.polarity_score);
    }
    return Object.entries(days)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, scores]) => ({
            date,
            avg: scores.reduce((s, v) => s + v, 0) / scores.length,
            count: scores.length
        }));
}

function arrAvg(arr) {
    return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function getRelativeTime(timestamp) {
    const now = new Date();
    const then = new Date(timestamp);
    const diffDays = Math.floor((now - then) / 86400000);
    const hour = then.getHours();
    const timeOfDay = hour < 12 ? 'por la mañana' : hour < 19 ? 'por la tarde' : 'por la noche';
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

    if (diffDays === 0) {
        if (hour < 12) return 'Hoy temprano';
        if (hour < 19) return 'Hoy por la tarde';
        return 'Esta noche';
    }
    if (diffDays === 1) return `Ayer ${timeOfDay}`;
    if (diffDays < 7) return `El ${days[then.getDay()]} pasado`;
    if (diffDays < 14) return 'Hace una semana';
    return `Hace ${Math.floor(diffDays / 7)} semanas`;
}

function getStateLabel(score) {
    if (score > 0.6) return 'Celebrando la vida';
    if (score > 0.2) return 'Energía alta';
    if (score > -0.2) return 'Equilibrio';
    if (score > -0.6) return 'Calma';
    return 'Tiempo de introspección';
}

function getStateGradient(score) {
    if (score > 0.5)  return 'linear-gradient(135deg, #FFF8E1, #FFE0B2)';
    if (score > 0.1)  return 'linear-gradient(135deg, #FFF3E0, #F3E5D0)';
    if (score > -0.1) return 'linear-gradient(135deg, #E8F5E9, #F1F8E9)';
    if (score > -0.5) return 'linear-gradient(135deg, #E3F2FD, #EDE7F6)';
    return 'linear-gradient(135deg, #EDE7F6, #F3E5F5)';
}

function getStateIcon(score) {
    if (score > 0.5)  return '☀️';
    if (score > 0.1)  return '🌤️';
    if (score > -0.1) return '🌿';
    if (score > -0.5) return '🌙';
    return '✦';
}

function parseSong(song) {
    const parts = (song || '').split(' - ');
    if (parts.length >= 2) {
        return { title: parts[0].trim(), artist: parts.slice(1).join(' - ').trim() };
    }
    return { title: song || '', artist: '' };
}

// ── Trend Analysis ────────────────────────────────────────────────────────────

function analyzeTrend(entries) {
    if (entries.length < 2) return { direction: 'new', delta: 0, avgRecent: 0, streak: 0 };

    const scores = entries.map(e => e.polarity_score);
    const recent = scores.slice(-5);
    const prev = scores.slice(-10, -5);

    const avgRecent = arrAvg(recent);
    const avgPrev = prev.length > 0 ? arrAvg(prev) : avgRecent;
    const delta = avgRecent - avgPrev;

    const grouped = groupByDay(entries);
    let streak = 0;
    for (let i = grouped.length - 1; i >= 0; i--) {
        if (grouped[i].avg > 0) streak++;
        else break;
    }

    let direction;
    if (delta > 0.15) direction = 'improving';
    else if (delta < -0.15) direction = 'declining';
    else direction = 'stable';

    return { direction, delta, avgRecent, streak };
}

// ── Empathic Summary ──────────────────────────────────────────────────────────

function generateEmpathicSummary(entries) {
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    const week = entries.filter(e => new Date(e.timestamp) >= weekAgo);
    if (week.length === 0) return null;

    const positive = week.filter(e => e.polarity_score > 0.1).length;
    const negative = week.filter(e => e.polarity_score < -0.1).length;

    const artistCount = {};
    week.forEach(e => {
        const { artist } = parseSong(e.song);
        if (artist) artistCount[artist] = (artistCount[artist] || 0) + 1;
    });
    const topArtist = Object.entries(artistCount).sort(([, a], [, b]) => b - a)[0]?.[0];

    if (positive > negative) {
        let p = `Esta semana has tenido ${positive} momento${positive > 1 ? 's' : ''} de energía`;
        if (negative > 0) p += ` y ${negative} de reflexión profunda`;
        p += '.';
        if (topArtist) p += ` ${topArtist} te acompañó en el camino.`;
        p += ' Sigue confiando en tu proceso.';
        return p;
    } else if (negative > positive) {
        let p = `Esta semana ha sido intensa — has tenido ${negative} momento${negative > 1 ? 's' : ''} difícil${negative > 1 ? 'es' : ''}.`;
        p += ' Reconocer eso ya es valentía.';
        if (topArtist) p += ` La música de ${topArtist} también estuvo ahí.`;
        return p;
    } else {
        let p = 'Esta semana has navegado entre calma y reflexión.';
        if (topArtist) p += ` ${topArtist} te acompañó en ese equilibrio.`;
        p += ' Eso también es fortaleza.';
        return p;
    }
}

// ── Render: Banner ────────────────────────────────────────────────────────────

function renderBanner(trend) {
    const banner = document.getElementById('mood-banner');
    const { direction, avgRecent, streak } = trend;
    let cls, icon, title, sub;

    if (direction === 'new') {
        cls = 'new'; icon = '📖';
        title = 'Este es tu punto de partida';
        sub = 'Cada entrada cuenta tu historia.';
    } else if (direction === 'improving' && streak >= 3) {
        cls = 'improving'; icon = '🌟';
        title = `¡Llevas ${streak} días en racha positiva!`;
        sub = 'Eso no es casualidad. Sigue así.';
    } else if (direction === 'improving') {
        cls = 'improving'; icon = '🌱';
        title = 'Tu energía está creciendo';
        sub = 'Nota cómo cada día puede ser distinto.';
    } else if (direction === 'stable' && avgRecent > 0.2) {
        cls = 'stable-good'; icon = '✨';
        title = 'Mantienes una buena energía';
        sub = 'Ese equilibrio también es un logro.';
    } else if (direction === 'declining') {
        cls = 'declining'; icon = '💙';
        title = 'Has tenido días difíciles';
        sub = 'Eso es válido. Cada pequeño paso cuenta.';
    } else {
        cls = 'stable'; icon = '🌿';
        title = 'Navegando el día a día';
        sub = 'Está bien no estar siempre bien.';
    }

    banner.className = `mood-banner ${cls}`;
    banner.innerHTML = `
        <span class="banner-icon">${icon}</span>
        <div>
            <div class="banner-title">${title}</div>
            <div class="banner-sub">${sub}</div>
        </div>`;
}

// ── Render: Timeline ──────────────────────────────────────────────────────────

function renderList(entries) {
    const container = document.getElementById('history-list');

    if (entries.length === 0) {
        container.innerHTML = '<p class="empty-history">Aún no hay entradas en tu historial.</p>';
        return;
    }

    const summary = generateEmpathicSummary(entries);
    const recent = [...entries].reverse().slice(0, 20);

    const cards = recent.map(entry => {
        const { title, artist } = parseSong(entry.song);
        return `
        <div class="timeline-item">
            <div class="mood-card" style="background:${getStateGradient(entry.polarity_score)}">
                <div class="card-header">
                    <span class="state-icon">${getStateIcon(entry.polarity_score)}</span>
                    <div class="card-meta">
                        <div class="state-label">${getStateLabel(entry.polarity_score)}</div>
                        <div class="relative-time">${getRelativeTime(entry.timestamp)}</div>
                    </div>
                </div>
                <p class="card-validation">${entry.validation}</p>
                <div class="music-widget">
                    <span class="music-disc-icon">♫</span>
                    <div class="music-info">
                        <div class="music-title">${title}</div>
                        ${artist ? `<div class="music-artist">${artist}</div>` : ''}
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');

    container.innerHTML = `
        ${summary ? `<p class="empathic-summary">"${summary}"</p>` : ''}
        <div class="timeline">${cards}</div>
        <p class="reset-link" id="clearHistoryBtn">Restablecer historial</p>`;
}

// ── Modal Control ─────────────────────────────────────────────────────────────

function openModal() {
    const history = loadHistory();
    document.getElementById('history-modal').style.display = 'flex';
    renderBanner(analyzeTrend(history));
    renderList(history);
}

function closeModal() {
    document.getElementById('history-modal').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('historyBtn').addEventListener('click', openModal);
    document.getElementById('closeHistoryBtn').addEventListener('click', closeModal);
    document.getElementById('history-modal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });
    document.getElementById('history-list').addEventListener('click', (e) => {
        if (e.target.id !== 'clearHistoryBtn') return;
        if (!confirm('¿Restablecer tu historial? Esta acción no se puede deshacer.')) return;
        localStorage.removeItem(STORAGE_KEY);
        renderBanner(analyzeTrend([]));
        renderList([]);
    });
});
