export default function CircularProgress({ days, max = 30 }) {
    const radius = 28;
    const circ = 2 * Math.PI * radius;
    const filled = Math.min(days / max, 1) * circ;

    return (
        <div className="circular-progress">
            <svg width="72" height="72" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r={radius} fill="none" stroke="#eee" strokeWidth="4" />
                <circle
                    cx="36" cy="36" r={radius}
                    fill="none"
                    stroke="var(--accent-color)"
                    strokeWidth="4"
                    strokeDasharray={`${filled} ${circ}`}
                    strokeLinecap="round"
                    transform="rotate(-90 36 36)"
                    style={{ transition: 'stroke-dasharray 0.8s ease' }}
                />
                <text x="36" y="40" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--text-color)">
                    {days}
                </text>
            </svg>
            <span className="circular-label">días de luz</span>
        </div>
    );
}
