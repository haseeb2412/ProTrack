import { useState, useEffect } from 'react';
import { useMessaging } from '@/contexts/MessagingContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { X, Users } from 'lucide-react';

export default function CreateGroupDialog({ onClose }: { onClose: () => void }) {
  const [groupName, setGroupName] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const { createGroup } = useMessaging();
  const { user } = useAuth();

  useEffect(() => {
    // Get all users (students + teachers) from localStorage
    const usersStr = localStorage.getItem('protrack_users');
    const users = usersStr ? JSON.parse(usersStr) : [];
    // Filter out current user
    const otherUsers = users.filter((u: any) => u.id !== user?.id);
    setAllUsers(otherUsers);
  }, [user]);

  const toggleMember = (userId: string) => {
    setSelectedMemberIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = () => {
    if (!groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    if (selectedMemberIds.length === 0) {
      toast.error('Please select at least one member');
      return;
    }

    const newGroup = createGroup(groupName.trim(), selectedMemberIds);
    if (newGroup) {
      toast.success(`Group "${groupName}" created successfully!`);
      onClose();
      setGroupName('');
      setSelectedMemberIds([]);
    } else {
      toast.error('Failed to create group');
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>
            Select members to add to your group chat
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Select Members ({selectedMemberIds.length} selected)</Label>
            {selectedMemberIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedMemberIds.map(id => {
                  const member = allUsers.find(u => u.id === id);
                  if (!member) return null;
                  return (
                    <Badge
                      key={id}
                      variant="secondary"
                      className="gap-1 cursor-pointer hover:bg-destructive/20"
                      onClick={() => toggleMember(id)}
                    >
                      {member.name}
                      <X className="w-3 h-3" />
                    </Badge>
                  );
                })}
              </div>
            )}

            <ScrollArea className="h-64 border rounded-md p-2">
              {allUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <Users className="w-8 h-8 text-muted-foreground mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground">No other users found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {allUsers.map((person) => (
                    <div
                      key={person.id}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary cursor-pointer"
                      onClick={() => toggleMember(person.id)}
                    >
                      <Checkbox checked={selectedMemberIds.includes(person.id)} />
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={person.avatar} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {getInitials(person.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{person.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {person.role === 'student' ? 'Student' : person.role === 'teacher' ? 'Teacher' : 'Admin'} • {person.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleCreate}>
              Create Group
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

