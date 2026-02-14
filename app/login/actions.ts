'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function signInWithDiscord() {
  const supabase = await createClient()
  const origin = (await headers()).get('origin')

  const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? origin
  if (!appUrl) {
    redirect('/error')
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: `${appUrl}/auth/callback?next=/account`,
    },
  })

  if (error) {
    redirect('/error')
  }

  if (data.url) {
    redirect(data.url)
  }
}