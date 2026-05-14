import { useState } from 'react';
import { saveEntry } from '../utils/storage';

const API = 'https://tu-backend.railway.app/api';

export default function MirrorPage({ onAnalyzed }) {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);

    const handleSubmit = async () => {
        if (!text.trim()) return;
        setLoading(true);
        try {
            const res = await fetch(`${API}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setResponse(data);
            saveEntry(data);
            onAnalyzed(data.polarity_score);
        } catch {
            alert('No se pudo conectar con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mirror-page">
            <h2 className="mirror-title">Mirror Response</h2>
            <p className="mirror-subtitle">¿Qué llevas en tu corazón hoy? Exprésate libremente.</p>

            <textarea
                className="mirror-textarea"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Me siento..."
            />

            <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Sintiendo...' : 'Compartir'}
            </button>

            {response && (
                <div className="response-area">
                    <div className="response-card">{response.validation}</div>
                    <div className="response-card">{response.message}</div>
                    <p className="response-meta"><strong>🎧</strong> {response.song}</p>
                    <p className="response-meta"><strong>✨</strong> {response.action}</p>
                </div>
            )}
        </div>
    );
}
