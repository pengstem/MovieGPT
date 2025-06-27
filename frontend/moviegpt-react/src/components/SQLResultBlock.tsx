import React, { useState } from 'react';
import styles from '../styles/Message.module.css';

interface Result {
  sql?: string;
  rows?: any;
  error?: string;
}

interface SQLResultBlockProps {
  result: Result;
}

const SQLResultBlock: React.FC<SQLResultBlockProps> = ({ result }) => {
  const [showFullRows, setShowFullRows] = useState(false);

  const resultString = result.rows ? JSON.stringify(result.rows, null, 2) : '';
  const lines = resultString.split('\n');
  const truncated = lines.slice(0, 3).join('\n');
  const hasMore = lines.length > 3;

  return (
    <details className={styles.sqlBlock}>
      <summary className={styles.sqlSummary}>SQL 查询详情</summary>
      {result.sql && (
        <div className={styles.sqlQuery}>
          <code>{result.sql}</code>
        </div>
      )}
      {result.rows && (
        <div className={styles.sqlRows}>
          <pre>{showFullRows || !hasMore ? resultString : `${truncated}\n...`}</pre>
          {hasMore && (
            <button
              className={styles.toggleButton}
              onClick={() => setShowFullRows(!showFullRows)}
            >
              {showFullRows ? '折叠' : '展开'}
            </button>
          )}
        </div>
      )}
      {result.error && <pre>{result.error}</pre>}
    </details>
  );
};

export default SQLResultBlock;
