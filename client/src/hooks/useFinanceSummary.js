import { useState, useEffect, useCallback } from 'react';
import analyticsService from '../services/analyticsService';

export function useFinanceSummary(month, year) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const data = await analyticsService.getSummary(month, year);
      setSummary(data?.data || data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch financial summary');
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, error, refetch: fetchSummary };
}

export default useFinanceSummary;

