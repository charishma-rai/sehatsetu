import { useState, useEffect } from 'react';

export function usePatients() {
  const [patients, setPatients] = useState([]);
  const [metrics, setMetrics] = useState({ total: 0, critical: 0, today_visits: 0, pending_followups: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/patients');
      if (!response.ok) throw new Error('Sync failed');
      const data = await response.json();
      if (data.success) {
        setPatients(data.patients);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Fast refresh for demo feel
    return () => clearInterval(interval);
  }, []);

  return { patients, metrics, loading, error, refetch: fetchData };
}

export default usePatients;
