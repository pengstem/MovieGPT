import React, { useEffect, useState } from 'react';
import { getMovieInfo } from '../services/apiService';
import styles from '../styles/MovieInfoPanel.module.css';

interface MovieInfoPanelProps {
  imdbId: string | null;
  side?: 'left' | 'right';
  variant?: 'poster' | 'details' | 'full';
}

const MovieInfoPanel: React.FC<MovieInfoPanelProps> = ({ imdbId, side = 'right', variant = 'full' }) => {
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

  const renderNames = (names: string) =>
    names.split(',').map((n: string, idx: number, arr: string[]) => (
      <span key={n.trim()}>
        <a
          href={`https://en.wikipedia.org/wiki/${encodeURIComponent(n.trim())}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {n.trim()}
        </a>
        {idx < arr.length - 1 ? ', ' : ''}
      </span>
    ));

  const countryFlags: Record<string, string> = {
    'United States': '🇺🇸',
    'United Kingdom': '🇬🇧',
    China: '🇨🇳',
    France: '🇫🇷',
    Germany: '🇩🇪',
    Japan: '🇯🇵',
    Canada: '🇨🇦',
    Italy: '🇮🇹',
    Spain: '🇪🇸',
    India: '🇮🇳',
    Russia: '🇷🇺',
    Australia: '🇦🇺',
    'South Korea': '🇰🇷',
  };

  const renderCountries = (countries: string) =>
    countries.split(',').map((c) => {
      const name = c.trim();
      const flag = countryFlags[name] || '🏳️';
      return (
        <span key={name} title={name} style={{ marginRight: '4px' }}>
          {flag}
        </span>
      );
    });

  const ratingLogo = (source: string) => {
    switch (source) {
      case 'Internet Movie Database':
        return <i className="fab fa-imdb" style={{ color: '#f5c518' }}></i>;
      case 'Rotten Tomatoes':
        return <span style={{ color: 'red' }}>🍅</span>;
      case 'Metacritic':
        return <i className="fas fa-chart-bar" style={{ color: 'green' }}></i>;
      default:
        return null;
    }
  };

  const renderRatings = (ratings: any[]) => (
    <ul className={styles.ratings}>
      {ratings.map((r) => (
        <li key={r.Source} className={styles.ratingItem}>
          <span className={styles.ratingLogo}>{ratingLogo(r.Source)}</span>
          <span>{r.Source}: {r.Value}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className={`${styles.panel} ${styles[side]}`}>
      {info ? (
        <div className={styles.content}>
          {variant !== 'details' && info.Poster && info.Poster !== 'N/A' && (
            <img src={info.Poster} alt={info.Title} className={styles.poster} />
          )}
          {variant !== 'details' && (
            <>
              <h2 className={styles.title}>
                {info.Title} ({info.Year})
              </h2>
              <p className={styles.plot}>{info.Plot}</p>
            </>
          )}
          {variant !== 'poster' && (
            <div className={styles.extra}>
              <p>
                <strong>导演:</strong> {renderNames(info.Director)}
              </p>
              <p>
                <strong>编剧:</strong> {renderNames(info.Writer)}
              </p>
              <p>
                <strong>主演:</strong> {renderNames(info.Actors)}
              </p>
              <p>
                <strong>类型:</strong> {info.Genre}
              </p>
              <p>
                <strong>语言:</strong> {info.Language}
              </p>
              <p>
                <strong>国家:</strong> {renderCountries(info.Country)}
              </p>
              <p>
                <strong>上映:</strong> {info.Released}
              </p>
              <p>
                <strong>片长:</strong> {info.Runtime}
              </p>
              <p>
                <strong>评分:</strong>
              </p>
              {info.Ratings && renderRatings(info.Ratings)}
              <p>
                <strong>IMDb 评分:</strong> {info.imdbRating} ({info.imdbVotes} 票)
              </p>
              <p>
                <strong>Metascore:</strong> {info.Metascore}
              </p>
              <p>
                <strong>奖项:</strong> {info.Awards}
              </p>
              {info.BoxOffice && (
                <p>
                  <strong>票房:</strong>{' '}
                  <a
                    href={`https://www.boxofficemojo.com/title/${info.imdbID}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {info.BoxOffice}
                  </a>
                </p>
              )}
            </div>
          )}
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
