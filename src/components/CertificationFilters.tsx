import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface CertificationFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  issuerFilter: string;
  onIssuerFilterChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  issuers: string[];
}

export const CertificationFilters = ({
  searchTerm,
  onSearchChange,
  issuerFilter,
  onIssuerFilterChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
  issuers
}: CertificationFiltersProps) => {
  return (
    <div className="flex flex-col lg:flex-row gap-4 mb-8 animate-fade-in-up">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search certifications..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Select value={issuerFilter} onValueChange={onIssuerFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Issuers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Issuers</SelectItem>
            {issuers.map((issuer) => (
              <SelectItem key={issuer} value={issuer}>
                {issuer}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={onTypeFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="certification">Certification</SelectItem>
            <SelectItem value="badge">Badge</SelectItem>
            <SelectItem value="qualification">Qualification</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="title">Title A-Z</SelectItem>
            <SelectItem value="issuer">Issuer A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};