
"use client";

import { FC, useEffect, useState } from 'react';
import { Play, Pause, Square, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useStopwatch } from '@/lib/hooks/useStopwatch';
import type { Branch, TimeEntry } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { timeEntryService } from '@/services/timeEntryService';

interface TimeTrackerProps {
  onTimeEntryCreate: (entry: TimeEntry) => void;
  onTimeEntryUpdate: (entry: TimeEntry) => void;
  currentUserId: string;
  currentBranch: Branch;
}

export const TimeTracker: FC<TimeTrackerProps> = ({ onTimeEntryCreate, onTimeEntryUpdate, currentUserId, currentBranch }) => {
  const [ongoingEntry, setOngoingEntry] = useState<TimeEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { elapsedTime, isRunning, start, pause, stop, reset, formatTime, loadInitialTime } = useStopwatch();
  const { toast } = useToast();

  useEffect(() => {
    const checkForOngoingEntry = async () => {
      setIsLoading(true);
      try {
        const entry = await timeEntryService.getOngoingTimeEntry(currentUserId);
        if (entry) {
          setOngoingEntry(entry);
          // Load the stopwatch with the state of the ongoing entry from the database
          loadInitialTime(entry.startTime, entry.pauseIntervals || []);
        }
      } catch (error) {
        toast({ title: "Fehler", description: "Laufender Zeiteintrag konnte nicht geprüft werden.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    checkForOngoingEntry();
  }, [currentUserId, toast, loadInitialTime]);


  const handleStart = async () => {
    if (!currentBranch) {
      toast({ title: "Fehler", description: "Bitte eine Filiale auswählen.", variant: "destructive" });
      return;
    }

    if (ongoingEntry) { // Resuming an existing entry
      const { pauseIntervals, totalPauseDuration } = start();
      const updatedEntry: Partial<TimeEntry> = {
          pauseIntervals: pauseIntervals,
          totalPauseDuration: Math.floor(totalPauseDuration / 1000),
      };
      await timeEntryService.updateTimeEntry(ongoingEntry.id, updatedEntry);
      onTimeEntryUpdate({ ...ongoingEntry, ...updatedEntry });
      toast({ title: "Timer fortgesetzt" });
    } else { // Starting a new entry
      const { actualStartTime } = start();
      const newEntryData: Omit<TimeEntry, 'id'> = {
        userId: currentUserId,
        branch: currentBranch,
        startTime: actualStartTime,
        endTime: undefined,
        duration: 0,
        pauseIntervals: [],
        totalPauseDuration: 0,
        manual: false,
      };
      const newEntry = await timeEntryService.addTimeEntry(newEntryData);
      setOngoingEntry(newEntry);
      onTimeEntryCreate(newEntry);
      toast({ title: "Timer gestartet", description: `Zeiterfassung für ${currentBranch} begonnen.` });
    }
  };

  const handlePause = async () => {
    if (!ongoingEntry) return;
    const { pauseIntervals, totalPauseDuration } = pause();
    const updatedEntry = { pauseIntervals, totalPauseDuration: Math.floor(totalPauseDuration/1000) };
    await timeEntryService.updateTimeEntry(ongoingEntry.id, updatedEntry);
    onTimeEntryUpdate({ ...ongoingEntry, ...updatedEntry });
    toast({ title: "Timer pausiert" });
  };

  const handleStop = async () => {
    if (!ongoingEntry) return;
    
    const { duration, totalPauseDuration, pauseIntervals } = stop();
    
    if (duration > 1000) { // Only log entries longer than a second
      const finalEntry: Partial<TimeEntry> = {
          endTime: Date.now(),
          duration: Math.floor(duration / 1000),
          totalPauseDuration: Math.floor(totalPauseDuration / 1000),
          pauseIntervals: pauseIntervals,
      };
      await timeEntryService.updateTimeEntry(ongoingEntry.id, finalEntry);
      onTimeEntryUpdate({ ...ongoingEntry, ...finalEntry, id: ongoingEntry.id });
      setOngoingEntry(null);
      reset();
      toast({ title: "Timer gestoppt", description: `Eintrag über ${formatTime(duration)} erfasst.` });
    } else {
        await timeEntryService.deleteTimeEntry(ongoingEntry.id);
        setOngoingEntry(null);
        reset();
        toast({ title: "Timer gestoppt", description: "Keine nennenswerte Zeit erfasst, Eintrag gelöscht." });
    }
  };
  
  const handleReset = async () => {
      if(ongoingEntry) {
          await timeEntryService.deleteTimeEntry(ongoingEntry.id);
          setOngoingEntry(null);
      }
      reset();
      toast({ title: "Timer zurückgesetzt" });
  };

  if(isLoading) {
    return (
        <Card className="shadow-lg">
            <CardHeader><CardTitle>Zeitmesser</CardTitle></CardHeader>
            <CardContent className="flex items-center justify-center h-48">
                <Loader2 className="w-10 h-10 animate-spin text-primary"/>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isRunning ? <Pause className="w-6 h-6 text-primary" /> : <Play className="w-6 h-6 text-primary" />}
          Zeitmesser
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className="text-6xl font-mono font-bold tabular-nums text-primary my-6 py-4 bg-secondary/30 rounded-lg shadow-inner">
          {formatTime(elapsedTime)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {!isRunning ? (
             <Button onClick={handleStart} size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white col-span-2">
              <Play className="mr-2 h-5 w-5" /> {elapsedTime > 0 ? 'Fortsetzen' : 'Starten'}
            </Button>
          ) : ( // isRunning
            <>
              <Button onClick={handlePause} variant="outline" size="lg" className="w-full">
                <Pause className="mr-2 h-5 w-5" /> Pause
              </Button>
              <Button onClick={handleStop} variant="destructive" size="lg" className="w-full">
                <Square className="mr-2 h-5 w-5" /> Stopp
              </Button>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleReset} variant="ghost" size="sm" className="w-full text-muted-foreground" disabled={!isRunning && elapsedTime === 0}>
            <RotateCcw className="mr-2 h-4 w-4" /> Zurücksetzen
        </Button>
      </CardFooter>
    </Card>
  );
};
