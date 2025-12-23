import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Task } from '@/types';
import { demoTasks, demoGroups } from '@/data/demoData';
import { CheckCircle2, Clock, AlertCircle, FileText, MessageSquare, Calendar, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function TaskReviewView() {
  const [tasks, setTasks] = useState<Task[]>(demoTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newComment, setNewComment] = useState('');

  // Filter tasks from groups assigned to this teacher
  const teacherGroupIds = demoGroups.filter(g => g.teacherId === 't-001').map(g => g.id);
  const teacherTasks = tasks.filter(t => teacherGroupIds.includes(t.groupId));

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'needs_revision':
        return <AlertCircle className="w-5 h-5 text-warning" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: Task['status']) => {
    const config: Record<Task['status'], { label: string; className: string }> = {
      approved: { label: 'Approved', className: 'bg-success/10 text-success border-success/20' },
      needs_revision: { label: 'Needs Revision', className: 'bg-warning/10 text-warning border-warning/20' },
      pending: { label: 'Pending Review', className: 'bg-muted text-muted-foreground border-border' },
    };
    return config[status];
  };

  const handleApprove = (taskId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: 'approved' as const, updatedAt: new Date() } : t
    ));
    toast.success('Task approved!');
    setSelectedTask(null);
  };

  const handleRequestRevision = (taskId: string) => {
    if (!newComment.trim()) {
      toast.error('Please add a comment explaining what needs revision');
      return;
    }
    
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { 
        ...t, 
        status: 'needs_revision' as const, 
        updatedAt: new Date(),
        comments: [...t.comments, {
          id: `c-${Date.now()}`,
          taskId: t.id,
          authorId: 't-001',
          authorName: 'Prof. Sarah Wilson',
          authorRole: 'teacher' as const,
          content: newComment,
          createdAt: new Date(),
        }]
      } : t
    ));
    toast.success('Revision requested with feedback');
    setNewComment('');
    setSelectedTask(null);
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedTask) return;
    
    setTasks(prev => prev.map(t => 
      t.id === selectedTask.id ? { 
        ...t, 
        comments: [...t.comments, {
          id: `c-${Date.now()}`,
          taskId: t.id,
          authorId: 't-001',
          authorName: 'Prof. Sarah Wilson',
          authorRole: 'teacher' as const,
          content: newComment,
          createdAt: new Date(),
        }]
      } : t
    ));
    
    setSelectedTask(prev => prev ? {
      ...prev,
      comments: [...prev.comments, {
        id: `c-${Date.now()}`,
        taskId: prev.id,
        authorId: 't-001',
        authorName: 'Prof. Sarah Wilson',
        authorRole: 'teacher' as const,
        content: newComment,
        createdAt: new Date(),
      }]
    } : null);
    
    toast.success('Comment added');
    setNewComment('');
  };

  const getGroupName = (groupId: string) => {
    return demoGroups.find(g => g.id === groupId)?.name || 'Unknown Group';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Task Review</h1>
        <p className="text-muted-foreground">Review and approve student task submissions</p>
      </div>

      {teacherTasks.length === 0 ? (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No tasks to review</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {teacherTasks.map((task, index) => {
            const statusBadge = getStatusBadge(task.status);
            return (
              <Card 
                key={task.id}
                className="hover:shadow-md transition-all cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => setSelectedTask(task)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {getStatusIcon(task.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{task.name}</h3>
                        <Badge variant="outline" className={statusBadge.className}>
                          {statusBadge.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {task.description}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
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
                        {task.comments.length > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {task.comments.length}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {getGroupName(task.groupId)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Task Detail Modal */}
      <Dialog open={!!selectedTask} onOpenChange={() => { setSelectedTask(null); setNewComment(''); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          {selectedTask && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedTask.status)}
                  <DialogTitle>{selectedTask.name}</DialogTitle>
                </div>
                <DialogDescription>
                  Submitted by {selectedTask.studentName} on {format(new Date(selectedTask.createdAt), 'MMMM d, yyyy')}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 pt-4">
                {/* Description */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedTask.description}</p>
                </div>

                {/* File */}
                {selectedTask.fileName && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">Attached File</h4>
                    <Button variant="outline" className="gap-2">
                      <FileText className="w-4 h-4" />
                      {selectedTask.fileName}
                    </Button>
                  </div>
                )}

                {/* Comments */}
                {selectedTask.comments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">Comments</h4>
                    <div className="space-y-3">
                      {selectedTask.comments.map(comment => (
                        <Card key={comment.id} className="bg-secondary/30">
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">{comment.authorName}</span>
                              <Badge variant="outline" className="text-xs">
                                {comment.authorRole}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{comment.content}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Comment */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Add Comment</h4>
                  <Textarea
                    placeholder="Write your feedback here..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  {selectedTask.status === 'pending' && (
                    <>
                      <Button 
                        variant="outline" 
                        className="flex-1 gap-2 text-warning hover:bg-warning/10"
                        onClick={() => handleRequestRevision(selectedTask.id)}
                      >
                        <X className="w-4 h-4" />
                        Request Revision
                      </Button>
                      <Button 
                        className="flex-1 gap-2 bg-success hover:bg-success/90"
                        onClick={() => handleApprove(selectedTask.id)}
                      >
                        <Check className="w-4 h-4" />
                        Approve Task
                      </Button>
                    </>
                  )}
                  {selectedTask.status !== 'pending' && (
                    <Button onClick={handleAddComment} className="flex-1">
                      Add Comment
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
