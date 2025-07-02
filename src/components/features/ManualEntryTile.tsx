
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
  onTimeEntryCreate: (entry: TimeEntry) => void;
}

export const ManualEntryTile: FC<ManualEntryTileProps> = ({ currentBranch, onTimeEntryCreate }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleFormSubmit = (entry: TimeEntry) => {
    onTimeEntryCreate(entry);
    setIsDialogOpen(false); // Close dialog on successful submission
  }

  const handleOpenChange = (open: boolean) => {
    if (open && !currentBranch) {
        toast({
            title: "Filiale auswählen",
            description: "Bitte wählen Sie eine Filiale aus, bevor Sie einen manuellen Zeiteintrag hinzufügen.",
            variant: "destructive",
        });
        return;
    }
    setIsDialogOpen(open);
  };
  
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarPlus className="w-6 h-6" />
          Manuelle Zeiteingabe
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Manuelles Hinzufügen von Zeiteinträgen für bestimmte Daten und Zeiten.
        </p>
        <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="w-full" variant="outline">
              Manuellen Eintrag hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Manuelle Zeiteingabe</DialogTitle>
              <DialogDescription>
                Aktuelle Filiale: <span className="font-semibold">{currentBranch || "Keine ausgewählt"}</span>
              </DialogDescription>
            </DialogHeader>
            {currentBranch && (
                 <ManualTimeEntryForm 
                    currentBranch={currentBranch} 
                    onEntrySubmit={handleFormSubmit}
                />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
