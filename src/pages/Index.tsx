import { useState, useEffect, useMemo, useRef } from 'react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [issuerFilter, setIssuerFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [issuers, setIssuers] = useState<string[]>([]);
  const [animatingItems, setAnimatingItems] = useState<Set<string>>(new Set());
  const [isFiltering, setIsFiltering] = useState(false);
  const { user, loading } = useAuth();
  const prevFilteredIds = useRef<string[]>([]);

  useEffect(() => {
    fetchCertifications();
  }, []);

  const filteredCertifications = useMemo(() => {
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
          const aDate = a.issued_date ? new Date(a.issued_date) : new Date(a.created_at);
          const bDate = b.issued_date ? new Date(b.issued_date) : new Date(b.created_at);
          return aDate.getTime() - bDate.getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'issuer':
          return a.issuer.localeCompare(b.issuer);
        case 'newest':
        default:
          const aDateNew = a.issued_date ? new Date(a.issued_date) : new Date(a.created_at);
          const bDateNew = b.issued_date ? new Date(b.issued_date) : new Date(b.created_at);
          return bDateNew.getTime() - aDateNew.getTime();
      }
    });

    return filtered;
  }, [certifications, searchTerm, issuerFilter, typeFilter, statusFilter, sortBy]);

  // Handle smooth transitions when filters change
  useEffect(() => {
    const currentIds = filteredCertifications.map(cert => cert.id);
    const prevIds = prevFilteredIds.current;
    
    if (prevIds.length > 0 && JSON.stringify(currentIds) !== JSON.stringify(prevIds)) {
      setIsFiltering(true);
      
      // Reset after animation duration
      const timer = setTimeout(() => {
        setIsFiltering(false);
      }, 400);
      
      return () => clearTimeout(timer);
    }
    
    prevFilteredIds.current = currentIds;
  }, [filteredCertifications]);

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
          {filteredCertifications.map((certification, index) => (
            <div
              key={certification.id}
              className={`transform transition-all duration-400 ease-out ${
                isFiltering 
                  ? 'opacity-0 translate-y-4 scale-95' 
                  : 'opacity-100 translate-y-0 scale-100'
              }`}
              style={{
                transitionDelay: isFiltering ? '0ms' : `${index * 50}ms`
              }}
            >
              <CertificationCard
                certification={certification}
              />
            </div>
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
