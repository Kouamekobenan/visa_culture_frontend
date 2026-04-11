// src/hooks/useFetch.ts
import { useState, useEffect } from "react";
export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        if (!response.ok) throw new Error("Erreur réseau");
        const result: T = await response.json();
        setData(result);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Une erreur inconnue est survenue");
        }
      } finally {
        setLoading(false);
      }
    };
    if (url) fetchData();
  }, [url]);
  return { data, loading, error };
}
// HOW USE

/***
 * // 1. Définis l'interface de ton objet Événement
interface EventData {
  id: string;
  title: string;
  price: number;
  date: string;
}

export default function EventList() {
  // 2. Passe l'interface au hook (au lieu de le laisser en 'any')
  const { data, loading } = useFetch<EventData[]>("/api/events");

  return (
    <div>
      {data?.map(event => (
        <h2 key={event.id}>{event.title}</h2> // TypeScript sait maintenant que event.title existe !
      ))}
    </div>
  );
}
 */