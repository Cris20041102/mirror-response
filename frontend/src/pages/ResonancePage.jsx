import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CoquimboMap from '../components/CoquimboMap';
import WorldMap from '../components/WorldMap';
import CircularProgress from '../components/CircularProgress';
import { getImpactDays, getUserId, markLegacyCompletedToday } from '../utils/storage';

const API = 'https://mirror-response.onrender.com/api';

function actionType(score) {
    if (score > 0.3) return 'empatia';
    if (score > 0)   return 'gratitud';
    return 'paciencia';
}

export default function ResonancePage({ lastScore }) {
    const [view, setView]               = useState('city');
    const [communityData, setCommunity] = useState({});
    const [legacyStats, setStats]       = useState([]);
    const [pulse, setPulse]             = useState(0);
    const [mission, setMission]         = useState('');
    const [completing, setCompleting]   = useState(false);
    const [completed, setCompleted]     = useState(false);
    const [confirmation, setConfirm]    = useState(false);
    const [latestEvent, setLatest]      = useState(null);
    const [impactDays, setImpactDays]   = useState(getImpactDays());
    const eventId = useRef(0);

    useEffect(() => {
        fetch(`${API}/community`)
            .then(r => r.json()).then(d => setCommunity(d.zones || {})).catch(() => {});
        fetch(`${API}/legacy/stats`)
            .then(r => r.json()).then(d => setStats([...(d.real || []), ...(d.simulated || [])])).catch(() => {});
        fetch(`${API}/legacy/pulse`)
            .then(r => r.json()).then(d => setPulse(d.total || 0)).catch(() => {});
        fetch(`${API}/mission?score=${lastScore}`)
            .then(r => r.json()).then(d => setMission(d.mission))
            .catch(() => setMission('Hoy, dedica un momento a respirar y notar el espacio a tu alrededor.'));
    }, [lastScore]);

    const handleComplete = async () => {
        if (completing) return;
        setCompleting(true);
        try {
            const res = await fetch(`${API}/legacy/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: getUserId(),
                    type: actionType(lastScore),
                    latitude: -29.96,
                    longitude: -71.34
                })
            });
            const data = await res.json();
            if (data.success) {
                setPulse(prev => prev + 1);
                setLatest({ id: eventId.current++, lon: data.lon, lat: data.lat, type: data.type });
                markLegacyCompletedToday();
                setImpactDays(getImpactDays());
                setCompleted(true);
                setConfirm(true);
                if (view === 'city') setView('world');
                setTimeout(() => setConfirm(false), 5000);
                setTimeout(() => setLatest(null), 8000);
            }
        } catch {
            alert('No se pudo conectar. Intenta de nuevo.');
        } finally {
            setCompleting(false);
        }
    };

    return (
        <div className="resonance-page">
            <div className="resonance-header">
                <h2 className="resonance-title">Resonancia Compartida</h2>
                <p className="resonance-subtitle">
                    "Tu cambio personal es el primer acorde de la canción que sana al mundo"
                </p>
            </div>

            <section className="map-section">
                <div className="view-toggle-row">
                    <h3 className="section-label">
                        {view === 'city' ? 'Coquimbo Vibrante' : 'El Mundo'}
                    </h3>
                    <button className="view-toggle-btn" onClick={() => setView(v => v === 'city' ? 'world' : 'city')}>
                        {view === 'city' ? '🌍 Ver el mundo' : '📍 Mi ciudad'}
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {view === 'city' ? (
                        <motion.div key="city"
                            initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.35 }}>
                            <CoquimboMap communityData={communityData} />
                        </motion.div>
                    ) : (
                        <motion.div key="world"
                            initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.06 }} transition={{ duration: 0.35 }}>
                            <WorldMap stats={legacyStats} pulse={pulse} latestEvent={latestEvent} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            {mission && (
                <div className="legacy-card">
                    <div className="legacy-card-header">
                        <span className="legacy-icon">🌱</span>
                        <h3 className="legacy-title">Tu acción para el mundo</h3>
                    </div>
                    <p className="legacy-mission">{mission}</p>

                    <AnimatePresence>
                        {confirmation && (
                            <motion.div className="confirmation-msg"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4 }}>
                                ✨ Tu luz se ha unido a la resonancia global
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        className={`complete-btn${completed ? ' complete-btn--done' : ''}`}
                        onClick={handleComplete}
                        disabled={completing || completed}
                    >
                        {completing ? (
                            <span className="btn-loading">
                                <span className="spinner" /> Registrando...
                            </span>
                        ) : completed ? '✓ Acción completada' : 'Completar acción'}
                    </button>

                    <div className="legacy-footer">
                        <CircularProgress days={impactDays} />
                        <span className="legacy-path-label">Camino de Luz</span>
                    </div>
                </div>
            )}

            <footer className="resonance-footer">
                <em>"Starting with the man in the mirror..."</em>
            </footer>
        </div>
    );
}
