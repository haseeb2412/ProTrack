import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Teacher } from '@/types';
import { demoTeachers } from '@/data/demoData';
import { Check, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

export default function TeachersView() {
  const [teachers] = useState<Teacher[]>(demoTeachers);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);

  const toggleTeacherSelection = (teacherId: string) => {
    setSelectedTeachers(prev => 
      prev.includes(teacherId) 
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleAssignEvaluation = () => {
    if (selectedTeachers.length === 0) {
      toast.error('Please select at least one teacher');
      return;
    }
    toast.success(`${selectedTeachers.length} teacher(s) assigned for evaluation`);
    setSelectedTeachers([]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">All Teachers</h1>
          <p className="text-muted-foreground">Manage and select teachers for evaluation</p>
        </div>
        
        {selectedTeachers.length > 0 && (
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="h-8 px-3">
              {selectedTeachers.length} selected
            </Badge>
            <Button onClick={handleAssignEvaluation} className="gap-2">
              <Check className="w-4 h-4" />
              Assign for Evaluation
            </Button>
          </div>
        )}
      </div>

      {/* Selected Teachers Panel */}
      {selectedTeachers.length > 0 && (
        <Card className="border-accent/30 bg-accent/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Selected Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedTeachers.map(id => {
                const teacher = teachers.find(t => t.id === id);
                if (!teacher) return null;
                return (
                  <Badge 
                    key={id} 
                    variant="outline" 
                    className="h-8 px-3 gap-2 cursor-pointer hover:bg-destructive/10"
                    onClick={() => toggleTeacherSelection(id)}
                  >
                    {teacher.name}
                    <X className="w-3 h-3" />
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers.map((teacher, index) => {
          const isSelected = selectedTeachers.includes(teacher.id);
          return (
            <Card 
              key={teacher.id} 
              className={`transition-all duration-200 hover:shadow-md cursor-pointer ${
                isSelected ? 'ring-2 ring-accent shadow-glow' : ''
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={teacher.avatar} alt={teacher.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {getInitials(teacher.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{teacher.name}</h3>
                    <p className="text-sm text-muted-foreground">{teacher.designation}</p>
                    <p className="text-xs text-muted-foreground mt-1">{teacher.department}</p>
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {teacher.assignedGroups.length} Groups
                    </Badge>
                  </div>
                </div>

                <Button 
                  variant={isSelected ? "default" : "outline"}
                  className="w-full mt-4 gap-2"
                  onClick={() => toggleTeacherSelection(teacher.id)}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-4 h-4" />
                      Selected
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Select Teacher
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
