declare module '@/lib/supabase/server' {
  export const createClient: () => {
    from: (table: string) => {
      select: (fields?: string) => any;
      insert: (data: any) => any;
      update: (data: any) => any;
      delete: () => any;
      eq: (field: string, value: any) => any;
      order: (field: string, options: { ascending: boolean }) => any;
      limit: (count: number) => Promise<{ data: any[]; error: any }>;
    };
  };
  
  export const isSupabaseConfigured: boolean;
}
