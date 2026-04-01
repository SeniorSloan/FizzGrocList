"use client";

import { useState, useEffect, useCallback } from "react";

function getStoredValue<T>(key: string, initialValue: T): T {
  if (typeof window === "undefined") return initialValue;
  try {
    const item = window.localStorage.getItem(key);
    if (item) return JSON.parse(item);
  } catch {
    // ignore
  }
  return initialValue;
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Initialize directly from localStorage — no hydration gap
  const [storedValue, setStoredValue] = useState<T>(() => getStoredValue(key, initialValue));

  // Persist to localStorage whenever value changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      // ignore — quota exceeded, etc.
    }
  }, [key, storedValue]);

  // Stable setter that supports function updates
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(value);
  }, []);

  return [storedValue, setValue];
}
