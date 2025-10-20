# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Create a new project
3. Choose a region close to your users
4. Set a strong database password

## 2. Configure Authentication

1. In your Supabase dashboard, go to **Authentication** > **Settings**
2. Enable **Phone** authentication
3. Configure your SMS provider (Twilio is recommended)
4. Set up your phone number for testing

## 3. Create Database Tables

Run these SQL commands in your Supabase SQL editor:

```sql
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  phone_number TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create function to handle new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, phone_number)
  VALUES (NEW.id, NEW.phone);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## 4. Environment Variables

Create a `.env` file in your project root with:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under **API**.

## 5. SMS Provider Setup (Twilio)

1. Sign up for [Twilio](https://twilio.com)
2. Get your Account SID and Auth Token
3. In Supabase, go to **Authentication** > **Settings** > **Phone Auth**
4. Configure Twilio with your credentials
5. Set up a phone number for sending SMS

## 6. Testing

1. Use your own phone number for testing
2. Make sure to use the correct country code format (+1 for US)
3. Check the Supabase logs for any authentication errors

## 7. Production Considerations

- Set up proper error handling
- Implement rate limiting
- Use a production SMS provider
- Set up monitoring and alerts
- Configure proper security policies

