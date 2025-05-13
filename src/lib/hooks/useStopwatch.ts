"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

const getLocalStorageValue = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const storedValue = localStorage.getItem(key);
  return storedValue ? JSON.parse(storedValue) : defaultValue;
};

const setLocalStorageValue = <T,>(key: string, value: T) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
};

export const useStopwatch = (persistanceKey: string = 'stopwatchState') => {
  const [startTime, setStartTime] = useState<number | null>(() => getLocalStorageValue<number | null>(`${persistanceKey}_startTime`, null));
  const [elapsedTime, setElapsedTime] = useState<number>(() => getLocalStorageValue<number>(`${persistanceKey}_elapsedTime`, 0));
  const [isRunning, setIsRunning] = useState<boolean>(() => getLocalStorageValue<boolean>(`${persistanceKey}_isRunning`, false));
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalStorageValue(`${persistanceKey}_startTime`, startTime);
    setLocalStorageValue(`${persistanceKey}_elapsedTime`, elapsedTime);
    setLocalStorageValue(`${persistanceKey}_isRunning`, isRunning);
  }, [startTime, elapsedTime, isRunning, persistanceKey]);

  useEffect(() => {
    if (isRunning && startTime !== null) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100); // Update every 100ms for smoother display
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, startTime]);

  const start = useCallback(() => {
    if (!isRunning) {
      const newStartTime = Date.now() - elapsedTime; // Resume from where it was paused
      setStartTime(newStartTime);
      setIsRunning(true);
    }
  }, [isRunning, elapsedTime]);

  const pause = useCallback(() => {
    if (isRunning) {
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // elapsedTime is already up-to-date due to the interval
    }
  }, [isRunning]);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    const finalElapsedTime = startTime ? Date.now() - startTime : elapsedTime;
    setStartTime(null); // Reset startTime
    setElapsedTime(0); // Reset elapsedTime for next start
    return finalElapsedTime; // Return the duration
  }, [startTime, elapsedTime]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setStartTime(null);
    setElapsedTime(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const formatTime = (timeInMs: number): string => {
    const totalSeconds = Math.floor(timeInMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return { elapsedTime, isRunning, start, pause, stop, reset, formatTime };
};
