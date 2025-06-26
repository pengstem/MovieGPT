import React, { useState, useEffect } from 'react';
import { exampleQueries, exampleQueriesMap, refreshExampleQueries } from '../utils/mockData';
import styles from '../styles/App.module.css';

interface ExampleQueriesProps {
  onQuerySelect: (query: string) => void;
  shouldRefresh?: boolean;
}

const ExampleQueries: React.FC<ExampleQueriesProps> = ({ onQuerySelect, shouldRefresh }) => {
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

  return (
    <div className={styles.exampleQueries}>
      {currentQueries.map((query, index) => (
        <div
          key={`${query}-${index}`}
          className={styles.exampleQuery}
          onClick={() => handleQueryClick(query)}
        >
          {query}
        </div>
      ))}
    </div>
  );
};

export default ExampleQueries; 