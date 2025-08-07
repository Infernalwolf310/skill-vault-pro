import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Certification, CertificationType, CertificationStatus } from '@/types/certification';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Upload, Tags, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const Admin = () => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSkillsDialogOpen, setIsSkillsDialogOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const [selectedCertForSkills, setSelectedCertForSkills] = useState<Certification | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { signOut } = useAuth();

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    const { data, error } = await supabase
      .from('certifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch certifications",
        variant: "destructive",
      });
    } else {
      setCertifications(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const issuer = formData.get('issuer') as string;
    const type = formData.get('type') as CertificationType;
    const status = formData.get('status') as CertificationStatus;
    const issued_date = formData.get('issued_date') as string;
    const expires_date = formData.get('expires_date') as string;
    const description = formData.get('description') as string;
    const official_link = formData.get('official_link') as string;

    let certificate_file_url = editingCert?.certificate_file_url;

    // Handle file upload
    if (file) {
      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(fileName, file);

      if (uploadError) {
        toast({
          title: "Error",
          description: "Failed to upload file",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('certificates')
        .getPublicUrl(fileName);
      
      certificate_file_url = publicUrl;
    }

    const certData = {
      title,
      issuer,
      type,
      status,
      issued_date: issued_date || null,
      expires_date: expires_date || null,
      description: description || null,
      official_link: official_link || null,
      certificate_file_url,
    };

    if (editingCert) {
      const { error } = await supabase
        .from('certifications')
        .update(certData)
        .eq('id', editingCert.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update certification",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Certification updated successfully",
        });
      }
    } else {
      const { error } = await supabase
        .from('certifications')
        .insert([certData]);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create certification",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Certification created successfully",
        });
      }
    }

    setIsLoading(false);
    setIsDialogOpen(false);
    setEditingCert(null);
    setFile(null);
    fetchCertifications();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('certifications')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete certification",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Certification deleted successfully",
      });
      fetchCertifications();
    }
  };

  const openEditDialog = (cert: Certification) => {
    setEditingCert(cert);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingCert(null);
    setFile(null);
    setIsDialogOpen(true);
  };

  const fetchSkills = async (certificationId: string) => {
    const { data } = await supabase
      .from('skills')
      .select('skill_name')
      .eq('certification_id', certificationId)
      .order('skill_name');
    
    if (data) {
      setSkills(data.map(skill => skill.skill_name));
    }
  };

  const openSkillsDialog = (cert: Certification) => {
    setSelectedCertForSkills(cert);
    setIsSkillsDialogOpen(true);
    fetchSkills(cert.id);
  };

  const addSkill = async () => {
    if (!newSkill.trim() || !selectedCertForSkills) return;

    const { error } = await supabase
      .from('skills')
      .insert([{
        certification_id: selectedCertForSkills.id,
        skill_name: newSkill.trim()
      }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add skill",
        variant: "destructive",
      });
    } else {
      setNewSkill('');
      fetchSkills(selectedCertForSkills.id);
      toast({
        title: "Success",
        description: "Skill added successfully",
      });
    }
  };

  const removeSkill = async (skillName: string) => {
    if (!selectedCertForSkills) return;

    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('certification_id', selectedCertForSkills.id)
      .eq('skill_name', skillName);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove skill",
        variant: "destructive",
      });
    } else {
      fetchSkills(selectedCertForSkills.id);
      toast({
        title: "Success",
        description: "Skill removed successfully",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage certifications and credentials</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog} className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Certification
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingCert ? 'Edit Certification' : 'Add New Certification'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        name="title"
                        defaultValue={editingCert?.title}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="issuer">Issuer *</Label>
                      <Input
                        id="issuer"
                        name="issuer"
                        defaultValue={editingCert?.issuer}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Type *</Label>
                      <Select name="type" defaultValue={editingCert?.type || 'certification'}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="certification">Certification</SelectItem>
                          <SelectItem value="badge">Badge</SelectItem>
                          <SelectItem value="qualification">Qualification</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status *</Label>
                      <Select name="status" defaultValue={editingCert?.status || 'completed'}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="issued_date">Issued Date</Label>
                      <Input
                        id="issued_date"
                        name="issued_date"
                        type="date"
                        defaultValue={editingCert?.issued_date}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expires_date">Expires Date</Label>
                      <Input
                        id="expires_date"
                        name="expires_date"
                        type="date"
                        defaultValue={editingCert?.expires_date}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      defaultValue={editingCert?.description}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="official_link">Official Link</Label>
                    <Input
                      id="official_link"
                      name="official_link"
                      type="url"
                      defaultValue={editingCert?.official_link}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="certificate_file">Certificate File</Label>
                    <Input
                      id="certificate_file"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    {editingCert?.certificate_file_url && !file && (
                      <p className="text-sm text-muted-foreground">
                        Current file: <a href={editingCert.certificate_file_url} target="_blank" rel="noopener noreferrer" className="text-primary">View file</a>
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Saving...' : editingCert ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {certifications.map((cert) => (
            <Card key={cert.id} className="bg-gradient-card border-border">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-primary">{cert.title}</CardTitle>
                    <CardDescription>{cert.issuer}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openSkillsDialog(cert)}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Tags className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(cert)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(cert.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Type:</span> {cert.type}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> {cert.status}
                  </div>
                  <div>
                    <span className="font-medium">Issued:</span> {cert.issued_date || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Expires:</span> {cert.expires_date || 'N/A'}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Skills Management Dialog */}
        <Dialog open={isSkillsDialogOpen} onOpenChange={setIsSkillsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Manage Skills - {selectedCertForSkills?.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a new skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <Button onClick={addSkill} disabled={!newSkill.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Current Skills:</h3>
                {skills.length === 0 ? (
                  <p className="text-muted-foreground">No skills added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {skills.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                        <span>{skill}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSkill(skill)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Admin;