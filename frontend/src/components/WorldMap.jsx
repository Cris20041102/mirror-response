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

function toSVG(coords) { return PROJ(coords) || [0, 0]; }

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

function typeColor(type) {
      if (type === 'empatia') return '#4CAF50';
      if (type === 'gratitud') return '#D4AF37';
      return '#6495ED';
}

function AnimatedCounter({ value }) {
      return (
              <AnimatePresence mode="popLayout">
                    <motion.span
                                key={value}
                                initial={{ y: 12, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -12, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                style={{ display: 'inline-block' }}
                              >
                        {value}
                    </motion.span>
              </AnimatePresence>
            );
}

export default function WorldMap({ stats = [], pulse = 0, latestEvent = null }) {
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
    
      const allPoints = stats.map(s => ({
              coords: [s.lon, s.lat],
              count: s.count,
              avg: s.avg_score
      }));
    
      const total = pulse;
    
      return (
              <div className="world-map-wrapper">
                    <div className="pulse-bar">
                            <span className="pulse-dot" />
                            <span className="pulse-text">
                                      <strong><AnimatedCounter value={total} /></strong>
                                {' '}momentos de cambio encendidos en el mundo
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
                                                                              stroke="rgba(212,175,55,0.5)"
                                                                              strokeWidth={1.2}
                                                                              strokeLinecap="round"
                                                                              initial={{ pathLength: 0, opacity: 0.9 }}
                                                                              animate={{ pathLength: 1, opacity: 0 }}
                                                                              transition={{ duration: 3.2, ease: 'easeInOut' }}
                                                                            />
                                                        ))}
                                      </AnimatePresence>
                            
                                {/* Real markers from legacy_events */}
                                {allPoints.map((pt, i) => {
                                                        const r = Math.min(4 + pt.count * 0.8, 14);
                                                        const color = markerColor(pt.avg);
                                                        return (
                                                                          <Marker key={i} coordinates={pt.coords}>
                                                                                          <circle r={r} fill={color} opacity={0.85}
                                                                                                                style={{ filter: `drop-shadow(0 0 ${r}px ${color})` }} />
                                                                                          <circle r={r * 1.8} fill={color} opacity={0.1} />
                                                                          </Marker>
                                                                        );
                                        })}
                            
                                {/* New event marker with pop animation */}
                                      <AnimatePresence>
                                          {latestEvent && (
                                                          <Marker key={latestEvent.id} coordinates={[latestEvent.lon, latestEvent.lat]}>
                                                                          <motion.circle
                                                                                                r={10}
                                                                                                fill={typeColor(latestEvent.type)}
                                                                                                initial={{ scale: 0, opacity: 1 }}
                                                                                                animate={{ scale: [0, 1.6, 1], opacity: [1, 0.9, 0.95] }}
                                                                                                transition={{ duration: 0.55, ease: 'easeOut' }}
                                                                                                style={{ filter: `drop-shadow(0 0 12px ${typeColor(latestEvent.type)})` }}
                                                                                              />
                                                                          <motion.circle
                                                                                                r={10}
                                                                                                fill="none"
                                                                                                stroke={typeColor(latestEvent.type)}
                                                                                                strokeWidth={1.5}
                                                                                       h         initial={{ scale: 1, opacity: 0.9 }}
                                                                                                animate={{ scale: 4, opacity: 0 }}
                                                                                                transition={{ duration: 1.6, repeat: 2, ease: 'easeOut' }}
                                                                                              />
                                                          </Marker>
                                                  ))
                                      </AnimatePresence>
                            </ComposableMap>
                    </div>
              
                    <div className="map-legend world-legend">
                            <span style={{ color: '#4CAF50' }}>● Empatía</span>
                            <span style={{ color: '#D4AF37' }}>● Gratitud</span>
                            <span style={{ color: '#6495ED' }}>● Paciencia</span>
                    </div>
              </div>
            );
}</AnimatePresence>
