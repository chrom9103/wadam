"use client"
import React from "react"
import { Controller, useFormContext } from "react-hook-form"
import Input from "../ui/atoms/Input"
import FormField from "../ui/molecules/FormField"
import PayerInfo from "./PayerInfo"
import type { CurrentUser } from "@/app/lib/api/client"

type Props = {
  user: CurrentUser | null
  userLoading: boolean
}

export default function BasicInfoSection({ user, userLoading }: Props) {
  const { register, control, formState: { errors } } = useFormContext()

  return (
    <div className="mb-8">
      <h3 className="text-sm font-medium text-gray-400 mb-5">基本情報</h3>

      <FormField label="タイトル" error={errors.title?.message as string | null} required>
        <Input {...register("title")} placeholder="例: 夕食、交通費など" />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="金額" error={errors.amount?.message as string | null} required>
          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </FormField>

        <FormField label="支払日" error={null}>
          <Input {...register("paid_at")} type="date" />
        </FormField>
      </div>

      <PayerInfo user={user} loading={userLoading} />
    </div>
  )
}