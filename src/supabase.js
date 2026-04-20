import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://volngrfaxqunevopkkiu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvbG5ncmZheHF1bmV2b3BraXUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NjgwOTk0MCwiZXhwIjoxOTYyMzg1OTQwfQ.SbT_X4SUdm2W4dKTAZZqBqLpBP7I_rKQeGL5_6u1zXU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
