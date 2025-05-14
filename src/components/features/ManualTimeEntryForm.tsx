
"use client";

import type { FC } from 'react';
import { useState } from 'react'; // Added for popover state
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, ClockIcon } from 'lucide-react';
import { format } from 'date-fns';
import type { TimeEntry, Branch } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

const manualTimeEntrySchema = z.object({
  date: z.date({ required_error: "Ein Datum ist erforderlich." }),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Ungültiges Zeitformat (HH:MM)."),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Ungültiges Zeitformat (HH:MM)."),
  totalPauseMinutes: z.coerce.number().int().min(0, "Pausendauer darf nicht negativ sein.").optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
}).refine(data => {
  const [startH, startM] = data.startTime.split(':').map(Number);
  const [endH, endM] = data.endTime.split(':').map(Number);
  return (endH > startH) || (endH === startH && endM > startM);
}, {
  message: "Die Endzeit muss nach der Startzeit liegen.",
  path: ["endTime"],
}).refine(data => {
    const [startH, startM] = data.startTime.split(':').map(Number);
    const [endH, endM] = data.endTime.split(':').map(Number);
    const totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    return data.totalPauseMinutes === undefined || data.totalPauseMinutes <= totalMinutes;
}, {
    message: "Die gesamte Pausendauer darf die Gesamtarbeitszeit nicht überschreiten.",
    path: ["totalPauseMinutes"],
});

type ManualTimeEntryFormValues = z.infer<typeof manualTimeEntrySchema>;

interface ManualTimeEntryFormProps {
  currentBranch: Branch | undefined;
  onEntrySubmit: (entry: Partial<TimeEntry>) => void;
  onDialogClose: () => void;
}

export const ManualTimeEntryForm: FC<ManualTimeEntryFormProps> = ({ currentBranch, onEntrySubmit, onDialogClose }) => {
  const { toast } = useToast();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false); // State for calendar popover

  const form = useForm<ManualTimeEntryFormValues>({
    resolver: zodResolver(manualTimeEntrySchema),
    defaultValues: {
      date: new Date(),
      startTime: "09:00",
      endTime: "17:00",
      totalPauseMinutes: 0,
      reason: "",
      notes: "",
    },
  });

  const onSubmit = (values: ManualTimeEntryFormValues) => {
    if (!currentBranch) {
      toast({ title: "Fehler", description: "Keine Filiale für die manuelle Eingabe ausgewählt.", variant: "destructive" });
      return;
    }

    const [startHours, startMinutes] = values.startTime.split(':').map(Number);
    const [endHours, endMinutes] = values.endTime.split(':').map(Number);

    const startDate = new Date(values.date);
    startDate.setHours(startHours, startMinutes, 0, 0);

    const endDate = new Date(values.date);
    endDate.setHours(endHours, endMinutes, 0, 0);

    const durationInSeconds = (endDate.getTime() - startDate.getTime()) / 1000;
    const totalPauseDurationInSeconds = (values.totalPauseMinutes || 0) * 60;

    onEntrySubmit({
      startTime: startDate.getTime(),
      endTime: endDate.getTime(),
      duration: durationInSeconds,
      totalPauseDuration: totalPauseDurationInSeconds,
      pauseIntervals: [], 
      branch: currentBranch,
      notes: values.notes,
      reason: values.reason,
      manual: true,
    });
    toast({ title: "Manueller Eintrag hinzugefügt", description: `Zeit erfasst für ${format(startDate, "PPP")} von ${values.startTime} bis ${values.endTime}.` });
    form.reset();
    onDialogClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Datum</FormLabel>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Datum auswählen</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[60]" align="start"> {/* Increased z-index */}
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      field.onChange(date);
                      setIsCalendarOpen(false); // Close popover on select
                    }}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Startzeit</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endzeit</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
            control={form.control}
            name="totalPauseMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  <ClockIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  Gesamte Pausendauer (Minuten)
                </FormLabel>
                <FormControl>
                  <Input type="number" placeholder="z.B. 30" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grund für manuelle Eingabe/Anpassung (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="z.B. Einstempeln vergessen" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notizen (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Zusätzliche Details zur geleisteten Arbeit" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onDialogClose}>Abbrechen</Button>
            <Button type="submit">Eintrag hinzufügen</Button>
        </div>
      </form>
    </Form>
  );
};
