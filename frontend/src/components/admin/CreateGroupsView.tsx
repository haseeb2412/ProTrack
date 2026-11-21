import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Group } from '@/types';
import { groupApi, userApi } from '@/lib/api';
import { mapGroup, mapUser } from '@/lib/dataMappers';
import { Plus, Users, X } from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function CreateGroupsView() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([groupApi.list(), userApi.getAllUsers()]).then(([groupResponse, userResponse]) => {
      const loadedGroups = (groupResponse.data ?? []).map(mapGroup);
      const users = userResponse.data ?? [];
      setGroups(loadedGroups);
      setStudents(users.filter((u: any) => u.role === 'STUDENT').map(mapUser));
      setTeachers(users.filter((u: any) => u.role === 'TEACHER').map(mapUser));
    }).catch((error) => toast.error(error.message || 'Could not load group data'));
  }, []);
  const unassignedStudents = useMemo(() => students.filter(s => !s.groupId), [students]);

  const toggleStudent = (studentId: string) => {
    if (selectedStudentIds.includes(studentId)) {
      setSelectedStudentIds(prev => prev.filter(id => id !== studentId));
    } else if (selectedStudentIds.length < 4) {
      setSelectedStudentIds(prev => [...prev, studentId]);
    } else {
      toast.error('Maximum 4 students per group');
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !projectName.trim() || !projectDescription.trim() || !selectedTeacher || selectedStudentIds.length === 0) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      const response = await groupApi.create({ name: newGroupName.trim(), project: { name: projectName.trim(), description: projectDescription.trim() }, teacherId: selectedTeacher, studentIds: selectedStudentIds });
      if (response.data) setGroups(prev => [mapGroup(response.data), ...prev]);
      setStudents(prev => prev.map(s => selectedStudentIds.includes(s.id) ? { ...s, groupId: response.data?.id } : s));
      toast.success(`Group "${newGroupName}" created successfully!`);
      resetForm();
      setIsDialogOpen(false);
    } catch (error: any) { toast.error(error.message || 'Could not create group'); }
  };

  const resetForm = () => {
    setNewGroupName('');
    setProjectName(''); setProjectDescription('');
    setSelectedTeacher('');
    setSelectedStudentIds([]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create Student Groups</h1>
          <p className="text-muted-foreground">Form groups of students for projects</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Group
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
              <DialogDescription>
                Select a project, assign a teacher, and add up to 4 students.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="groupName">Group Name</Label>
                <Input
                  id="groupName"
                  placeholder="e.g., Team Alpha"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Project</Label>
                  <Input placeholder="Project name" value={projectName} onChange={e => setProjectName(e.target.value)} />
                  <Input placeholder="Project description" value={projectDescription} onChange={e => setProjectDescription(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Assigned Teacher</Label>
                <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map(teacher => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name} - {teacher.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Students (max 4)</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedStudentIds.map(id => {
                    const student = students.find(s => s.id === id);
                    return (
                      <Badge 
                        key={id}
                        variant="secondary"
                        className="gap-1 cursor-pointer hover:bg-destructive/20"
                        onClick={() => toggleStudent(id)}
                      >
                        {student?.name}
                        <X className="w-3 h-3" />
                      </Badge>
                    );
                  })}
                </div>
                
                <ScrollArea className="h-40 border rounded-md p-2">
                  <div className="space-y-2">
                    {unassignedStudents.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        All students are assigned to groups
                      </p>
                    ) : (
                      unassignedStudents.map(student => (
                        <div 
                          key={student.id}
                          className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary cursor-pointer"
                          onClick={() => toggleStudent(student.id)}
                        >
                          <Checkbox 
                            checked={selectedStudentIds.includes(student.id)}
                            disabled={!selectedStudentIds.includes(student.id) && selectedStudentIds.length >= 4}
                          />
                          <div>
                            <p className="text-sm font-medium">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.enrollmentId}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleCreateGroup}>
                  Create Group
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group, index) => (
          <Card 
            key={group.id} 
            className="hover:shadow-md transition-shadow animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{group.projectName}</p>
                </div>
                <Badge variant="outline" className="gap-1">
                  <Users className="w-3 h-3" />
                  {group.students.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                Supervisor: {group.teacherName}
              </p>
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">Students:</p>
                <div className="flex flex-wrap gap-1">
                  {group.students.map(student => (
                    <Badge key={student.id} variant="secondary" className="text-xs">
                      {student.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
