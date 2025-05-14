
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
            title: "Filiale auswählen",
            description: "Bitte wählen Sie eine Filiale aus, bevor Sie einen manuellen Zeiteintrag hinzufügen.",
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
          Manuelle Zeiteingabe
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Manuelles Hinzufügen oder Anpassen von Zeiteinträgen für bestimmte Daten und Zeiten.
        </p>
        <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="w-full" variant="outline">
              Eintrag hinzufügen/anpassen
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Manuelle Zeiteingabe</DialogTitle>
              <DialogDescription>
                Füllen Sie die Details für Ihren Zeiteintrag aus. Stellen Sie sicher, dass die ausgewählte Filiale korrekt ist.
                Aktuelle Filiale: <span className="font-semibold">{currentBranch || "Keine ausgewählt"}</span>
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
                    Bitte wählen Sie eine Filiale im Header aus, bevor Sie einen manuellen Eintrag vornehmen.
                </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
