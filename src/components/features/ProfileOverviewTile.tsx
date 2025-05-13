"use client";
import type { FC } from 'react';
import { BarChartBig, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TimeSummaryCharts } from './TimeSummaryCharts';
import type { TimeEntry } from '@/lib/types';

interface ProfileOverviewTileProps {
  timeEntries: TimeEntry[];
}

export const ProfileOverviewTile: FC<ProfileOverviewTileProps> = ({ timeEntries }) => {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 col-span-1 md:col-span-2 lg:col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChartBig className="w-6 h-6" />
          Profile Overview
        </CardTitle>
        <CardDescription>Your recent activity and time logged.</CardDescription>
      </CardHeader>
      <CardContent>
        <TimeSummaryCharts timeEntries={timeEntries} />
      </CardContent>
    </Card>
  );
};
