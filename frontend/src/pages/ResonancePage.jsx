import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CoquimboMap from '../components/CoquimboMap';
import WorldMap from '../components/WorldMap';
import CircularProgress from '../components/CircularProgress';
import { getImpactDays } from '../utils/storage';

const API = 'http://localhost:8000/api';

export default function ResonancePage({ lastScore }) {
    const [view, setView] = useState('city');
    const [communityData, setCommunityData] = useState({});
    const [legacyStats, setLegacyStats] = useState([]);
    const [pulse, setPulse] = useState(0);
    const [mission, setMission] = useState('');
    const impactDays = getImpactDays();

    useEffect(() => {
        fetch(`${API}/community`)
            .then(r => r.json())
            .then(d => setCommunityData(d.zones || {}))
            .catch(() => {});

        fetch(`${API}/legacy/stats`)
            .then(r => r.json())
            .then(d => setLegacyStats([...(d.real || []), ...(d.simulated || [])]))
            .catch(() => {});

        fetch(`${API}/legacy/pulse`)
            .then(r => r.json())
            .then(d => setPulse(d.total || 0))
            .catch(() => {});

        fetch(`${API}/mission?score=${lastScore}`)
            .then(r => r.json())
            .then(d => setMission(d.mission))
            .catch(() => setMission('Hoy, dedica un momento a respirar y notar el espacio a tu alrededor.'));
    }, [lastScore]);

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
                        <motion.div
                            key="city"
                            initial={{ opacity: 0, scale: 1.06 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ duration: 0.35 }}
                        >
                            <CoquimboMap communityData={communityData} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="world"
                            initial={{ opacity: 0, scale: 0.94 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.06 }}
                            transition={{ duration: 0.35 }}
                        >
                            <WorldMap stats={legacyStats} pulse={pulse} />
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
