
import React, { useState, useRef, useEffect } from 'react';
import { User, ChatMessage, ConsultationRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Send } from 'lucide-react';
import { format } from 'date-fns';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  currentUser: User;
  consultation: ConsultationRequest;
  onSendMessage: (content: string) => void;
  onStatusChange?: (status: 'accepted' | 'completed' | 'rejected') => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  currentUser,
  consultation,
  onSendMessage,
  onStatusChange,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Determine the other person in the conversation (professional or user)
  const otherPerson = currentUser._id === consultation.userId 
    ? { _id: consultation.professionalId } 
    : { _id: consultation.userId };
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Card className="flex flex-col h-[600px] shadow-sm">
      <CardHeader className="border-b bg-card">
        <div className="flex items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            {/* This will be replaced by the actual professional/user details now rendered in ProfessionalDetails component */}
            <h3 className="font-medium">Consultation</h3>
            <p className="text-xs text-muted-foreground capitalize">
              {consultation.status}
            </p>
          </div>
          
          {/* Status change buttons for professionals or users based on current status */}
          {onStatusChange && currentUser._id !== consultation.userId && consultation.status === 'pending' && (
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => onStatusChange('accepted')}
                variant="outline"
              >
                Accept
              </Button>
              <Button 
                size="sm" 
                onClick={() => onStatusChange('rejected')}
                variant="destructive"
              >
                Decline
              </Button>
            </div>
          )}
          
          {onStatusChange && consultation.status === 'accepted' && (
            <Button 
              size="sm" 
              onClick={() => onStatusChange('completed')}
              variant="outline"
            >
              Mark as Completed
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">
              Start a conversation
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.senderId === currentUser._id;
            
            return (
              <div
                key={message._id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isCurrentUser && (
                  <Avatar className="h-8 w-8 mr-2 mt-1">
                    <AvatarFallback>{otherPerson._id.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[75%] p-3 rounded-lg ${
                    isCurrentUser
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs opacity-70">
                      {format(new Date(message.timestamp), 'h:mm a, MMM d')}
                    </p>
                    <p className="text-xs opacity-70 ml-2">
                      {isCurrentUser ? 'You' : ''}
                    </p>
                  </div>
                </div>
                {isCurrentUser && (
                  <Avatar className="h-8 w-8 ml-2 mt-1">
                    <AvatarImage src={currentUser.profileImage} />
                    <AvatarFallback>{currentUser.fullName.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      
      <form
        onSubmit={handleSendMessage}
        className="border-t p-4 flex items-center gap-2"
      >
        <Input
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
};

export default ChatInterface;
