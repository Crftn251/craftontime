
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, UserPlus, Users } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

// A custom hook to manage data in localStorage and sync it with React state
const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

const EmployeeManager = () => {
  const [employees, setEmployees] = useLocalStorage<UserProfile[]>('MOCK_USERS', []);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<UserProfile | null>(null);
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [editedEmployeeName, setEditedEmployeeName] = useState("");
  const { toast } = useToast();

  const handleAddEmployee = () => {
    if (newEmployeeName.trim() === "") return;

    const newEmployee: UserProfile = {
      id: `user_${Date.now()}`, // More robust unique ID
      name: newEmployeeName.trim(),
    };
    setEmployees([...employees, newEmployee]);
    setNewEmployeeName("");
    setIsAdding(false);
    toast({ title: "Mitarbeiter hinzugefügt", description: `${newEmployee.name} wurde erfolgreich erstellt.` });
  };

  const handleUpdateEmployee = () => {
    if (!isEditing || editedEmployeeName.trim() === "") return;

    setEmployees(employees.map(e => e.id === isEditing.id ? { ...e, name: editedEmployeeName.trim() } : e));
    toast({ title: "Mitarbeiter aktualisiert", description: `Die Daten von ${editedEmployeeName} wurden gespeichert.` });
    setIsEditing(null);
    setEditedEmployeeName("");
  };

  const handleDeleteEmployee = (employeeId: string) => {
    const employeeToDelete = employees.find(e => e.id === employeeId);
    if (employeeToDelete) {
        setEmployees(employees.filter(e => e.id !== employeeId));
        toast({ title: "Mitarbeiter entfernt", description: `${employeeToDelete.name} wurde aus der Liste gelöscht.` });
    }
  };
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6"/>
            Mitarbeiter verwalten
        </CardTitle>
        <CardDescription>
            Änderungen hier werden sofort auf der Login-Seite wirksam.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {employees.map(employee => (
            <div key={employee.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
              {isEditing?.id === employee.id ? (
                <Input
                  type="text"
                  value={editedEmployeeName}
                  onChange={(e) => setEditedEmployeeName(e.target.value)}
                  className="flex-grow mr-2"
                />
              ) : (
                <p className="font-medium">{employee.name}</p>
              )}
              <div className="flex items-center gap-2">
                {isEditing?.id === employee.id ? (
                  <Button size="sm" onClick={handleUpdateEmployee}>Speichern</Button>
                ) : (
                  <Button size="icon" variant="ghost" onClick={() => {
                    setIsEditing(employee);
                    setEditedEmployeeName(employee.name);
                  }}>
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
                <Button size="icon" variant="ghost" onClick={() => handleDeleteEmployee(employee.id)} className="text-destructive hover:text-destructive/80">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {isAdding ? (
          <div className="mt-4 flex items-center gap-2">
            <Input
              type="text"
              placeholder="Name des Mitarbeiters"
              value={newEmployeeName}
              onChange={(e) => setNewEmployeeName(e.target.value)}
              className="flex-grow"
            />
            <Button onClick={handleAddEmployee}>
                <UserPlus className="mr-2 h-4 w-4"/> Hinzufügen
            </Button>
            <Button variant="ghost" onClick={() => setIsAdding(false)}>Abbrechen</Button>
          </div>
        ) : (
          <Button onClick={() => setIsAdding(true)} className="mt-4 w-full">
            <PlusCircle className="mr-2 h-4 w-4" />
            Neuen Mitarbeiter hinzufügen
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmployeeManager;
