"use client";

import type { FC } from 'react';
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
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import type { TimeEntry, Branch } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

const manualTimeEntrySchema = z.object({
  date: z.date({ required_error: "A date is required." }),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)."),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)."),
  reason: z.string().optional(),
  notes: z.string().optional(),
}).refine(data => {
  const [startH, startM] = data.startTime.split(':').map(Number);
  const [endH, endM] = data.endTime.split(':').map(Number);
  return (endH > startH) || (endH === startH && endM > startM);
}, {
  message: "End time must be after start time.",
  path: ["endTime"],
});

type ManualTimeEntryFormValues = z.infer<typeof manualTimeEntrySchema>;

interface ManualTimeEntryFormProps {
  currentBranch: Branch | undefined;
  onEntrySubmit: (entry: Partial<TimeEntry>) => void;
  onDialogClose: () => void;
}

export const ManualTimeEntryForm: FC<ManualTimeEntryFormProps> = ({ currentBranch, onEntrySubmit, onDialogClose }) => {
  const { toast } = useToast();
  const form = useForm<ManualTimeEntryFormValues>({
    resolver: zodResolver(manualTimeEntrySchema),
    defaultValues: {
      date: new Date(),
      startTime: "09:00",
      endTime: "17:00",
      reason: "",
      notes: "",
    },
  });

  const onSubmit = (values: ManualTimeEntryFormValues) => {
    if (!currentBranch) {
      toast({ title: "Error", description: "No branch selected for manual entry.", variant: "destructive" });
      return;
    }

    const [startHours, startMinutes] = values.startTime.split(':').map(Number);
    const [endHours, endMinutes] = values.endTime.split(':').map(Number);

    const startDate = new Date(values.date);
    startDate.setHours(startHours, startMinutes, 0, 0);

    const endDate = new Date(values.date);
    endDate.setHours(endHours, endMinutes, 0, 0);

    const durationInSeconds = (endDate.getTime() - startDate.getTime()) / 1000;

    onEntrySubmit({
      startTime: startDate.getTime(),
      endTime: endDate.getTime(),
      duration: durationInSeconds,
      branch: currentBranch,
      notes: values.notes,
      reason: values.reason,
      manual: true,
    });
    toast({ title: "Manual Entry Added", description: `Time logged for ${format(startDate, "PPP")} from ${values.startTime} to ${values.endTime}.` });
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
              <FormLabel>Date</FormLabel>
              <Popover>
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
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
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
                <FormLabel>Start Time</FormLabel>
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
                <FormLabel>End Time</FormLabel>
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
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for manual entry/adjustment (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Forgot to clock in" {...field} />
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
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional details about the work done" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onDialogClose}>Cancel</Button>
            <Button type="submit">Add Entry</Button>
        </div>
      </form>
    </Form>
  );
};
