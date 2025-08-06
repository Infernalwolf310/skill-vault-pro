export type CertificationType = 'certification' | 'badge' | 'qualification';
export type CertificationStatus = 'completed' | 'in_progress';

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  type: CertificationType;
  status: CertificationStatus;
  issued_date?: string;
  expires_date?: string;
  description?: string;
  official_link?: string;
  certificate_file_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  is_admin: boolean;
  totp_secret?: string;
  created_at: string;
  updated_at: string;
}