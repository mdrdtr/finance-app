import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
import * as XLSX from "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm"

const supabase = createClient(
  'https://smtnkxhsxerdkrggdxuc.supabase.co',
  'sb_publishable_vMLbSiqKJn5D_NOzFUCmZw_MC5oHqNs'
)

const { data } = await supabase.auth.getUser()

if (!data.user) {
  window.location.href = "login.html"
} else {
  document.body.style.display = "block"
}

// =====================
// CALCOLO BALANCE
// =====================
function calcBalance(data) {
  let balance = 0

  data.forEach(t => {
    if (t.in_amount) balance += Number(t.in_amount)
    if (t.out_amount) balance -= Number(t.out_amount)
  })

  return balance
}

async function getBalance(table, elementId, currency) {
  const { data } = await supabase
    .from(table)
    .select('in_amount, out_amount')

  if (!data) return

  const balance = calcBalance(data)

  document.getElementById(elementId).innerText =
    `${balance.toFixed(2)} ${currency}`
}

// =====================
// LOAD OVERVIEW
// =====================
async function loadOverview() {
  const sek = await supabase.from('transactions_sek').select('*')
  const eur = await supabase.from('transactions_eur').select('*')
  const saving = await supabase.from('transactions_saving').select('in_amount, out_amount')
  const revolut = await supabase.from('transactions_revolut').select('in_amount, out_amount')

  document.getElementById('sekBalance').innerText =
    calcBalance(sek.data || []) + ' SEK'

  document.getElementById('eurBalance').innerText =
    calcBalance(eur.data || []) + ' EUR'

  document.getElementById('savingBalance').innerText =
    calcBalance(saving.data || []) + ' SEK'

  document.getElementById('revolutBalance').innerText =
    calcBalance(revolut.data || []) + ' EUR'
}

// =====================
// NAVIGATION
// =====================
document.getElementById('openSek').addEventListener('click', () => {
  window.location.href = 'sek.html'
})

document.getElementById('openEur').addEventListener('click', () => {
  window.location.href = 'eur.html'
})

document.getElementById('openSaving').addEventListener('click', () => {
  window.location.href = 'saving.html'
})

document.getElementById('openRevolut').addEventListener('click', () => {
  window.location.href = 'revolut.html'
})

// =====================
// INIT
// =====================
loadOverview()

async function exportTable(tableName, fileName) {
  const { data } = await supabase.from(tableName).select('*')

  if (!data) return

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(wb, ws, "data")

  XLSX.writeFile(wb, fileName + ".xlsx")
}

window.exportTable = exportTable

async function exportFiltered(tableName, fileName) {
  const from = document.getElementById('fromDate')?.value
  const to = document.getElementById('toDate')?.value
  const type = document.getElementById('typeFilter')?.value
  const group = document.getElementById('groupFilter')?.value?.toLowerCase()

  const { data } = await supabase.from(tableName).select('*')

  if (!data) return

  let filtered = [...data]

  if (from) filtered = filtered.filter(t => t.date >= from)
  if (to) filtered = filtered.filter(t => t.date <= to)

  if (type === "in") filtered = filtered.filter(t => t.in_amount)
  if (type === "out") filtered = filtered.filter(t => t.out_amount)

  if (group) {
    filtered = filtered.filter(t =>
      (t.group_code || "").toLowerCase().includes(group)
    )
  }

  const ws = XLSX.utils.json_to_sheet(filtered)
  const wb = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(wb, ws, "filtered")

  XLSX.writeFile(wb, fileName + "_filtered.xlsx")
}

window.exportTable = exportTable
window.exportFiltered = exportFiltered
