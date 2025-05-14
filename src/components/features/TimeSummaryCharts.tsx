
"use client";

import type { FC } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { TimeEntry, Branch } from '@/lib/types';
import { BRANCHES } from '@/lib/types'; // BRANCHES importieren
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, eachDayOfInterval } from 'date-fns';
import { de } from 'date-fns/locale'; // Deutsche Locale für Tagesnamen

interface TimeSummaryChartsProps {
  timeEntries: TimeEntry[];
}

const CHART_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const aggregateProductiveTime = (entries: TimeEntry[], startDate: Date, endDate: Date): number => {
  return entries.reduce((total, entry) => {
    if (entry.endTime && entry.startTime && isWithinInterval(new Date(entry.startTime), { start: startDate, end: endDate })) {
      const totalDuration = entry.duration || 0; // in seconds
      const totalPause = entry.totalPauseDuration || 0; // in seconds
      const productiveDuration = totalDuration - totalPause;
      return total + (productiveDuration > 0 ? productiveDuration : 0);
    }
    return total;
  }, 0) / 3600; // convert to hours
};

const aggregateProductiveTimeByBranchForMonth = (entries: TimeEntry[], targetMonthDate: Date): Array<{ name: string, hours: number }> => {
  const monthStart = startOfMonth(targetMonthDate);
  const monthEnd = endOfMonth(targetMonthDate);
  const branchTotals: { [key: string]: number } = {};

  entries.forEach(entry => {
    if (entry.endTime && entry.startTime && isWithinInterval(new Date(entry.startTime), { start: monthStart, end: monthEnd })) {
      const totalDuration = entry.duration || 0; 
      const totalPause = entry.totalPauseDuration || 0; 
      const productiveDuration = totalDuration - totalPause;
      const productiveHours = (productiveDuration > 0 ? productiveDuration : 0) / 3600;

      if (productiveHours > 0) {
        branchTotals[entry.branch] = (branchTotals[entry.branch] || 0) + productiveHours;
      }
    }
  });

  return BRANCHES.map(branch => ({
    name: branch,
    hours: parseFloat((branchTotals[branch] || 0).toFixed(2)),
  })).filter(b => b.hours > 0); // Nur Filialen mit Stunden anzeigen
};


export const TimeSummaryCharts: FC<TimeSummaryChartsProps> = ({ timeEntries }) => {
  const now = new Date();

  const productiveHoursToday = aggregateProductiveTime(timeEntries, new Date(new Date(now).setHours(0,0,0,0)), new Date(new Date(now).setHours(23,59,59,999)));
  const productiveHoursThisWeek = aggregateProductiveTime(timeEntries, startOfWeek(now, { weekStartsOn: 1 }), endOfWeek(now, { weekStartsOn: 1 }));
  const productiveHoursThisMonth = aggregateProductiveTime(timeEntries, startOfMonth(now), endOfMonth(now));

  const summaryData = [
    { name: 'Heute', hours: parseFloat(productiveHoursToday.toFixed(2)) },
    { name: 'Diese Woche', hours: parseFloat(productiveHoursThisWeek.toFixed(2)) },
    { name: 'Dieser Monat', hours: parseFloat(productiveHoursThisMonth.toFixed(2)) },
  ];

  const weeklyBreakdownData = eachDayOfInterval({
    start: startOfWeek(now, { weekStartsOn: 1 }),
    end: endOfWeek(now, { weekStartsOn: 1 }),
  }).map(day => {
    const dayStart = new Date(new Date(day).setHours(0,0,0,0));
    const dayEnd = new Date(new Date(day).setHours(23,59,59,999));
    return {
      name: format(day, 'EEE', { locale: de }), 
      hours: parseFloat(aggregateProductiveTime(timeEntries, dayStart, dayEnd).toFixed(2)),
    };
  });
  
  const branchHoursThisMonth = aggregateProductiveTimeByBranchForMonth(timeEntries, now);


  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Zusammenfassung Produktivzeit</CardTitle>
          <CardDescription>Gesamte produktive Stunden (ohne Pausen).</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={summaryData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--foreground))" fontSize={12} unit="h" allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [`${value.toFixed(2)}h`, "Produktive Stunden"]}
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
          <CardTitle>Produktivzeit diese Woche</CardTitle>
          <CardDescription>Tägliche produktive Stunden (ohne Pausen).</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyBreakdownData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--foreground))" fontSize={12} unit="h" allowDecimals={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [`${value.toFixed(2)}h`, "Produktive Stunden"]}
              />
              <Bar dataKey="hours" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {branchHoursThisMonth.length > 0 && (
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 lg:col-span-2 xl:col-span-1">
          <CardHeader>
            <CardTitle>Stunden pro Filiale (Dieser Monat)</CardTitle>
            <CardDescription>Verteilung der produktiven Stunden auf Filialen im aktuellen Monat.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={branchHoursThisMonth} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--foreground))" fontSize={12} unit="h" allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number) => [`${value.toFixed(2)}h`, "Produktive Stunden"]}
                />
                <Bar dataKey="hours" radius={[4, 4, 0, 0]} maxBarSize={50}>
                  {branchHoursThisMonth.map((entry, index) => (
                    <Cell key={`cell-branch-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

