import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CertificationCard } from '@/components/CertificationCard';
import { CertificationFilters } from '@/components/CertificationFilters';
import { AuthForm } from '@/components/AuthForm';
import { supabase } from '@/integrations/supabase/client';
import { Certification } from '@/types/certification';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

const Index = () => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [filteredCertifications, setFilteredCertifications] = useState<Certification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [issuerFilter, setIssuerFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [issuers, setIssuers] = useState<string[]>([]);
  const { user, loading } = useAuth();

  useEffect(() => {
    fetchCertifications();
  }, []);

  useEffect(() => {
    filterAndSortCertifications();
  }, [certifications, searchTerm, issuerFilter, typeFilter, statusFilter, sortBy]);

  const fetchCertifications = async () => {
    const { data, error } = await supabase
      .from('certifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCertifications(data);
      const uniqueIssuers = [...new Set(data.map(cert => cert.issuer))].sort();
      setIssuers(uniqueIssuers);
    }
  };

  const filterAndSortCertifications = () => {
    let filtered = certifications.filter(cert => {
      const matchesSearch = cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cert.issuer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesIssuer = issuerFilter === 'all' || cert.issuer === issuerFilter;
      const matchesType = typeFilter === 'all' || cert.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
      
      return matchesSearch && matchesIssuer && matchesType && matchesStatus;
    });

    // Sort certifications
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'issuer':
          return a.issuer.localeCompare(b.issuer);
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    setFilteredCertifications(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-primary">Accreditations & Certificates</h1>
                <p className="text-muted-foreground mt-2">A showcase of achievements and professional development</p>
              </div>
            </div>
          </div>
        </header>

        {/* Loading content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading certifications...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-primary">Accreditations & Certificates</h1>
              <p className="text-muted-foreground mt-2">A showcase of achievements and professional development</p>
            </div>
            {user ? (
              <Link to="/admin">
                <Button className="bg-primary hover:bg-primary/90">
                  Admin Panel
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button className="bg-primary hover:bg-primary/90">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <CertificationFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          issuerFilter={issuerFilter}
          onIssuerFilterChange={setIssuerFilter}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          issuers={issuers}
        />

        {/* Certifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertifications.map((certification) => (
            <CertificationCard
              key={certification.id}
              certification={certification}
            />
          ))}
        </div>

        {filteredCertifications.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No certifications found matching your criteria.</p>
          </div>
        )}
      </main>

      {/* Auth Modal for non-authenticated users trying to access admin */}
      {!user && window.location.pathname === '/admin' && <AuthForm />}
    </div>
  );
};

export default Index;
