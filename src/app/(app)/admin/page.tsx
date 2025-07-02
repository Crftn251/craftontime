"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, LogOut } from 'lucide-react';

const ADMIN_CODE = "135Crftn!";
const LOCAL_STORAGE_KEY = 'admin_authenticated';

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [error, setError] = useState("");

  // Check for persisted authentication status on component mount
  useEffect(() => {
    const storedAuth = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    if (inputCode === ADMIN_CODE) {
      localStorage.setItem(LOCAL_STORAGE_KEY, 'true');
      setIsAuthenticated(true);
      setError("");
      setInputCode(""); // Clear the input field
    } else {
      setError("Falscher Code. Bitte erneut versuchen.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Admin-Zugang
            </CardTitle>
            <CardDescription>
              Bitte geben Sie den Admin-Code ein, um fortzufahren.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Admin-Code"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full"
              />
               {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <Button onClick={handleLogin} className="w-full">
              Anmelden
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If authenticated, show the admin content
  return (
    <div className="space-y-8">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin-Bereich</h1>
                <p className="text-muted-foreground">Willkommen im geschützten Admin-Bereich.</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Abmelden
            </Button>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Systemsteuerung</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Hier könnten Admin-spezifische Inhalte und Steuerelemente angezeigt werden.</p>
                {/* Future admin components will go here */}
            </CardContent>
        </Card>
    </div>
  );
};

export default AdminPage;
