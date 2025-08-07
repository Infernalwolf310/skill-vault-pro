-- Set the existing user as admin
UPDATE public.profiles 
SET is_admin = true 
WHERE user_id = '52f74e78-6e52-4a9b-94a9-0950b745a20c';