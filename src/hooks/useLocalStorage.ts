"use client";

import { useState, useCallback } from "react";

function getStorageValue<T>(key: string, initialValue: T): T {
  // SSR kontrolü
  if (typeof window === "undefined") {
    return initialValue;
  }

  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch (error) {
    console.error("LocalStorage read error:", error);
    return initialValue;
  }
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Lazy initialization - sadece ilk render'da çalışır
  const [storedValue, setStoredValue] = useState<T>(() =>
    getStorageValue(key, initialValue)
  );

  // Hydration durumu - client'ta her zaman true
  const isHydrated = typeof window !== "undefined";

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error("LocalStorage write error:", error);
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error("LocalStorage remove error:", error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue, isHydrated] as const;
}
