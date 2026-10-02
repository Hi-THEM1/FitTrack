
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
)

async function checkSchema() {
  const { data, error } = await supabase.from('exercises').select('*').limit(1)
  if (error) {
    console.error('Error fetching exercises:', error)
  } else {
    console.log('Exercise columns:', Object.keys(data[0] || {}))
  }
}

checkSchema()
