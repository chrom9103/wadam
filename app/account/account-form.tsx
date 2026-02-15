'use client'
import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { type User } from '@supabase/supabase-js'
import Avatar from './avatar'

export default function AccountForm({ user }: { user: User | null }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [display_name, setDisplayName] = useState<string | null>(null)
  const [avatar_url, setAvatarUrl] = useState<string | null>(null)

  const getProfile = useCallback(async () => {
    try {
      if (!user?.id) {
        setLoading(false)
        return
      }

      setLoading(true)

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`display_name, avatar_url`)
        .eq('id', user?.id)
        .single()

      if (error && status !== 406) {
        console.log(error)
        throw error
      }

      if (data) {
        setDisplayName(data.display_name)
        setAvatarUrl(data.avatar_url)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      alert('Error loading user data!')
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    getProfile()
  }, [user, getProfile])

  async function updateProfile({
    display_name,
    avatar_url,
  }: {
    display_name: string | null
    avatar_url: string | null
  }) {
    try {
      if (!user?.id) {
        throw new Error('Not authenticated.')
      }

      setLoading(true)

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        display_name,
        avatar_url,
        updated_at: new Date().toISOString(),
      })
      if (error) throw error
      alert('Profile updated!')
    } catch (error) {
      console.error('Error updating the data:', error)
      alert('Error updating the data!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-widget">
      <Avatar
        uid={user?.id ?? null}
        url={avatar_url}
        size={150}
        onUpload={(url) => {
          setAvatarUrl(url)
        }}
      />
      {/* ... */}

      <div>
        <label htmlFor="display_name">display name</label>
        <input
          id="display_name"
          type="text"
          value={display_name || ''}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>

      <div>
        <button
          className="button primary block"
          onClick={() => updateProfile({display_name, avatar_url})}
          disabled={loading}
        >
          {loading ? 'Loading ...' : 'Update'}
        </button>
      </div>

      <div>
        <form action="/auth/signout" method="post">
          <button className="button block" type="submit">
            Sign out
          </button>
        </form>
      </div>
    </div>
  )
}