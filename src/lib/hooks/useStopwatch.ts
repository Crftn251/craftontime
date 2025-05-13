"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

// Helper to safely get value from localStorage
const getLocalStorageValue = <T,>(key: string, defaultValue: T): T => {
  // This function is called during useState initialization,
  // so it needs to be robust for server-side execution where localStorage is not available.
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};

// Helper to safely set value in localStorage
const setLocalStorageValue = <T,>(key: string, value: T) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error)    {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
};

export const useStopwatch = (persistanceKey: string = 'stopwatchState') => {
  // Initialize with server-side defaults to prevent hydration mismatch
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState<boolean>(false); // To track client-side hydration

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Effect to load persisted state from localStorage on the client after hydration
  useEffect(() => {
    // Ensure this only runs on the client
    if (typeof window !== 'undefined') {
      const storedStartTime = getLocalStorageValue<number | null>(`${persistanceKey}_startTime`, null);
      const storedElapsedTime = getLocalStorageValue<number>(`${persistanceKey}_elapsedTime`, 0);
      const storedIsRunning = getLocalStorageValue<boolean>(`${persistanceKey}_isRunning`, false);

      setStartTime(storedStartTime);
      setElapsedTime(storedElapsedTime);
      setIsRunning(storedIsRunning);
      
      setIsHydrated(true); // Signal that client-side state is loaded
    }
  }, [persistanceKey]);


  // Effect to save state to localStorage whenever it changes, but only after hydration
  useEffect(() => {
    if (isHydrated) { // Only persist after initial state is loaded from localStorage
      setLocalStorageValue(`${persistanceKey}_startTime`, startTime);
      setLocalStorageValue(`${persistanceKey}_elapsedTime`, elapsedTime);
      setLocalStorageValue(`${persistanceKey}_isRunning`, isRunning);
    }
  }, [startTime, elapsedTime, isRunning, persistanceKey, isHydrated]);

  // Effect to handle the stopwatch interval
  useEffect(() => {
    // Only run the interval logic if hydrated and running with a valid start time
    if (isHydrated && isRunning && startTime !== null) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100); // Update every 100ms for smoother display
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, startTime, isHydrated]);

  const start = useCallback(() => {
    if (!isHydrated) return; // Don't allow actions before hydration
    if (!isRunning) {
      // If elapsedTime is > 0, it means we are resuming.
      // If elapsedTime is 0, it's a fresh start.
      const newStartTime = Date.now() - elapsedTime;
      setStartTime(newStartTime);
      setIsRunning(true);
    }
  }, [isRunning, elapsedTime, isHydrated]);

  const pause = useCallback(() => {
    if (!isHydrated) return;
    if (isRunning) {
      setIsRunning(false);
      // intervalRef clearing is handled by the interval useEffect
      // elapsedTime is already up-to-date due to the interval when it was running
    }
  }, [isRunning, isHydrated]);

  const stop = useCallback(() => {
    if (!isHydrated) return 0; // Return a default or handle appropriately
    
    const finalElapsedTime = isRunning && startTime !== null ? Date.now() - startTime : elapsedTime;
    
    setIsRunning(false);
    setStartTime(null);
    setElapsedTime(0);
    // intervalRef clearing is handled by the interval useEffect

    return finalElapsedTime; // Return the duration in ms
  }, [isRunning, startTime, elapsedTime, isHydrated]);

  const reset = useCallback(() => {
    if (!isHydrated) return;
    setIsRunning(false);
    setStartTime(null);
    setElapsedTime(0);
    // intervalRef clearing is handled by the interval useEffect
  }, [isHydrated]);

  const formatTime = (timeInMs: number): string => {
    const totalSeconds = Math.floor(timeInMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Return values that reflect server defaults until hydration is complete
  return { 
    elapsedTime: isHydrated ? elapsedTime : 0, 
    isRunning: isHydrated ? isRunning : false, 
    start, 
    pause, 
    stop, 
    reset, 
    formatTime,
    isHydrated // Consumers can use this if they need to show a loading state
  };
};