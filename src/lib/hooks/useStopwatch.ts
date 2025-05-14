
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import type { PauseInterval } from '@/lib/types';

// Helper to safely get value from localStorage
const getLocalStorageValue = <T,>(key: string, defaultValue: T): T => {
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
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentPauseStartTime, setCurrentPauseStartTime] = useState<number | null>(null);
  const [sessionPauseIntervals, setSessionPauseIntervals] = useState<PauseInterval[]>([]);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setStartTime(getLocalStorageValue<number | null>(`${persistanceKey}_startTime`, null));
      setElapsedTime(getLocalStorageValue<number>(`${persistanceKey}_elapsedTime`, 0));
      setIsRunning(getLocalStorageValue<boolean>(`${persistanceKey}_isRunning`, false));
      setCurrentPauseStartTime(getLocalStorageValue<number | null>(`${persistanceKey}_currentPauseStartTime`, null));
      setSessionPauseIntervals(getLocalStorageValue<PauseInterval[]>(`${persistanceKey}_sessionPauseIntervals`, []));
      setIsHydrated(true);
    }
  }, [persistanceKey]);

  useEffect(() => {
    if (isHydrated) {
      setLocalStorageValue(`${persistanceKey}_startTime`, startTime);
      setLocalStorageValue(`${persistanceKey}_elapsedTime`, elapsedTime);
      setLocalStorageValue(`${persistanceKey}_isRunning`, isRunning);
      setLocalStorageValue(`${persistanceKey}_currentPauseStartTime`, currentPauseStartTime);
      setLocalStorageValue(`${persistanceKey}_sessionPauseIntervals`, sessionPauseIntervals);
    }
  }, [startTime, elapsedTime, isRunning, currentPauseStartTime, sessionPauseIntervals, persistanceKey, isHydrated]);

  useEffect(() => {
    if (isHydrated && isRunning && startTime !== null) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
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
    if (!isHydrated) return;
    
    if (currentPauseStartTime) { // Resuming from a pause
      const pauseEndTime = Date.now();
      const newInterval: PauseInterval = { startTime: currentPauseStartTime, endTime: pauseEndTime };
      setSessionPauseIntervals(prevIntervals => [...prevIntervals, newInterval]);
      setCurrentPauseStartTime(null);
    }
    
    // Adjust startTime to account for the elapsedTime already accrued
    setStartTime(Date.now() - elapsedTime); 
    setIsRunning(true);
  }, [isHydrated, currentPauseStartTime, elapsedTime]);

  const pause = useCallback(() => {
    if (!isHydrated || !isRunning) return;
    setIsRunning(false); // This will stop the interval via useEffect
    setCurrentPauseStartTime(Date.now());
    // elapsedTime is already up-to-date from the interval
  }, [isHydrated, isRunning]);

  const stop = useCallback(() => {
    if (!isHydrated) return { duration: 0, pauseIntervals: [] };
    
    const finalElapsedTime = isRunning && startTime !== null ? Date.now() - startTime : elapsedTime;
    let finalPauseIntervals = [...sessionPauseIntervals];

    if (!isRunning && currentPauseStartTime) { // Stopped while in a paused state
      finalPauseIntervals.push({ startTime: currentPauseStartTime, endTime: Date.now() });
    }

    const returnedIntervals = [...finalPauseIntervals];

    // Reset state
    setIsRunning(false);
    setStartTime(null);
    setElapsedTime(0);
    setCurrentPauseStartTime(null);
    setSessionPauseIntervals([]);
    
    return { duration: finalElapsedTime, pauseIntervals: returnedIntervals };
  }, [isHydrated, isRunning, startTime, elapsedTime, currentPauseStartTime, sessionPauseIntervals]);

  const reset = useCallback(() => {
    if (!isHydrated) return;
    setIsRunning(false);
    setStartTime(null);
    setElapsedTime(0);
    setCurrentPauseStartTime(null);
    setSessionPauseIntervals([]);
  }, [isHydrated]);

  const formatTime = (timeInMs: number): string => {
    const totalSeconds = Math.floor(timeInMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return { 
    elapsedTime: isHydrated ? elapsedTime : 0, 
    isRunning: isHydrated ? isRunning : false, 
    start, 
    pause, 
    stop, 
    reset, 
    formatTime,
    isHydrated
  };
};
