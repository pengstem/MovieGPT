import React, { useState, useEffect } from 'react';
import { exampleQueries, exampleQueriesMap, refreshExampleQueries } from '../utils/mockData';
import styles from '../styles/App.module.css';

interface ExampleQueriesProps {
  onQuerySelect: (query: string) => void;
  shouldRefresh?: boolean;
  shouldHide?: boolean;
}

const ExampleQueries: React.FC<ExampleQueriesProps> = ({ onQuerySelect, shouldRefresh, shouldHide }) => {
  const [currentQueries, setCurrentQueries] = useState<string[]>(exampleQueries);

  useEffect(() => {
    // 监听shouldRefresh的任何变化，无论true还是false都刷新
    const newQueries = refreshExampleQueries(6);
    setCurrentQueries(newQueries);
  }, [shouldRefresh]);

  const handleQueryClick = (queryKey: string) => {
    const fullQuery = exampleQueriesMap[queryKey];
    onQuerySelect(fullQuery);
  };

  // 如果需要隐藏，直接返回null
  if (shouldHide) {
    return null;
  }

  return (
    <div className={styles.exampleQueries}>
      {currentQueries.map((query, index) => (
        <button
          type="button"
          key={`${query}-${index}`}
          className={styles.exampleQuery}
          onClick={() => handleQueryClick(query)}
        >
          {query}
        </button>
      ))}
    </div>
  );
};

export default ExampleQueries; 