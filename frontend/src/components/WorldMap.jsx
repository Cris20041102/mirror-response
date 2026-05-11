import { useState, useEffect, useRef } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { motion, AnimatePresence } from 'framer-motion';
import { geoMercator } from 'd3-geo';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
const MAP_W = 800;
const MAP_H = 400;

const PROJ = geoMercator().scale(130).translate([MAP_W / 2, MAP_H / 2 + 30]);

const RESONANCE_PAIRS = [
    [[-70.65, -33.44], [139.69, 35.68]],
    [[-70.65, -33.44], [2.35, 48.85]],
    [[-70.65, -33.44], [-74.0, 40.71]],
    [[-46.6, -23.5],   [36.82, -1.29]],
    [[139.69, 35.68],  [2.35, 48.85]],
    [[72.87, 19.07],   [151.2, -33.8]],
    [[-74.0, 40.71],   [36.82, -1.29]],
    [[2.35, 48.85],    [151.2, -33.8]],
];

function toSVG(coords) {
    const p = PROJ(coords);
    return p || [0, 0];
}

function buildCurve(a, b) {
    const [x1, y1] = toSVG(a);
    const [x2, y2] = toSVG(b);
    const mx = (x1 + x2) / 2;
    const my = Math.min(y1, y2) - 55;
    return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
}

function markerColor(avgScore) {
    if (avgScore > 0.4) return '#4CAF50';
    if (avgScore > 0)   return '#D4AF37';
    return '#6495ED';
}

export default function WorldMap({ stats = [], pulse = 0 }) {
    const [lines, setLines] = useState([]);
    const lineId = useRef(0);

    useEffect(() => {
        const interval = setInterval(() => {
            const pair = RESONANCE_PAIRS[Math.floor(Math.random() * RESONANCE_PAIRS.length)];
            const id = lineId.current++;
            setLines(prev => [...prev.slice(-3), { id, pair }]);
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    const allPoints = [
        { coords: [-70.65, -33.44], count: 1, avg: 0.6, label: 'Chile' },
        ...stats.map(s => ({ coords: [s.lon, s.lat], count: s.count, avg: s.avg_score, label: s.country }))
    ];

    return (
        <div className="world-map-wrapper">
            <div className="pulse-bar">
                <span className="pulse-dot" />
                <span className="pulse-text">
                    <strong>{pulse + allPoints.reduce((s, p) => s + p.count, 0)}</strong> momentos de cambio encendidos en el mundo
                </span>
            </div>

            <div className="world-map-container">
                <ComposableMap
                    projection="geoMercator"
                    projectionConfig={{ scale: 130, center: [0, 10] }}
                    width={MAP_W}
                    height={MAP_H}
                    style={{ background: '#0A0F1E', borderRadius: '16px' }}
                >
                    <Geographies geography={GEO_URL}>
                        {({ geographies }) =>
                            geographies.map(geo => (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    fill="#1C2A40"
                                    stroke="#243550"
                                    strokeWidth={0.4}
                                    style={{ default: { outline: 'none' }, hover: { fill: '#243550', outline: 'none' } }}
                                />
                            ))
                        }
                    </Geographies>

                    {/* Resonance lines */}
                    <AnimatePresence>
                        {lines.map(({ id, pair }) => (
                            <motion.path
                                key={id}
                                d={buildCurve(pair[0], pair[1])}
                                fill="none"
                                stroke="rgba(212,175,55,0.55)"
                                strokeWidth={1.2}
                                strokeLinecap="round"
                                initial={{ pathLength: 0, opacity: 0.9 }}
                                animate={{ pathLength: 1, opacity: 0 }}
                                transition={{ duration: 3.2, ease: 'easeInOut' }}
                            />
                        ))}
                    </AnimatePresence>

                    {/* Legacy markers */}
                    {allPoints.map((pt, i) => {
                        const r = Math.min(4 + pt.count * 0.8, 14);
                        const color = markerColor(pt.avg);
                        return (
                            <Marker key={i} coordinates={pt.coords}>
                                <circle r={r} fill={color} opacity={0.85} style={{ filter: `drop-shadow(0 0 ${r}px ${color})` }} />
                                <circle r={r * 1.8} fill={color} opacity={0.12} />
                            </Marker>
                        );
                    })}
                </ComposableMap>
            </div>

            <div className="map-legend world-legend">
                <span style={{ color: '#4CAF50' }}>● Empatía</span>
                <span style={{ color: '#D4AF37' }}>● Gratitud</span>
                <span style={{ color: '#6495ED' }}>● Paciencia</span>
            </div>
        </div>
    );
}
