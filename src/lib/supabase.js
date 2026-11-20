import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bdvoajkooopmefhwgmya.supabase.co'
const supabaseKey = 'sb_publishable_yQDPv2FJsSjY9XKmZc74Mg_1GT-INLi'

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)