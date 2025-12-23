import { useState, useEffect, useRef } from 'react';
import { useMessaging } from '@/contexts/MessagingContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import CreateGroupDialog from './CreateGroupDialog';
import { MessageSquare, X, Send, Plus, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ChatGroup, Message } from '@/types';

export default function ChatWidget({ initialGroupId }: { initialGroupId?: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { chatGroups, messages, sendMessage } = useMessaging();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle initial group selection (e.g., from notifications)
  useEffect(() => {
    if (initialGroupId) {
      const group = chatGroups.find(g => g.id === initialGroupId);
      if (group) {
        setSelectedGroup(group);
        setIsOpen(true);
      }
    }
  }, [initialGroupId, chatGroups]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (selectedGroup) {
      scrollToBottom();
    }
  }, [messages[selectedGroup?.id || ''], selectedGroup]);

  const handleSendMessage = () => {
    if (!selectedGroup || !messageInput.trim()) return;
    sendMessage(selectedGroup.id, messageInput);
    setMessageInput('');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const groupMessages = selectedGroup ? messages[selectedGroup.id] || [] : [];

  if (!isOpen) {
    return (
      <>
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl z-50 bg-primary hover:bg-primary/90 hover:scale-110 transition-transform duration-200"
          size="icon"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
        {showCreateDialog && <CreateGroupDialog onClose={() => setShowCreateDialog(false)} />}
      </>
    );
  }

  return (
    <>
      <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col border-2">
        <CardHeader className="pb-3 border-b bg-gradient-to-r from-primary/5 to-primary/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg font-semibold">Messages</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-primary/10"
                onClick={() => setShowCreateDialog(true)}
                title="Create Group"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-destructive/10"
                onClick={() => {
                  setIsOpen(false);
                  setSelectedGroup(null);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!selectedGroup ? (
          <div className="flex-1 overflow-hidden flex flex-col">
            <ScrollArea className="flex-1 p-2">
              {chatGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <Users className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-sm text-muted-foreground mb-4">No chat groups yet</p>
                  <Button onClick={() => setShowCreateDialog(true)} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Group
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  {chatGroups.map(group => (
                    <div
                      key={group.id}
                      onClick={() => setSelectedGroup(group)}
                      className="p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-all duration-200 border border-transparent hover:border-accent/30 active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12 border-2 border-primary/20">
                          <AvatarImage src={undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                            {getInitials(group.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-sm truncate">{group.name}</p>
                            {group.lastMessageAt && (
                              <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                {format(new Date(group.lastMessageAt), 'HH:mm')}
                              </span>
                            )}
                          </div>
                          {group.lastMessage && (
                            <p className="text-xs text-muted-foreground truncate">
                              {group.lastMessage}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground/70 mt-0.5">
                            {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col bg-gradient-to-b from-background to-muted/20">
            {/* Chat Header */}
            <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10 flex items-center gap-3 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 hover:bg-primary/20"
                onClick={() => setSelectedGroup(null)}
              >
                <X className="w-4 h-4" />
              </Button>
              <Avatar className="w-10 h-10 border-2 border-primary/30">
                <AvatarImage src={undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                  {getInitials(selectedGroup.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{selectedGroup.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {selectedGroup.members.length} {selectedGroup.members.length === 1 ? 'member' : 'members'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {groupMessages.map((message: Message, index) => {
                  const isOwnMessage = message.senderId === user?.id;
                  const prevMessage = index > 0 ? groupMessages[index - 1] : null;
                  const showSenderName = !prevMessage || prevMessage.senderId !== message.senderId;
                  const isSameSender = prevMessage?.senderId === message.senderId;
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${!isSameSender ? 'mt-4' : 'mt-1'}`}
                    >
                      <div className={`flex items-end gap-2 max-w-[80%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                        {!isOwnMessage && (
                          <Avatar className={`w-6 h-6 ${showSenderName ? 'visible' : 'invisible'}`}>
                            <AvatarFallback className="bg-muted text-xs">
                              {getInitials(message.senderName)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                            isOwnMessage
                              ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-md'
                              : 'bg-card border border-border rounded-bl-md'
                          }`}
                        >
                          {!isOwnMessage && showSenderName && (
                            <p className="text-xs font-semibold mb-1 text-muted-foreground">
                              {message.senderName}
                            </p>
                          )}
                          <p className={`text-sm leading-relaxed ${isOwnMessage ? 'text-primary-foreground' : 'text-foreground'}`}>
                            {message.content}
                          </p>
                          <p className={`text-xs mt-1.5 ${isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {format(new Date(message.createdAt), 'HH:mm')}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-background/95 backdrop-blur-sm flex items-center gap-2 flex-shrink-0">
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 h-10 rounded-full border-2 focus:border-primary/50"
              />
              <Button 
                onClick={handleSendMessage} 
                size="icon"
                className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 shadow-md"
                disabled={!messageInput.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
      {showCreateDialog && <CreateGroupDialog onClose={() => setShowCreateDialog(false)} />}
    </>
  );
}

