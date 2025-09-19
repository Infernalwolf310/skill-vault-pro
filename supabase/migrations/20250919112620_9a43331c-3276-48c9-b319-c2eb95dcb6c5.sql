-- Create a separate table for TOTP secrets with stricter security
CREATE TABLE public.user_totp_secrets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  totp_secret TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on the new table
ALTER TABLE public.user_totp_secrets ENABLE ROW LEVEL SECURITY;

-- Create strict RLS policies for TOTP secrets - only the user can access their own secrets
CREATE POLICY "Users can only access their own TOTP secrets" 
ON public.user_totp_secrets 
FOR ALL 
USING (auth.uid() = user_id);

-- Migrate existing TOTP secrets from profiles table to the new table
INSERT INTO public.user_totp_secrets (user_id, totp_secret)
SELECT user_id, totp_secret 
FROM public.profiles 
WHERE totp_secret IS NOT NULL;

-- Remove the totp_secret column from profiles table
ALTER TABLE public.profiles DROP COLUMN totp_secret;

-- Add trigger for automatic timestamp updates on the new table
CREATE TRIGGER update_user_totp_secrets_updated_at
BEFORE UPDATE ON public.user_totp_secrets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();