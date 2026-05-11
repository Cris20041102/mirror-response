import { useState } from 'react';
import BottomNav from './components/BottomNav';
import MirrorPage from './pages/MirrorPage';
import HistoryPage from './pages/HistoryPage';
import ResonancePage from './pages/ResonancePage';

export default function App() {
    const [page, setPage] = useState('mirror');
    const [lastScore, setLastScore] = useState(0);

    return (
        <div className="app-root">
            <main className="page-container">
                {page === 'mirror'    && <MirrorPage onAnalyzed={setLastScore} />}
                {page === 'history'   && <HistoryPage />}
                {page === 'resonance' && <ResonancePage lastScore={lastScore} />}
            </main>
            <BottomNav active={page} onChange={setPage} lastScore={lastScore} />
        </div>
    );
}
