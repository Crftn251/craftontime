"use client";

import type { FC } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { TimeEntry } from '@/lib/types';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, eachDayOfInterval, differenceInHours } from 'date-fns';

interface TimeSummaryChartsProps {
  timeEntries: TimeEntry[];
}

const CHART_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"];

const aggregateTime = (entries: TimeEntry[], startDate: Date, endDate: Date): number => {
  return entries.reduce((total, entry) => {
    if (entry.endTime && entry.startTime && isWithinInterval(new Date(entry.startTime), { start: startDate, end: endDate })) {
      return total + (entry.duration || 0); // duration in seconds
    }
    return total;
  }, 0) / 3600; // convert to hours
};

export const TimeSummaryCharts: FC<TimeSummaryChartsProps> = ({ timeEntries }) => {
  const now = new Date();

  const hoursToday = aggregateTime(timeEntries, new Date(now.setHours(0,0,0,0)), new Date(now.setHours(23,59,59,999)));
  const hoursThisWeek = aggregateTime(timeEntries, startOfWeek(now, { weekStartsOn: 1 }), endOfWeek(now, { weekStartsOn: 1 }));
  const hoursThisMonth = aggregateTime(timeEntries, startOfMonth(now), endOfMonth(now));

  const summaryData = [
    { name: 'Today', hours: parseFloat(hoursToday.toFixed(2)) },
    { name: 'This Week', hours: parseFloat(hoursThisWeek.toFixed(2)) },
    { name: 'This Month', hours: parseFloat(hoursThisMonth.toFixed(2)) },
  ];

  const weeklyBreakdownData = eachDayOfInterval({
    start: startOfWeek(now, { weekStartsOn: 1 }),
    end: endOfWeek(now, { weekStartsOn: 1 }),
  }).map(day => {
    const dayStart = new Date(day.setHours(0,0,0,0));
    const dayEnd = new Date(day.setHours(23,59,59,999));
    return {
      name: format(day, 'EEE'), // Mon, Tue
      hours: parseFloat(aggregateTime(timeEntries, dayStart, dayEnd).toFixed(2)),
    };
  });


  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
          <CardDescription>Total hours logged.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={summaryData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--foreground))" fontSize={12} unit="h" />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Bar dataKey="hours" radius={[4, 4, 0, 0]} maxBarSize={60}>
                {summaryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle>This Week's Breakdown</CardTitle>
          <CardDescription>Daily hours for the current week.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyBreakdownData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--foreground))" fontSize={12} unit="h" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Bar dataKey="hours" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
