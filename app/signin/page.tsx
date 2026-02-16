import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signInWithDiscord } from './actions'

export default async function LoginPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/account')
  }

  return (
    <div>
      <button onClick={signInWithDiscord}>
        discord login
      </button>
    </div>
  )
}