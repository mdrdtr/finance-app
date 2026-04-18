import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabase = createClient(
  'https://smtnkxhsxerdkrggdxuc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdG5reGhzeGVyZGtyZ2dkeHVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQzNjczMywiZXhwIjoyMDkyMDEyNzMzfQ.yq6feL5PfZedK54gaxEiLcRsZJIZ2jwIR_9WQBkNby0' // ⚠️ NON la public key
)

async function backup(table) {
  const { data } = await supabase.from(table).select('*')

  const csv = [
    Object.keys(data[0]).join(','),
    ...data.map(r => Object.values(r).join(','))
  ].join('\n')

  const date = new Date().toISOString().split('T')[0]
  fs.writeFileSync(`${table}_${date}.csv`, csv)
}

await backup('transactions_sek')
await backup('transactions_eur')
await backup('transactions_saving')
await backup('transactions_revolut')
