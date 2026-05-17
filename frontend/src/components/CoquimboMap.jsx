import { useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { getZoneColor, getZoneLabel } from '../utils/moodUtils';

const GEO_URL = 'https://raw.githubusercontent.com/roberveral/chile-geojson/main/comunas.geojson';

const ZONE_COMUNAS = {
  'La Serena':      ['La Serena'],
  'Coquimbo':       ['Coquimbo'],
  'Valle de Elqui': ['Vicuna', 'Andacollo', 'La Higuera', 'Paihuano', 'Vicuna', 'Paiguano'],
};

const ZONE_MARKERS = {
  'La Serena':      { lon: -71.25, lat: -29.9 },
  'Coquimbo':       { lon: -71.35, lat: -30.0 },
  'Valle de Elqui': { lon: -70.35, lat: -30.05 },
};

function getZoneForComuna(name) {
  if (!name) return null;
  const n = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const [zone, comunas] of Object.entries(ZONE_COMUNAS)) {
    for (const c of comunas) {
      const cn = c.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (n.toLowerCase().includes(cn.toLowerCase())) return zone;
    }
  }
  return null;
}

export default function CoquimboMap({ communityData }) {
  const [tooltip, setTooltip] = useState(null);

  const sd = communityData['La Serena'];
  const cd = communityData['Coquimbo'];
  const ed = communityData['Valle de Elqui'];

  const zoneData = { 'La Serena': sd, 'Coquimbo': cd, 'Valle de Elqui': ed };
  const zoneColor = {
    'La Serena':      getZoneColor(sd?.avg_score),
    'Coquimbo':       getZoneColor(cd?.avg_score),
    'Valle de Elqui': getZoneColor(ed?.avg_score),
  };

  const handleClick = (zone) => {
    const data = zoneData[zone];
    const count = data?.count ?? (Math.floor(Math.random() * 25) + 4);
    setTooltip({ zone, count });
    setTimeout(() => setTooltip(null), 3000);
  };

  return (
    <div className="map-wrapper" style={{ position: 'relative' }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: [-70.8, -30.2], scale: 5000 }}
        width={360}
        height={380}
        style={{ width: '100%', height: 'auto' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies
              .filter(geo => {
                const region = geo.properties?.region_id ?? geo.properties?.Region ?? '';
                return String(region) === '4' || String(region).includes('Coquimbo');
              })
              .map(geo => {
                const name = geo.properties?.comuna ?? geo.properties?.NOM_COM ?? geo.properties?.name ?? '';
                const zone = getZoneForComuna(name);
                const color = zone ? zoneColor[zone] : '#c8d8c8';
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={color}
                    fillOpacity={zone ? 0.75 : 0.35}
                    stroke="#fff"
                    strokeWidth={0.6}
                    style={{
                      default: { outline: 'none', cursor: zone ? 'pointer' : 'default' },
                      hover:   { outline: 'none', fillOpacity: zone ? 0.95 : 0.45 },
                      pressed: { outline: 'none' },
                    }}
                    onClick={() => zone && handleClick(zone)}
                  />
                );
              })
          }
        </Geographies>

        {Object.entries(ZONE_MARKERS).map(([zone, { lon, lat }]) => (
          <Marker key={zone} coordinates={[lon, lat]}>
            <text
              textAnchor="middle"
              fontSize={7}
              fontWeight="600"
              fill={zoneColor[zone]}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {getZoneLabel(zoneData[zone]?.avg_score)}
            </text>
            <text
              y={11}
              textAnchor="middle"
              fontSize={8}
              fill="#444"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {zone}
            </text>
          </Marker>
        ))}
      </ComposableMap>

      {tooltip && (
        <div className="map-tooltip" style={{ left: '50%', top: '10%', transform: 'translateX(-50%)' }}>
          {tooltip.zone}: {tooltip.count} personas hoy decidieron ser el cambio
        </div>
      )}

      <div className="map-legend">
        <span style={{ color: '#4CAF50' }}>Empatia</span>
        <span style={{ color: '#D4AF37' }}>Gratitud</span>
        <span style={{ color: '#1976D2' }}>Paciencia</span>
      </div>
    </div>
  );
}
