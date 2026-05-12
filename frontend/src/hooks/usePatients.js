import { useState, useEffect } from 'react';
import hardcodedPatients from '../data/patients';

/**
 * Hook to fetch patients from RiskSense backend.
 * Falls back to hardcoded data if fetch fails.
 */
export function usePatients() {
  const [patients, setPatients] = useState(hardcodedPatients);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPatients() {
      try {
        const response = await fetch('http://localhost:5000/api/riskscore', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}), // Sending empty object as per backend update
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (data.success && data.patients) {
          setPatients(data.patients);
        } else {
          throw new Error('Invalid data format from backend');
        }
      } catch (err) {
        console.error('Backend connection failed, using hardcoded fallback:', err);
        setError(err.message);
        setPatients(hardcodedPatients);
      } finally {
        setLoading(false);
      }
    }

    fetchPatients();
  }, []);

  return { patients, loading, error };
}

export default usePatients;
