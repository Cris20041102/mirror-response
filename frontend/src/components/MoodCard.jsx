import { getStateLabel, getStateGradient, getStateIcon } from '../utils/moodUtils';
import { getRelativeTime } from '../utils/timeUtils';
import MusicWidget from './MusicWidget';

export default function MoodCard({ entry }) {
    return (
        <div className="mood-card" style={{ background: getStateGradient(entry.polarity_score) }}>
            <div className="card-header">
                <span className="state-icon">{getStateIcon(entry.polarity_score)}</span>
                <div className="card-meta">
                    <div className="state-label">{getStateLabel(entry.polarity_score)}</div>
                    <div className="relative-time">{getRelativeTime(entry.timestamp)}</div>
                </div>
            </div>
            <p className="card-validation">{entry.validation}</p>
            <MusicWidget song={entry.song} />
        </div>
    );
}
