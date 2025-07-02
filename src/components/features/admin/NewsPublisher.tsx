
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Rss, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const NewsPublisher = () => {
  const [newsContent, setNewsContent] = useState("");
  const { toast } = useToast();

  const handlePublish = () => {
    if (newsContent.trim() === "") return;

    // In a real app, this would send the news to a backend service.
    // For now, we'll simulate it and show a toast.
    console.log("Publishing news:", newsContent);
    
    // Example of what you might store in a shared location (like Firestore or localStorage for demo)
    const newsItem = {
      id: `news_${Date.now()}`,
      content: newsContent.trim(),
      date: new Date().toISOString(),
      author: 'Admin'
    };
    
    // For demonstration, we could save this to localStorage to be read by the reminders tab.
    // This is a simplified approach. A real-world scenario would use a database.
    const existingNews = JSON.parse(localStorage.getItem('global_news') || '[]');
    localStorage.setItem('global_news', JSON.stringify([newsItem, ...existingNews]));


    toast({
      title: "Nachricht veröffentlicht!",
      description: "Die neue Nachricht ist jetzt für alle Mitarbeiter sichtbar.",
    });

    setNewsContent("");
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Rss className="w-6 h-6"/>
            Nachricht veröffentlichen
        </CardTitle>
        <CardDescription>
            Senden Sie eine Nachricht, die im "Erinnerungen"-Tab aller Mitarbeiter angezeigt wird.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Textarea
            placeholder="Schreiben Sie hier Ihre Nachricht..."
            value={newsContent}
            onChange={(e) => setNewsContent(e.target.value)}
            rows={5}
          />
          <Button onClick={handlePublish} className="w-full" disabled={!newsContent.trim()}>
            <Send className="mr-2 h-4 w-4" />
            Nachricht senden
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsPublisher;
