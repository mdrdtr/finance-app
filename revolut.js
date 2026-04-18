import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  'https://smtnkxhsxerdkrggdxuc.supabase.co',
  'sb_publishable_vMLbSiqKJn5D_NOzFUCmZw_MC5oHqNs'
)

let sortDirection = "desc"

document.getElementById('form').addEventListener('submit', async (e) => {
  e.preventDefault()

  const inVal = parseFloat(document.getElementById('in').value) || null
  const outVal = parseFloat(document.getElementById('out').value) || null

  if (inVal && outVal) {
    alert("Non puoi inserire sia IN che OUT")
    return
  }

  if (!inVal && !outVal) {
    alert("Devi inserire almeno IN o OUT")
    return
  }

  const data = {
    date: document.getElementById('date').value,
    in_amount: inVal,
    out_amount: outVal,
    counterparty: document.getElementById('counterparty').value || null,
    reason: document.getElementById('reason').value || null,
    group_code: document.getElementById('group').value || null,
    notes: document.getElementById('notes').value || null
  }

  const { error } = await supabase
    .from('transactions_revolut')
    .insert([data])

  if (error) {
    console.error(error)
    alert("Errore inserimento")
  } else {
    document.getElementById('form').reset()
    loadData()
  }
})

function getFilters() {
  return {
    from: document.getElementById('fromDate')?.value,
    to: document.getElementById('toDate')?.value,
    type: document.getElementById('typeFilter')?.value,
    group: document.getElementById('groupFilter')?.value?.toLowerCase()
  }
}

async function loadData() {
  const { data } = await supabase
    .from('transactions_revolut')
    .select('*')
    .order('date', { ascending: false })

  if (!data) return

  let filtered = [...data]

  const filters = getFilters()

  // DATE FILTER
  if (filters.from) filtered = filtered.filter(t => formatDate(t.date) >= filters.from)
  if (filters.to) filtered = filtered.filter(t => formatDate(t.date) <= filters.to)

  // TYPE FILTER
  if (filters.type === "in") {
    filtered = filtered.filter(t => t.in_amount)
  }

  if (filters.type === "out") {
    filtered = filtered.filter(t => t.out_amount)
  }

  // GROUP FILTER
  if (filters.group) {
    filtered = filtered.filter(t =>
      (t.group_code || "").toLowerCase().includes(filters.group)
    )
  }

  // SORT BY DATE
  filtered.sort((a, b) => {
    return sortDirection === "asc"
      ? new Date(a.date) - new Date(b.date)
      : new Date(b.date) - new Date(a.date)
  })

  // RENDER + BALANCE
  const list = document.getElementById('list')
  list.innerHTML = ''

  let balance = 0

  filtered.forEach(t => {
    const inVal = Number(t.in_amount) || 0
  const outVal = Number(t.out_amount) || 0

  balance += inVal - outVal

    const div = document.createElement('div')
div.className = "tx-card"

// FIX SICURO (NON PUÒ ROMPERSI)
const isIn = t.in_amount !== null && t.in_amount !== undefined
const amountValue = isIn ? Number(t.in_amount) : Number(t.out_amount || 0)

div.innerHTML = `
  <div class="tx-main">
    <div class="tx-left">
      <div class="tx-date">${formatDate(t.date)}</div>
      <div class="tx-meta">
        ${t.counterparty || ''} ${t.group_code ? `• ${t.group_code}` : ''}
      </div>
    </div>

    <div class="tx-right">
      <div class="tx-amount ${isIn ? 'in' : 'out'}">
        ${isIn ? '+' : '-'}${Math.abs(amountValue)} EUR
      </div>
      <button class="tx-delete">×</button>
    </div>
  </div>

  <div class="tx-details">
    <div><strong>Reason:</strong> ${t.reason || '-'}</div>
    <div><strong>Notes:</strong> ${t.notes || '-'}</div>
  </div>
`

div.addEventListener('click', (e) => {
  if (e.target.classList.contains('tx-delete')) return
  div.classList.toggle('open')
})

div.querySelector('.tx-delete').addEventListener('click', async () => {
  await supabase
    .from('transactions_revolut')
    .delete()
    .eq('id', t.id)

  loadData()
})

list.appendChild(div)
  })

  document.getElementById('balance').innerText =
    `Balance: ${balance} EUR`
}

// EVENTS (IMPORTANTE)
document.getElementById('sortDate')?.addEventListener('click', () => {
  sortDirection = sortDirection === "asc" ? "desc" : "asc"
  loadData()
})

document.getElementById('fromDate')?.addEventListener('change', loadData)
document.getElementById('toDate')?.addEventListener('change', loadData)
document.getElementById('typeFilter')?.addEventListener('change', loadData)
document.getElementById('groupFilter')?.addEventListener('input', loadData)

// INIT
loadData()

function formatDate(dateStr) {
  if (!dateStr) return ''

  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()

  return `${day}/${month}/${year}`
}