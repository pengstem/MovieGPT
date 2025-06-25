import React from 'react';
import { exampleQueries, exampleQueriesMap } from '../utils/mockData';
import styles from '../styles/App.module.css';

interface ExampleQueriesProps {
  onQuerySelect: (query: string) => void;
}

const ExampleQueries: React.FC<ExampleQueriesProps> = ({ onQuerySelect }) => {
  const handleQueryClick = (queryKey: string) => {
    const fullQuery = exampleQueriesMap[queryKey];
    onQuerySelect(fullQuery);
  };

  return (
    <div className={styles.exampleQueries}>
      {exampleQueries.map((query, index) => (
        <div
          key={index}
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