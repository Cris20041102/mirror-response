export default function BottomNav({ active, onChange, lastScore }) {
    const glowColor =
        lastScore > 0.3 ? '#4CAF50' :
        lastScore > 0   ? '#D4AF37' : '#6495ED';

    const tabs = [
        { id: 'mirror',    icon: '◎', label: 'Espejo'    },
        { id: 'history',   icon: '✦', label: 'Historial' },
        { id: 'resonance', icon: '◉', label: 'Legado'    },
    ];

    return (
        <nav className="bottom-nav">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    className={`nav-tab${active === tab.id ? ' nav-tab--active' : ''}`}
                    onClick={() => onChange(tab.id)}
                    style={active === tab.id ? { '--glow': glowColor } : {}}
                >
                    <span className="nav-icon">{tab.icon}</span>
                    <span className="nav-label">{tab.label}</span>
                </button>
            ))}
        </nav>
    );
}
