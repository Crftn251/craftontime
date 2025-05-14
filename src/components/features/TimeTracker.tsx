
"use client";

import type { FC } from 'react';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useStopwatch } from '@/lib/hooks/useStopwatch';
import type { Branch, TimeEntry, PauseInterval } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

interface TimeTrackerProps {
  currentBranch: Branch | undefined;
  onTimeEntryCreate: (entry: Partial<TimeEntry>) => void;
  currentUserId: string;
}

export const TimeTracker: FC<TimeTrackerProps> = ({ currentBranch, onTimeEntryCreate, currentUserId }) => {
  const persistanceKey = `employeeTimeTracker_${currentUserId}`;
  const { elapsedTime, isRunning, start, pause, stop, reset, formatTime } = useStopwatch(persistanceKey);
  const { toast } = useToast();

  const handleStart = () => {
    if (!currentBranch) {
      toast({ title: "Error", description: "Please select a branch first.", variant: "destructive" });
      return;
    }
    start();
    toast({ title: "Timer Started", description: `Tracking time for branch ${currentBranch}.` });
  };

  const handlePause = () => {
    pause();
    toast({ title: "Timer Paused" });
  };

  const handleStop = () => {
    const { duration: durationInMs, pauseIntervals } = stop(); 
    
    if (currentBranch && durationInMs > 0) {
      const totalPauseDurationInSeconds = pauseIntervals.reduce((acc, interval) => {
        return acc + (interval.endTime - interval.startTime);
      }, 0) / 1000;

      onTimeEntryCreate({
        startTime: Date.now() - durationInMs, 
        endTime: Date.now(),
        duration: Math.floor(durationInMs / 1000), // Total duration including pauses
        totalPauseDuration: Math.floor(totalPauseDurationInSeconds),
        pauseIntervals: pauseIntervals,
        branch: currentBranch,
        notes: "Automated time entry",
      });
      toast({ title: "Timer Stopped", description: `Entry for ${formatTime(durationInMs)} logged for ${currentBranch}.` });
    } else if (durationInMs === 0) {
        toast({ title: "Timer Stopped", description: "No time was recorded.", variant: "default" });
    }
  };
  
  const handleReset = () => {
    reset();
    toast({ title: "Timer Reset", description: "Current tracking has been reset." });
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="w-6 h-6" />
          Time Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className="text-6xl font-mono font-bold tabular-nums text-primary my-6 py-4 bg-secondary/30 rounded-lg shadow-inner">
          {formatTime(elapsedTime)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {!isRunning ? (
            <Button onClick={handleStart} size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white col-span-2">
              <Play className="mr-2 h-5 w-5" /> Start
            </Button>
          ) : (
            <>
              <Button onClick={handlePause} variant="outline" size="lg" className="w-full">
                <Pause className="mr-2 h-5 w-5" /> Pause
              </Button>
              <Button onClick={handleStop} variant="destructive" size="lg" className="w-full">
                <Square className="mr-2 h-5 w-5" /> Stop
              </Button>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleReset} variant="ghost" size="sm" className="w-full text-muted-foreground">
            <RotateCcw className="mr-2 h-4 w-4" /> Reset Timer
        </Button>
      </CardFooter>
    </Card>
  );
};
