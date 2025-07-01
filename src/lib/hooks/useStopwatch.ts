
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
  const [initialStartTime, setInitialStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentPauseStartTime, setCurrentPauseStartTime] = useState<number | null>(null);
  const [accumulatedPauseDuration, setAccumulatedPauseDuration] = useState<number>(0);
  const [sessionPauseIntervals, setSessionPauseIntervals] = useState<PauseInterval[]>([]);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Hydration from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setInitialStartTime(getLocalStorageValue<number | null>(`${persistanceKey}_initialStartTime`, null));
      setElapsedTime(getLocalStorageValue<number>(`${persistanceKey}_elapsedTime`, 0));
      setIsRunning(getLocalStorageValue<boolean>(`${persistanceKey}_isRunning`, false));
      setCurrentPauseStartTime(getLocalStorageValue<number | null>(`${persistanceKey}_currentPauseStartTime`, null));
      setAccumulatedPauseDuration(getLocalStorageValue<number>(`${persistanceKey}_accumulatedPauseDuration`, 0));
      setSessionPauseIntervals(getLocalStorageValue<PauseInterval[]>(`${persistanceKey}_sessionPauseIntervals`, []));
      setIsHydrated(true);
    }
  }, [persistanceKey]);

  // Persistance to localStorage
  useEffect(() => {
    if (isHydrated) {
      setLocalStorageValue(`${persistanceKey}_initialStartTime`, initialStartTime);
      setLocalStorageValue(`${persistanceKey}_elapsedTime`, elapsedTime);
      setLocalStorageValue(`${persistanceKey}_isRunning`, isRunning);
      setLocalStorageValue(`${persistanceKey}_currentPauseStartTime`, currentPauseStartTime);
      setLocalStorageValue(`${persistanceKey}_accumulatedPauseDuration`, accumulatedPauseDuration);
      setLocalStorageValue(`${persistanceKey}_sessionPauseIntervals`, sessionPauseIntervals);
    }
  }, [initialStartTime, elapsedTime, isRunning, currentPauseStartTime, accumulatedPauseDuration, sessionPauseIntervals, persistanceKey, isHydrated]);

  // The interval for updating the display
  useEffect(() => {
    if (isHydrated && isRunning && initialStartTime !== null) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const productiveTime = now - initialStartTime - accumulatedPauseDuration;
        setElapsedTime(productiveTime);
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
  }, [isRunning, initialStartTime, accumulatedPauseDuration, isHydrated]);

  const start = useCallback(() => {
    if (!isHydrated) return;
    
    if (currentPauseStartTime) { // Resuming from a pause
      const pauseDuration = Date.now() - currentPauseStartTime;
      setAccumulatedPauseDuration(prev => prev + pauseDuration);
      
      const newInterval: PauseInterval = { startTime: currentPauseStartTime, endTime: Date.now() };
      setSessionPauseIntervals(prevIntervals => [...prevIntervals, newInterval]);
      
      setCurrentPauseStartTime(null);
    } else if (!isRunning) { // Starting fresh only if not already running
      setInitialStartTime(Date.now() - elapsedTime); // Preserve elapsed time if any
      setAccumulatedPauseDuration(0);
      setSessionPauseIntervals([]);
    }
    
    setIsRunning(true);
  }, [isHydrated, currentPauseStartTime, isRunning, elapsedTime]);

  const pause = useCallback(() => {
    if (!isHydrated || !isRunning) return;
    setIsRunning(false);
    setCurrentPauseStartTime(Date.now());
  }, [isHydrated, isRunning]);

  const stop = useCallback(() => {
    if (!isHydrated || initialStartTime === null) return { duration: 0, totalPauseDuration: 0, pauseIntervals: [], actualStartTime: 0 };
    
    const now = Date.now();
    const totalDurationMs = now - initialStartTime;
    
    let finalPauseIntervals = [...sessionPauseIntervals];
    let finalAccumulatedPause = accumulatedPauseDuration;

    // If it was stopped while it was paused, close the current pause interval and add its duration.
    if (currentPauseStartTime) {
      const lastPauseDuration = now - currentPauseStartTime;
      finalAccumulatedPause += lastPauseDuration;
      finalPauseIntervals.push({ startTime: currentPauseStartTime, endTime: now });
    }

    const result = {
        duration: totalDurationMs,
        totalPauseDuration: finalAccumulatedPause,
        pauseIntervals: finalPauseIntervals,
        actualStartTime: initialStartTime,
    };

    // Reset state
    setIsRunning(false);
    setInitialStartTime(null);
    setElapsedTime(0);
    setCurrentPauseStartTime(null);
    setAccumulatedPauseDuration(0);
    setSessionPauseIntervals([]);
    
    return result;
  }, [isHydrated, initialStartTime, accumulatedPauseDuration, sessionPauseIntervals, currentPauseStartTime]);

  const reset = useCallback(() => {
    if (!isHydrated) return;
    setIsRunning(false);
    setInitialStartTime(null);
    setElapsedTime(0);
    setCurrentPauseStartTime(null);
    setAccumulatedPauseDuration(0);
    setSessionPauseIntervals([]);
  }, [isHydrated]);

  const formatTime = (timeInMs: number): string => {
    if (timeInMs < 0) timeInMs = 0;
    const totalSeconds = Math.floor(timeInMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return { 
    elapsedTime, 
    isRunning, 
    isPaused: !!currentPauseStartTime,
    start, 
    pause, 
    stop, 
    reset, 
    formatTime,
    isHydrated
  };
};
