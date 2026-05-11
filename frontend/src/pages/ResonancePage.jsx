import { useState, useEffect } from 'react';
import CoquimboMap from '../components/CoquimboMap';
import CircularProgress from '../components/CircularProgress';
import { getImpactDays } from '../utils/storage';

const API = 'http://localhost:8000/api';

export default function ResonancePage({ lastScore }) {
    const [communityData, setCommunityData] = useState({});
    const [mission, setMission] = useState('');
    const impactDays = getImpactDays();

    useEffect(() => {
        fetch(`${API}/community`)
            .then(r => r.json())
            .then(d => setCommunityData(d.zones || {}))
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
                <h3 className="section-label">Coquimbo Vibrante</h3>
                <CoquimboMap communityData={communityData} />
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
