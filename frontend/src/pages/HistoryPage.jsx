import { useState, useCallback } from 'react';
import { loadHistory, clearHistory } from '../utils/storage';
import { analyzeTrend, generateEmpathicSummary } from '../utils/moodUtils';
import MoodBanner from '../components/MoodBanner';
import MoodCard from '../components/MoodCard';

export default function HistoryPage() {
    const [entries, setEntries] = useState(() => loadHistory());

    const handleClear = useCallback(() => {
        if (!confirm('¿Restablecer tu historial? Esta acción no se puede deshacer.')) return;
        clearHistory();
        setEntries([]);
    }, []);

    const trend = analyzeTrend(entries);
    const summary = generateEmpathicSummary(entries);
    const recent = [...entries].reverse().slice(0, 20);

    return (
        <div className="history-page">
            <h2 className="page-title">Tu viaje emocional</h2>

            <MoodBanner trend={trend} />

            {entries.length === 0 ? (
                <p className="empty-history">Aún no hay entradas en tu historial.</p>
            ) : (
                <>
                    {summary && <p className="empathic-summary">"{summary}"</p>}
                    <div className="timeline">
                        {recent.map((entry, i) => (
                            <div key={i} className="timeline-item">
                                <MoodCard entry={entry} />
                            </div>
                        ))}
                    </div>
                    <p className="reset-link" onClick={handleClear}>Restablecer historial</p>
                </>
            )}
        </div>
    );
}
