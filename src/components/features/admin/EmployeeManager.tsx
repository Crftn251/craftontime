
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, UserPlus, Users } from 'lucide-react';
import type { UserProfile } from '@/lib/types';

// Mock data - replace with your actual data fetching logic
const initialEmployees: UserProfile[] = [
  { id: 'user1', name: 'Maria' },
  { id: 'user2', name: 'Elke' },
  { id: 'user3', name: 'Marek' },
];

const EmployeeManager = () => {
  const [employees, setEmployees] = useState<UserProfile[]>(initialEmployees);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<UserProfile | null>(null);
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [editedEmployeeName, setEditedEmployeeName] = useState("");

  const handleAddEmployee = () => {
    if (newEmployeeName.trim() === "") return;

    const newEmployee: UserProfile = {
      id: `user${employees.length + 1}`, // Temporary ID generation
      name: newEmployeeName.trim(),
    };
    setEmployees([...employees, newEmployee]);
    setNewEmployeeName("");
    setIsAdding(false);
  };

  const handleUpdateEmployee = () => {
    if (!isEditing || editedEmployeeName.trim() === "") return;

    setEmployees(employees.map(e => e.id === isEditing.id ? { ...e, name: editedEmployeeName.trim() } : e));
    setIsEditing(null);
    setEditedEmployeeName("");
  };

  const handleDeleteEmployee = (employeeId: string) => {
    setEmployees(employees.filter(e => e.id !== employeeId));
  };
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6"/>
            Mitarbeiter verwalten
        </CardTitle>
        <CardDescription>
            Fügen Sie neue Mitarbeiter hinzu, bearbeiten oder entfernen Sie bestehende.
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

