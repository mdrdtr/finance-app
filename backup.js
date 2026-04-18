import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabase = createClient(
  'https://smtnkxhsxerdkrggdxuc.supabase.co',
  

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
