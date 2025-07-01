
'use client';

import type { NextPage } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';

const RemindersPage: NextPage = () => {
  return (
    <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Erinnerungen</h1>
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Bell className="w-6 h-6" />
                Schwarzes Brett & Wichtige Hinweise
            </CardTitle>
            </CardHeader>
            <CardContent>
            <p className="text-sm text-muted-foreground">
                Bitte denkt daran, eure Pausenzeiten korrekt zu erfassen und nach Arbeitsende auszustempeln.
            </p>
            </CardContent>
        </Card>
    </div>
  );
};

export default RemindersPage;
