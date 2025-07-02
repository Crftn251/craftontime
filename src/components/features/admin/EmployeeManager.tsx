
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, UserPlus, Users, Loader2 } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { userService } from '@/services/userService';

const EmployeeManager = () => {
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<UserProfile | null>(null);
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [editedEmployeeName, setEditedEmployeeName] = useState("");
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const users = await userService.getUsers();
      setEmployees(users);
    } catch (error) {
      toast({
        title: "Fehler beim Laden",
        description: "Mitarbeiter konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddEmployee = async () => {
    if (newEmployeeName.trim() === "") return;

    try {
      const newUser = await userService.addUser(newEmployeeName.trim());
      setEmployees([...employees, newUser].sort((a, b) => a.name.localeCompare(b.name)));
      setNewEmployeeName("");
      setIsAdding(false);
      toast({ title: "Mitarbeiter hinzugefügt", description: `${newUser.name} wurde erfolgreich erstellt.` });
    } catch (error) {
      toast({ title: "Fehler", description: "Mitarbeiter konnte nicht hinzugefügt werden.", variant: "destructive" });
    }
  };

  const handleUpdateEmployee = async () => {
    if (!isEditing || editedEmployeeName.trim() === "") return;

    try {
      await userService.updateUser(isEditing.id, editedEmployeeName.trim());
      setEmployees(employees.map(e => e.id === isEditing.id ? { ...e, name: editedEmployeeName.trim() } : e).sort((a, b) => a.name.localeCompare(b.name)));
      toast({ title: "Mitarbeiter aktualisiert", description: `Die Daten von ${editedEmployeeName} wurden gespeichert.` });
      setIsEditing(null);
      setEditedEmployeeName("");
    } catch (error) {
      toast({ title: "Fehler", description: "Mitarbeiter konnte nicht aktualisiert werden.", variant: "destructive" });
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    const employeeToDelete = employees.find(e => e.id === employeeId);
    if (!employeeToDelete) return;

    try {
      await userService.deleteUser(employeeId);
      setEmployees(employees.filter(e => e.id !== employeeId));
      toast({ title: "Mitarbeiter entfernt", description: `${employeeToDelete.name} wurde aus der Liste gelöscht.` });
    } catch (error) {
      toast({ title: "Fehler", description: "Mitarbeiter konnte nicht entfernt werden.", variant: "destructive" });
    }
  };
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6"/>
            Mitarbeiter verwalten (Firestore)
        </CardTitle>
        <CardDescription>
            Änderungen hier werden in der zentralen Datenbank gespeichert.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="flex items-center justify-center h-40">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        ) : (
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
        )}

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
