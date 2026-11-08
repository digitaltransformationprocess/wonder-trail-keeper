import { useEffect, useState, useCallback } from "react";

function useList(key: string, max = 99) {
  const [list, setList] = useState<string[]>([]);
  useEffect(() => {
    const read = () => setList(JSON.parse(localStorage.getItem(key) || "[]"));
    read();
    window.addEventListener(`store:${key}`, read);
    return () => window.removeEventListener(`store:${key}`, read);
  }, [key]);
  const toggle = useCallback((slug: string) => {
    const cur: string[] = JSON.parse(localStorage.getItem(key) || "[]");
    const next = cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug].slice(-max);
    localStorage.setItem(key, JSON.stringify(next));
    window.dispatchEvent(new Event(`store:${key}`));
  }, [key, max]);
  return { list, toggle, has: (s: string) => list.includes(s) };
}

export const useFavorites = () => useList("aidp:favorites");
export const useCompare = () => useList("aidp:compare", 4);
