import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://geftfgjlqruwsbqcixxw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlZnRmZ2pscXJ1d3NicWNpeHh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3MjgzMTIsImV4cCI6MjA0NzMwNDMxMn0.E9DAIHQ2ZJnPJCCeweKj7RCAhK9lu5rPL4vGgPjEPxg',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  }
)