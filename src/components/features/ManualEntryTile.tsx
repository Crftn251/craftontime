"use client";

import type { FC } from 'react';
import { CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { ManualTimeEntryForm } from './ManualTimeEntryForm';
import type { Branch, TimeEntry } from '@/lib/types';
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

interface ManualEntryTileProps {
  currentBranch: Branch | undefined;
  onTimeEntryCreate: (entry: Partial<TimeEntry>) => void;
}

export const ManualEntryTile: FC<ManualEntryTileProps> = ({ currentBranch, onTimeEntryCreate }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleOpenChange = (open: boolean) => {
    if (open && !currentBranch) {
        toast({
            title: "Select a Branch",
            description: "Please select a branch before adding a manual time entry.",
            variant: "destructive",
        });
        return; // Prevent dialog from opening
    }
    setIsDialogOpen(open);
  };
  
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarPlus className="w-6 h-6" />
          Manual Time Entry
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Manually add or adjust time entries for specific dates and times.
        </p>
        <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="w-full" variant="outline">
              Add/Adjust Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Manual Time Entry</DialogTitle>
              <DialogDescription>
                Fill in the details for your time entry. Ensure the selected branch is correct.
                Current branch: <span className="font-semibold">{currentBranch || "None selected"}</span>
              </DialogDescription>
            </DialogHeader>
            {currentBranch && (
                 <ManualTimeEntryForm 
                    currentBranch={currentBranch} 
                    onEntrySubmit={onTimeEntryCreate}
                    onDialogClose={() => setIsDialogOpen(false)}
                />
            )}
            {!currentBranch && (
                <div className="p-4 text-center text-destructive-foreground bg-destructive rounded-md">
                    Please select a branch from the header before making a manual entry.
                </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
