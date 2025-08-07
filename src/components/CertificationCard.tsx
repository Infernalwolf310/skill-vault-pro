import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Certification } from '@/types/certification';
import { ExternalLink, FileText, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CertificationCardProps {
  certification: Certification;
}

export const CertificationCard = ({ certification }: CertificationCardProps) => {
  const [skills, setSkills] = useState<string[]>([]);

  useEffect(() => {
    fetchSkills();
  }, [certification.id]);

  const fetchSkills = async () => {
    const { data } = await supabase
      .from('skills')
      .select('skill_name')
      .eq('certification_id', certification.id)
      .order('skill_name');
    
    if (data) {
      setSkills(data.map(skill => skill.skill_name));
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'certification':
        return 'bg-primary text-primary-foreground';
      case 'badge':
        return 'bg-accent text-accent-foreground';
      case 'qualification':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="bg-gradient-card border-border hover:border-primary/50 transition-all duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <CardTitle className="text-primary text-lg font-semibold">
              {certification.title}
            </CardTitle>
            <p className="text-muted-foreground font-medium">{certification.issuer}</p>
          </div>
        </div>
        
        {certification.status === 'in_progress' && (
          <div className="space-y-1">
            <Badge className="bg-in-progress text-primary-foreground">
              IN PROGRESS
            </Badge>
            {certification.expires_date && (
              <p className="text-xs text-muted-foreground">
                Expires on: {formatDate(certification.expires_date)}
              </p>
            )}
          </div>
        )}
        
        {certification.status === 'completed' && certification.issued_date && (
          <p className="text-sm text-muted-foreground">
            Issued {formatDate(certification.issued_date)}
          </p>
        )}
        
        <Badge className={getTypeColor(certification.type)}>
          {certification.type.charAt(0).toUpperCase() + certification.type.slice(1)}
        </Badge>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {certification.certificate_file_url && (
            <Button 
              variant="outline" 
              size="sm" 
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              asChild
            >
              <a 
                href={certification.certificate_file_url} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <FileText className="w-4 h-4 mr-1" />
                View Certification
              </a>
            </Button>
          )}
          
          {certification.description && (
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Info className="w-4 h-4 mr-1" />
                  Description
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{certification.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {certification.description}
                    </p>
                  </div>
                  {skills.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Skills</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {skills.map((skill, index) => (
                          <li key={index} className="text-muted-foreground">
                            {skill}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          {certification.official_link && (
            <Button 
              variant="outline" 
              size="sm"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              asChild
            >
              <a 
                href={certification.official_link} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Official Link
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};