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
