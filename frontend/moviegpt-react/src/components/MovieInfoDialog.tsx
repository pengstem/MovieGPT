import React, { useEffect, useState } from 'react';
import { getMovieInfo } from '../services/apiService';
import styles from '../styles/MovieInfoDialog.module.css';

interface MovieInfoDialogProps {
  imdbId: string | null;
  onClose: () => void;
}

const MovieInfoDialog: React.FC<MovieInfoDialogProps> = ({ imdbId, onClose }) => {
  const [info, setInfo] = useState<any | null>(null);

  useEffect(() => {
    if (imdbId) {
      setInfo(null);
      getMovieInfo(imdbId).then(data => setInfo(data));
    }
  }, [imdbId]);

  if (!imdbId) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
        {info ? (
          <div className={styles.content}>
            {info.Poster && info.Poster !== 'N/A' && (
              <img src={info.Poster} alt={info.Title} className={styles.poster} />
            )}
            <h2 className={styles.title}>
              {info.Title} ({info.Year})
            </h2>
            <p className={styles.plot}>{info.Plot}</p>
          </div>
        ) : (
          <div className={styles.loading}>加载中...</div>
        )}
      </div>
    </div>
  );
};

export default MovieInfoDialog;
