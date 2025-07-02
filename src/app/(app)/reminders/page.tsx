
'use client';

import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bell, Rss } from 'lucide-react';

interface NewsItem {
  id: string;
  content: string;
  date: string;
  author: string;
}

const RemindersPage: NextPage = () => {
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    // This effect runs only on the client, where localStorage is available.
    const storedNews = localStorage.getItem('global_news');
    if (storedNews) {
      setNews(JSON.parse(storedNews));
    }
  }, []);

  return (
    <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Erinnerungen & Nachrichten</h1>
        
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Rss className="w-6 h-6" />
                    Aktuelle Nachrichten vom Admin
                </CardTitle>
                <CardDescription>
                    Hier finden Sie die neuesten Informationen und Ankündigungen.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {news.length > 0 ? (
                    <div className="space-y-4">
                        {news.map((item) => (
                            <div key={item.id} className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                                <p className="mb-2">{item.content}</p>
                                <p className="text-xs text-muted-foreground">
                                    Veröffentlicht von {item.author} am {new Date(item.date).toLocaleString('de-DE')}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Aktuell gibt es keine neuen Nachrichten.
                    </p>
                )}
            </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="w-6 h-6" />
                    Allgemeine Hinweise
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
