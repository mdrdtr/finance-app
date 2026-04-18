import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  'https://smtnkxhsxerdkrggdxuc.supabase.co',
  'sb_publishable_vMLbSiqKJn5D_NOzFUCmZw_MC5oHqNs'
)

document.getElementById('loginBtn').addEventListener('click', async () => {
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    alert(error.message)
    return
  }

  window.location.href = "index.html"
})