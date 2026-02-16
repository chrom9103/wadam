"use client"
import React, { useEffect, useState, useId } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"

type Props = {
  tripId?: string | null
  onUpload: (storagePath: string) => void
}

export default function ReceiptUploader({ tripId, onUpload }: Props) {
  const supabase = createClient()
  const inputId = useId()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const uploadReceipt: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    try {
      setUploading(true)

      if (!tripId) {
        throw new Error("旅行を選択してください。")
      }

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("ファイルが選択されていません。")
      }

      const file = event.target.files[0]
      const maxSizeBytes = 5 * 1024 * 1024
      const allowedExt = ["png", "jpg", "jpeg", "gif", "webp"]

      const fileExt = file.name.split(".").pop()?.toLowerCase()
      if (!fileExt || !allowedExt.includes(fileExt)) {
        throw new Error("未対応のファイル形式です。")
      }
      if (!file.type.startsWith("image/")) {
        throw new Error("画像ファイルではありません。")
      }
      if (file.size > maxSizeBytes) {
        throw new Error("ファイルサイズが大きすぎます。")
      }

      const safeName = file.name.replace(/[^\w.\-]/g, "_")
      const filePath = `${tripId}/${crypto.randomUUID()}-${safeName}`

      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(filePath, file, { upsert: false, contentType: file.type })

      if (uploadError) throw uploadError

      const localUrl = URL.createObjectURL(file)
      setPreviewUrl(localUrl)
      onUpload(filePath)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      console.error("Receipt upload error:", error)
      alert(`Error uploading receipt: ${message}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mt-6">
      <p className="text-sm font-medium text-gray-400 mb-3">レシート画像（任意）</p>

      <div className="flex items-center gap-4">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Receipt preview"
            width={120}
            height={120}
            className="rounded-xl object-cover"
          />
        ) : (
          <div className="w-[120px] h-[120px] rounded-xl bg-gray-100" />
        )}

        <div>
          <label
            htmlFor={inputId}
            className="px-4 py-2 rounded-xl bg-teal-500 text-white text-sm cursor-pointer"
          >
            {uploading ? "Uploading..." : "Upload"}
          </label>
          <input
            id={inputId}
            type="file"
            accept="image/*"
            onChange={uploadReceipt}
            disabled={uploading}
            className="hidden"
          />
        </div>
      </div>
    </div>
  )
}