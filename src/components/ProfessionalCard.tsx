
import React from 'react';
import { User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface ProfessionalCardProps {
  professional: User;
  onStartChat: () => void;
}

const ProfessionalCard: React.FC<ProfessionalCardProps> = ({ professional, onStartChat }) => {
  return (
    <Card className="shadow-sm hover:shadow transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={professional.profileImage} />
            <AvatarFallback>{professional.fullName.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">{professional.fullName}</CardTitle>
            <CardDescription className="capitalize">{professional.role}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {professional.degree && (
          <p className="text-sm text-muted-foreground mb-4">{professional.degree}</p>
        )}
        <Button onClick={onStartChat} className="w-full gap-2">
          <MessageSquare className="h-4 w-4" />
          Start Chat
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfessionalCard;
