import { useState, useEffect, useCallback } from 'react';

export const useData = (fetchFn, deps = [], autoRefresh = false, refreshInterval = 60000) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetch = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await fetchFn();
            setData(result);
            setLastUpdated(new Date());
        } catch (err) {
            setError(err.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    }, deps);

    useEffect(() => {
        fetch();
        if (autoRefresh) {
            const interval = setInterval(fetch, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [fetch]);

    return { data, loading, error, refetch: fetch, lastUpdated };
};
