import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Group, Task, Student } from '@/types';
import { demoGroups, demoTasks, demoStudents } from '@/data/demoData';
import { useAuth } from '@/contexts/AuthContext';
import { Users, ChevronRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function TeacherGroupsView() {
  const { user } = useAuth();
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  
  // Filter groups assigned to this teacher (demo: show first teacher's groups)
  const teacherGroups = demoGroups.filter(g => g.teacherId === 't-001');
  const tasks = demoTasks;

  const getGroupTasks = (groupId: string) => {
    return tasks.filter(t => t.groupId === groupId);
  };

  const getGroupProgress = (groupId: string) => {
    const groupTasks = getGroupTasks(groupId);
    if (groupTasks.length === 0) return 0;
    const approved = groupTasks.filter(t => t.status === 'approved').length;
    return Math.round((approved / groupTasks.length) * 100);
  };

  const getStudentStats = (studentId: string, groupId: string) => {
    const studentTasks = tasks.filter(t => t.studentId === studentId && t.groupId === groupId);
    return {
      total: studentTasks.length,
      approved: studentTasks.filter(t => t.status === 'approved').length,
      pending: studentTasks.filter(t => t.status === 'pending').length,
      revision: studentTasks.filter(t => t.status === 'needs_revision').length,
    };
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Groups</h1>
        <p className="text-muted-foreground">View and manage your assigned student groups</p>
      </div>

      {teacherGroups.length === 0 ? (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No groups assigned yet</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teacherGroups.map((group, index) => {
            const progress = getGroupProgress(group.id);
            const groupTasks = getGroupTasks(group.id);
            
            return (
              <Card 
                key={group.id}
                className="hover:shadow-md transition-all cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => setSelectedGroup(group)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{group.projectName}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span>{groupTasks.filter(t => t.status === 'approved').length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{groupTasks.filter(t => t.status === 'pending').length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertCircle className="w-4 h-4 text-warning" />
                      <span>{groupTasks.filter(t => t.status === 'needs_revision').length}</span>
                    </div>
                  </div>

                  {/* Students */}
                  <div className="flex -space-x-2">
                    {group.students.slice(0, 4).map(student => (
                      <Avatar key={student.id} className="w-8 h-8 border-2 border-card">
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback className="text-xs bg-secondary">
                          {getInitials(student.name)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {group.students.length > 4 && (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-card">
                        +{group.students.length - 4}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Group Detail Modal */}
      <Dialog open={!!selectedGroup} onOpenChange={() => setSelectedGroup(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          {selectedGroup && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedGroup.name}</DialogTitle>
                <p className="text-sm text-muted-foreground">{selectedGroup.projectName}</p>
              </DialogHeader>

              <div className="space-y-6 pt-4">
                {/* Overall Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm font-medium">{getGroupProgress(selectedGroup.id)}%</span>
                  </div>
                  <Progress value={getGroupProgress(selectedGroup.id)} className="h-3" />
                </div>

                {/* Student Performance */}
                <div className="space-y-4">
                  <h3 className="font-medium text-foreground">Student Performance</h3>
                  {selectedGroup.students.map(student => {
                    const stats = getStudentStats(student.id, selectedGroup.id);
                    const fullStudent = demoStudents.find(s => s.id === student.id);
                    
                    return (
                      <Card key={student.id} className="bg-secondary/30">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={student.avatar} />
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {getInitials(student.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-medium">{student.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {fullStudent?.enrollmentId}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <div className="text-center">
                                <p className="font-semibold text-success">{stats.approved}</p>
                                <p className="text-xs text-muted-foreground">Approved</p>
                              </div>
                              <div className="text-center">
                                <p className="font-semibold text-muted-foreground">{stats.pending}</p>
                                <p className="text-xs text-muted-foreground">Pending</p>
                              </div>
                              <div className="text-center">
                                <p className="font-semibold text-warning">{stats.revision}</p>
                                <p className="text-xs text-muted-foreground">Revision</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
