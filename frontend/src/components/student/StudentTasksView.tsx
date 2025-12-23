import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Task } from '@/types';
import { demoTasks } from '@/data/demoData';
import { Plus, CheckCircle2, Clock, AlertCircle, FileText, Calendar, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function StudentTasksView() {
  const [tasks, setTasks] = useState<Task[]>(demoTasks.filter(t => t.studentId === 's-001'));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [fileName, setFileName] = useState('');

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'needs_revision': return <AlertCircle className="w-5 h-5 text-warning" />;
      default: return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: Task['status']) => {
    const config: Record<Task['status'], { label: string; className: string }> = {
      approved: { label: 'Approved', className: 'bg-success/10 text-success border-success/20' },
      needs_revision: { label: 'Needs Revision', className: 'bg-warning/10 text-warning border-warning/20' },
      pending: { label: 'Pending', className: 'bg-muted text-muted-foreground border-border' },
    };
    return config[status];
  };

  const handleCreateTask = () => {
    if (!taskName || !taskDescription) {
      toast.error('Please fill all required fields');
      return;
    }
    const newTask: Task = {
      id: `task-${Date.now()}`,
      name: taskName,
      description: taskDescription,
      studentId: 's-001',
      studentName: 'Alex Johnson',
      groupId: 'g-001',
      fileName: fileName || undefined,
      status: 'pending',
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTasks(prev => [newTask, ...prev]);
    toast.success('Task created successfully!');
    setTaskName(''); setTaskDescription(''); setFileName('');
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Tasks</h1>
          <p className="text-muted-foreground">Create and track your project tasks</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" />Create Task</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Task</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Task Name</Label>
                <Input placeholder="Enter task name" value={taskName} onChange={(e) => setTaskName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe the task..." value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} className="min-h-[100px]" />
              </div>
              <div className="space-y-2">
                <Label>Upload File (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-accent transition-colors">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload or drag files here</p>
                  <Input type="text" placeholder="Or enter filename" value={fileName} onChange={(e) => setFileName(e.target.value)} className="mt-2" />
                </div>
              </div>
              <Button onClick={handleCreateTask} className="w-full">Create Task</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {tasks.map((task, index) => {
          const statusBadge = getStatusBadge(task.status);
          return (
            <Card key={task.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {getStatusIcon(task.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{task.name}</h3>
                      <Badge variant="outline" className={statusBadge.className}>{statusBadge.label}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(task.createdAt), 'MMM d, yyyy')}</span>
                      {task.fileName && <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{task.fileName}</span>}
                    </div>
                    {task.comments.length > 0 && (
                      <div className="mt-3 p-3 bg-secondary/50 rounded-md">
                        <p className="text-xs font-medium mb-1">Teacher Feedback:</p>
                        <p className="text-sm text-muted-foreground">"{task.comments[task.comments.length - 1].content}"</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
