import { parseSong } from '../utils/moodUtils';

export default function MusicWidget({ song }) {
    const { title, artist } = parseSong(song);
    return (
        <div className="music-widget">
            <span className="music-disc-icon">♫</span>
            <div className="music-info">
                <div className="music-title">{title}</div>
                {artist && <div className="music-artist">{artist}</div>}
            </div>
        </div>
    );
}
