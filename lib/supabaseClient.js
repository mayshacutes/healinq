import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://thkvlqamhvxcnergwxsu.supabase.co'
const supabaseKey = 'sb_publishable_nAMDW30RvnNZ5_gC1o1jeQ_6BNXHzQJ'

export const supabase = createClient(supabaseUrl, supabaseKey)