export function getRelativeTime(timestamp) {
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
    if (diffDays < 7)  return `El ${days[then.getDay()]} pasado`;
    if (diffDays < 14) return 'Hace una semana';
    return `Hace ${Math.floor(diffDays / 7)} semanas`;
}
