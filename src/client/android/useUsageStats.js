import { useState, useEffect, useCallback } from 'react';
import { NativeModules } from 'react-native';

const { UsageStatsModule } = NativeModules;


export const useUsageStats = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const usageData = await UsageStatsModule.getAggregateUsageData();
      setData(usageData);
    } catch (e) {
      console.error("Error fetching usage stats:", e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
};