'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { getSignedDownloadUrl, uploadAvatar as uploadAvatarApi } from '@/app/lib/api/client'

export default function Avatar({
  uid,
  url,
  size,
  onUpload,
}: {
  uid: string | null
  url: string | null
  size: number
  onUpload: (url: string) => void
}) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(url)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    async function resolveImage(path: string) {
      try {
        const signedUrl = await getSignedDownloadUrl('avatars', path)
        setAvatarUrl(signedUrl)
      } catch (error) {
        console.log('Error downloading image: ', error)
      }
    }

    if (url) {
        if (url.startsWith("http")){
            setAvatarUrl(url)
        }else{
        resolveImage(url)
        }
    }
    }, [url])

  const uploadAvatar: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    try {
      setUploading(true)

      if (!uid) {
        throw new Error('Not authenticated.')
      }

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const maxSizeBytes = 2 * 1024 * 1024 // 2MB
      const allowedExt = ['png', 'jpg', 'jpeg', 'gif', 'webp']

      const fileExt = file.name.split('.').pop()?.toLowerCase()
      if (!fileExt || !allowedExt.includes(fileExt)) {
        throw new Error('Unsupported file type.')
      }
      if (!file.type.startsWith('image/')) {
        throw new Error('Invalid mime type.')
      }
      if (file.size > maxSizeBytes) {
        throw new Error('File too large.')
      }

      const filePath = `${uid}/${crypto.randomUUID()}.${fileExt}`
      const uploaded = await uploadAvatarApi(file)
      onUpload(uploaded.path || filePath)
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Error uploading avatar!')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      {avatarUrl ? (
        <Image
          width={size}
          height={size}
          src={avatarUrl}
          alt="Avatar"
          className="avatar image"
          style={{ height: size, width: size }}
        />
      ) : (
        <div className="avatar no-image" style={{ height: size, width: size }} />
      )}
      <div style={{ width: size }}>
        <label className="button primary block" htmlFor="single">
          {uploading ? 'Uploading ...' : 'Upload'}
        </label>
        <input
          style={{
            visibility: 'hidden',
            position: 'absolute',
          }}
          type="file"
          id="single"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
        />
      </div>
    </div>
  )
}