export default function MoodBanner({ trend }) {
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

    return (
        <div className={`mood-banner mood-banner--${cls}`}>
            <span className="banner-icon">{icon}</span>
            <div>
                <div className="banner-title">{title}</div>
                <div className="banner-sub">{sub}</div>
            </div>
        </div>
    );
}
