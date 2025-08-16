import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

describe('Supabase Client', () => {
  it('should be properly configured', () => {
    // Check if Supabase configuration is set
    expect(isSupabaseConfigured).toBeDefined();
    
    // If Supabase URL and Key are not set in environment variables,
    // isSupabaseConfigured should be false
    expect(isSupabaseConfigured).toBe(false);
  });

  it('should create a client instance', () => {
    // Temporarily mock the environment variables for this test
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test-url.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key'
    };

    const client = createClient();
    
    // Check if client is created
    expect(client).toBeDefined();
    expect(typeof client.from).toBe('function');
    
    // Restore original environment variables
    process.env = originalEnv;
  });

  it('should throw error if not properly configured', () => {
    // Make sure environment variables are not set
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: undefined,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined
    };

    expect(() => createClient()).toThrow('Supabase URL and Key must be provided');
    
    // Restore original environment variables
    process.env = originalEnv;
  });
});
