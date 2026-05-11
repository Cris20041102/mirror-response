import { useState } from 'react';
import { getZoneColor, getZoneLabel } from '../utils/moodUtils';

const PARTICLES = {
    serena:  [{ x:82,y:195 },{ x:70,y:208 },{ x:96,y:203 },{ x:78,y:218 },{ x:93,y:186 },{ x:66,y:198 }],
    coquimbo:[{ x:79,y:258 },{ x:68,y:266 },{ x:93,y:254 },{ x:76,y:272 },{ x:87,y:247 }],
    elqui:   [{ x:192,y:174 },{ x:213,y:161 },{ x:228,y:169 },{ x:203,y:186 },{ x:218,y:154 },{ x:238,y:163 },{ x:248,y:149 }],
};

export default function CoquimboMap({ communityData }) {
    const [tooltip, setTooltip] = useState(null);

    const sd = communityData['La Serena'];
    const cd = communityData['Coquimbo'];
    const ed = communityData['Valle de Elqui'];

    const sc = getZoneColor(sd?.avg_score);
    const cc = getZoneColor(cd?.avg_score);
    const ec = getZoneColor(ed?.avg_score);

    const showTooltip = (zone, data, xPct, yPct) => {
        const count = data?.count ?? (Math.floor(Math.random() * 25) + 4);
        setTooltip({ zone, count, x: xPct, y: yPct });
        setTimeout(() => setTooltip(null), 3000);
    };

    return (
        <div className="map-wrapper">
            <svg viewBox="0 0 360 380" className="coquimbo-svg">
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3.5" result="blur"/>
                        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                    {[['sGrad', sc], ['cGrad', cc], ['eGrad', ec]].map(([id, color]) => (
                        <radialGradient key={id} id={id} cx="50%" cy="50%" r="50%">
                            <stop offset="0%"   stopColor={color} stopOpacity="0.85"/>
                            <stop offset="100%" stopColor={color} stopOpacity="0.18"/>
                        </radialGradient>
                    ))}
                </defs>

                {/* Region background — artistic liquid shape */}
                <path
                    d="M40,100 C50,80 80,70 100,80 C140,60 200,70 280,90 C320,100 340,130 330,160 C310,200 280,230 250,260 C210,300 180,340 120,360 C80,370 40,350 30,310 C20,270 25,230 30,190 C35,150 30,120 40,100Z"
                    fill="rgba(240,248,255,0.55)" stroke="rgba(180,200,220,0.35)" strokeWidth="1.5"
                />

                {/* La Serena */}
                <ellipse cx="85" cy="202" rx="42" ry="30" fill="url(#sGrad)" filter="url(#glow)"
                    style={{ cursor:'pointer' }} onClick={() => showTooltip('La Serena', sd, 24, 46)} />
                <text x="85" y="213" textAnchor="middle" fontSize="7.5" fill={sc} fontWeight="700">{getZoneLabel(sd?.avg_score)}</text>
                <text x="85" y="243" textAnchor="middle" fontSize="9.5" fill="#555" fontWeight="500">La Serena</text>

                {/* Coquimbo */}
                <ellipse cx="79" cy="263" rx="36" ry="22" fill="url(#cGrad)" filter="url(#glow)"
                    style={{ cursor:'pointer' }} onClick={() => showTooltip('Coquimbo', cd, 22, 63)} />
                <text x="79" y="271" textAnchor="middle" fontSize="7.5" fill={cc} fontWeight="700">{getZoneLabel(cd?.avg_score)}</text>
                <text x="79" y="297" textAnchor="middle" fontSize="9.5" fill="#555" fontWeight="500">Coquimbo</text>

                {/* Valle de Elqui */}
                <path d="M115,200 C150,180 190,160 240,145 C270,135 300,140 290,160 C275,185 240,195 200,205 C170,210 140,215 115,210Z"
                    fill="url(#eGrad)" filter="url(#glow)" style={{ cursor:'pointer' }}
                    onClick={() => showTooltip('Valle de Elqui', ed, 56, 42)} />
                <text x="208" y="183" textAnchor="middle" fontSize="7.5" fill={ec} fontWeight="700">{getZoneLabel(ed?.avg_score)}</text>
                <text x="208" y="222" textAnchor="middle" fontSize="9.5" fill="#555" fontWeight="500">Valle de Elqui</text>

                {/* Particles */}
                {PARTICLES.serena.map((p, i) => (
                    <circle key={`s${i}`} cx={p.x} cy={p.y} r={2.5} fill={sc} opacity={0.88}
                        className="map-particle" style={{ animationDelay:`${i*0.4}s` }} />
                ))}
                {PARTICLES.coquimbo.map((p, i) => (
                    <circle key={`c${i}`} cx={p.x} cy={p.y} r={2.5} fill={cc} opacity={0.88}
                        className="map-particle" style={{ animationDelay:`${i*0.5+0.2}s` }} />
                ))}
                {PARTICLES.elqui.map((p, i) => (
                    <circle key={`e${i}`} cx={p.x} cy={p.y} r={2} fill={ec} opacity={0.82}
                        className="map-particle" style={{ animationDelay:`${i*0.3+0.1}s` }} />
                ))}
            </svg>

            {tooltip && (
                <div className="map-tooltip" style={{ left:`${tooltip.x}%`, top:`${tooltip.y}%` }}>
                    Aquí, {tooltip.count} personas hoy decidieron ser el cambio
                </div>
            )}

            <div className="map-legend">
                <span style={{ color:'#4CAF50' }}>● Empatía</span>
                <span style={{ color:'#D4AF37' }}>● Gratitud</span>
                <span style={{ color:'#1976D2' }}>● Paciencia</span>
            </div>
        </div>
    );
}
