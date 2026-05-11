export function getStateLabel(score) {
    if (score > 0.6)  return 'Celebrando la vida';
    if (score > 0.2)  return 'Energía alta';
    if (score > -0.2) return 'Equilibrio';
    if (score > -0.6) return 'Calma';
    return 'Tiempo de introspección';
}

export function getStateGradient(score) {
    if (score > 0.5)  return 'linear-gradient(135deg, #FFF8E1, #FFE0B2)';
    if (score > 0.1)  return 'linear-gradient(135deg, #FFF3E0, #F3E5D0)';
    if (score > -0.1) return 'linear-gradient(135deg, #E8F5E9, #F1F8E9)';
    if (score > -0.5) return 'linear-gradient(135deg, #E3F2FD, #EDE7F6)';
    return 'linear-gradient(135deg, #EDE7F6, #F3E5F5)';
}

export function getStateIcon(score) {
    if (score > 0.5)  return '☀️';
    if (score > 0.1)  return '🌤️';
    if (score > -0.1) return '🌿';
    if (score > -0.5) return '🌙';
    return '✦';
}

export function getZoneColor(avgScore) {
    if (avgScore === undefined || avgScore === null) return '#4CAF50';
    if (avgScore > 0.3) return '#4CAF50';
    if (avgScore > 0)   return '#D4AF37';
    return '#1976D2';
}

export function getZoneLabel(avgScore) {
    if (avgScore === undefined || avgScore === null) return 'Empatía';
    if (avgScore > 0.3) return 'Empatía';
    if (avgScore > 0)   return 'Gratitud';
    return 'Paciencia';
}

export function parseSong(song) {
    const parts = (song || '').split(' - ');
    if (parts.length >= 2) {
        return { title: parts[0].trim(), artist: parts.slice(1).join(' - ').trim() };
    }
    return { title: song || '', artist: '' };
}

export function groupByDay(entries) {
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

export function analyzeTrend(entries) {
    if (entries.length < 2) return { direction: 'new', delta: 0, avgRecent: 0, streak: 0 };
    const scores = entries.map(e => e.polarity_score);
    const recent = scores.slice(-5);
    const prev   = scores.slice(-10, -5);
    const avgRecent = recent.reduce((s, v) => s + v, 0) / recent.length;
    const avgPrev   = prev.length > 0 ? prev.reduce((s, v) => s + v, 0) / prev.length : avgRecent;
    const delta = avgRecent - avgPrev;
    const grouped = groupByDay(entries);
    let streak = 0;
    for (let i = grouped.length - 1; i >= 0; i--) {
        if (grouped[i].avg > 0) streak++;
        else break;
    }
    const direction = delta > 0.15 ? 'improving' : delta < -0.15 ? 'declining' : 'stable';
    return { direction, delta, avgRecent, streak };
}

export function generateEmpathicSummary(entries) {
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
    }
    let p = 'Esta semana has navegado entre calma y reflexión.';
    if (topArtist) p += ` ${topArtist} te acompañó en ese equilibrio.`;
    p += ' Eso también es fortaleza.';
    return p;
}
