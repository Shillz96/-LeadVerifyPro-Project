import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for deferred data loading that prioritizes rendering
 * and improves LCP by deferring non-critical data fetching
 * 
 * @param {Function} fetchFunction - The async function that fetches data
 * @param {Array} dependencies - Dependencies array for useEffect
 * @param {number} deferTime - Time in ms to defer the data loading
 * @returns {Object} - The loading state and data
 */
function useDeferredData(fetchFunction, dependencies = [], deferTime = 100) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchFunction();
      setData(result);
    } catch (err) {
      setError(err);
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunction]);

  useEffect(() => {
    // Initial render will complete without blocking for data
    // This improves LCP by deferring non-critical data loading
    const timer = setTimeout(() => {
      fetchData();
    }, deferTime);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies]);

  // Function to manually refetch data
  const refetch = () => {
    fetchData();
  };

  return { data, isLoading, error, refetch };
}

export default useDeferredData; 