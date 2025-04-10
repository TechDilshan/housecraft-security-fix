
import React from 'react';
import { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

interface ProfessionalDetailsProps {
  professional: User | null;
}

const ProfessionalDetails = ({ professional }: ProfessionalDetailsProps) => {
  if (!professional) {
    return null;
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={professional.profileImage} alt={professional.fullName} />
            <AvatarFallback>{getInitials(professional.fullName)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-medium">{professional.fullName}</h3>
            <p className="text-sm text-muted-foreground">{professional.role.charAt(0).toUpperCase() + professional.role.slice(1)}</p>
            <p className="text-sm">{professional.email}</p>
            {professional.degree && (
              <p className="text-sm mt-1 text-muted-foreground">{professional.degree}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfessionalDetails;
