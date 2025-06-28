import React, { useEffect, useState } from 'react';
import { getMovieInfo } from '../services/apiService';
import styles from '../styles/MovieInfoPanel.module.css';

interface MovieInfoPanelProps {
  imdbId: string | null;
  onClose: () => void;
  side?: 'left' | 'right';
}

const MovieInfoPanel: React.FC<MovieInfoPanelProps> = ({ imdbId, onClose, side = 'right' }) => {
  const [info, setInfo] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (imdbId) {
      setInfo(null);
      setError(null);
      getMovieInfo(imdbId)
        .then(data => {
          if (data) {
            setInfo(data);
          } else {
            setError('获取影片信息失败');
          }
        })
        .catch(() => setError('获取影片信息失败'));
    }
  }, [imdbId]);

  if (!imdbId) {
    return null;
  }

  return (
    <div className={`${styles.panel} ${styles[side]}`}>
      <button className={styles.closeButton} onClick={onClose}>&times;</button>
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
      ) : error ? (
        <div className={styles.loading}>{error}</div>
      ) : (
        <div className={styles.loading}>加载中...</div>
      )}
    </div>
  );
};

export default MovieInfoPanel;
