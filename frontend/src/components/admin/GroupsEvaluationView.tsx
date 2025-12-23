import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Group, Task } from '@/types';
import { demoGroups, demoTasks } from '@/data/demoData';
import { CheckCircle2, Clock, AlertCircle, FileText, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function GroupsEvaluationView() {
  const [groups] = useState<Group[]>(demoGroups);
  const [tasks] = useState<Task[]>(demoTasks);

  const getGroupTasks = (groupId: string) => {
    return tasks.filter(t => t.groupId === groupId);
  };

  const getGroupProgress = (groupId: string) => {
    const groupTasks = getGroupTasks(groupId);
    if (groupTasks.length === 0) return 0;
    const approved = groupTasks.filter(t => t.status === 'approved').length;
    return Math.round((approved / groupTasks.length) * 100);
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'needs_revision':
        return <AlertCircle className="w-4 h-4 text-warning" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: Task['status']) => {
    const variants: Record<Task['status'], string> = {
      approved: 'bg-success/10 text-success border-success/20',
      needs_revision: 'bg-warning/10 text-warning border-warning/20',
      pending: 'bg-muted text-muted-foreground border-border',
    };
    return variants[status];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Groups Evaluation</h1>
        <p className="text-muted-foreground">Review progress and evaluations for all groups</p>
      </div>

      <div className="space-y-4">
        {groups.map((group, index) => {
          const groupTasks = getGroupTasks(group.id);
          const progress = getGroupProgress(group.id);
          const approvedCount = groupTasks.filter(t => t.status === 'approved').length;
          const pendingCount = groupTasks.filter(t => t.status === 'pending').length;
          const revisionCount = groupTasks.filter(t => t.status === 'needs_revision').length;

          return (
            <Card 
              key={group.id} 
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Accordion type="single" collapsible>
                <AccordionItem value={group.id} className="border-0">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full pr-4 text-left">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{group.name}</h3>
                        <p className="text-sm text-muted-foreground">{group.projectName}</p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-success" />
                          <span>{approvedCount}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{pendingCount}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <AlertCircle className="w-4 h-4 text-warning" />
                          <span>{revisionCount}</span>
                        </div>
                        
                        <div className="hidden sm:flex items-center gap-2 w-32">
                          <Progress value={progress} className="h-2" />
                          <span className="text-sm font-medium text-muted-foreground w-10">
                            {progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="px-6 pb-6">
                    <div className="border-t pt-4">
                      <div className="grid gap-4 sm:hidden mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Progress:</span>
                          <Progress value={progress} className="h-2 flex-1" />
                          <span className="text-sm font-medium">{progress}%</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="text-sm text-muted-foreground">Team:</span>
                        {group.students.map(student => (
                          <Badge key={student.id} variant="outline" className="text-xs">
                            {student.name}
                          </Badge>
                        ))}
                      </div>

                      {groupTasks.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          No tasks submitted yet
                        </p>
                      ) : (
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-foreground">Task Evaluations</h4>
                          {groupTasks.map(task => (
                            <Card key={task.id} className="bg-secondary/30">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  {getStatusIcon(task.status)}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h5 className="font-medium text-foreground">{task.name}</h5>
                                      <Badge variant="outline" className={getStatusBadge(task.status)}>
                                        {task.status.replace('_', ' ')}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {task.description}
                                    </p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                      <span>By: {task.studentName}</span>
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {format(new Date(task.createdAt), 'MMM d, yyyy')}
                                      </span>
                                      {task.fileName && (
                                        <span className="flex items-center gap-1">
                                          <FileText className="w-3 h-3" />
                                          {task.fileName}
                                        </span>
                                      )}
                                    </div>
                                    
                                    {task.comments.length > 0 && (
                                      <div className="mt-3 p-3 bg-background rounded-md">
                                        <p className="text-xs font-medium text-foreground mb-1">
                                          Teacher Feedback:
                                        </p>
                                        {task.comments.map(comment => (
                                          <p key={comment.id} className="text-sm text-muted-foreground">
                                            "{comment.content}"
                                            <span className="text-xs ml-2">
                                              — {comment.authorName}
                                            </span>
                                          </p>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
