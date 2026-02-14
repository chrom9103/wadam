"use client"
import React, { useMemo, useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import * as z from "zod"
import Input from "../ui/atoms/Input"
import Button from "../ui/atoms/Button"
import FormField from "../ui/molecules/FormField"
import SplitSelector from "../ui/molecules/SplitSelector"
import { distribute } from "../../lib/distribute"
import useMembers from "../../hooks/useMembers"
import useCurrentUser from "../../hooks/useCurrentUser"

const schema = z.object({
  trip_id: z.string().min(1, "旅行を選択してください"),
  title: z.string().min(1, "タイトルは必須です"),
  amount: z.number().min(1, "金額は1以上である必要があります"),
  paid_at: z.string().optional(),
  participants: z.array(z.string()).min(1, "参加者を1人以上選択してください"),
  splitMethod: z.enum(["equal", "ratio", "fixed"]),
})

type FormSchema = z.infer<typeof schema>

export type Trip = {
  id: string
  name: string
  description?: string
}

type Props = {
  trips?: Trip[]
  tripsLoading?: boolean
  initialTripId?: string
  onSubmit?: (payload: any) => Promise<void> | void
}

export default function ExpenseForm({ trips = [], tripsLoading = false, initialTripId, onSubmit }: Props) {
  const [selectedTripId, setSelectedTripId] = useState<string>(initialTripId ?? "")
  
  // Get current user (payer is always the logged-in user due to RLS policy)
  const { user, loading: userLoading } = useCurrentUser()
  
  // Fetch members when trip is selected
  const { members, loading: membersLoading } = useMembers(selectedTripId || undefined)
  
  const { register, handleSubmit, control, watch, setValue, setError, formState: { errors } } = useForm<FormSchema>({
    defaultValues: {
      trip_id: initialTripId ?? "",
      title: "",
      amount: 0,
      paid_at: new Date().toISOString().slice(0, 10),
      participants: [],
      splitMethod: "equal",
    }
  })

  // Update form when members load
  useEffect(() => {
    if (members.length > 0) {
      setValue("participants", members.map(m => m.id))
    } else {
      setValue("participants", [])
    }
  }, [members, setValue])

  const [shareInputs, setShareInputs] = useState<Record<string, number>>({})

  // initialize shareInputs when members/participants change
  const watchParticipantsRaw = watch("participants")
  useEffect(() => {
    const parts: string[] = watchParticipantsRaw || []
    const next: Record<string, number> = { ...shareInputs }
    parts.forEach((id) => {
      if (!(id in next)) next[id] = 1
    })
    // remove stale
    Object.keys(next).forEach((k) => { if (!parts.includes(k)) delete next[k] })
    setShareInputs(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchParticipantsRaw])

  const watchAmount = watch("amount")
  const watchParticipants = watch("participants")
  const watchSplit = watch("splitMethod")

  const computedShares = useMemo(() => {
    const parts: string[] = watchParticipants || []
    let shares = parts.map((id) => ({ user_id: id, ratio: 1 }))
    if ((watchSplit as string) === "ratio") {
      shares = parts.map((id) => ({ user_id: id, ratio: shareInputs[id] ?? 1 }))
    } else if ((watchSplit as string) === "fixed") {
      shares = parts.map((id) => ({ user_id: id, fixed: shareInputs[id] ?? 0 })) as any
    }
    // payer is always the current user
    return distribute(Number(watchAmount || 0), shares as any, watchSplit as any, user?.id)
  }, [watchAmount, watchParticipants, watchSplit, user?.id, shareInputs])

  const submit = handleSubmit(async (data) => {
    // Check if user is logged in
    if (!user?.id) {
      alert("ログインしてください")
      return
    }

    // validate with zod here to avoid requiring @hookform/resolvers
    try {
      // ensure amount is a number
      const parsedInput = { ...data, amount: Number((data as any).amount) }
      schema.parse(parsedInput)
    } catch (err) {
      if (err instanceof z.ZodError) {
        err.issues.forEach((e) => {
          const key = e.path[0] as keyof FormSchema | undefined
          if (key) setError(key as keyof FormSchema, { type: 'manual', message: e.message })
        })
        return
      }
      throw err
    }

    const payload = {
      trip_id: selectedTripId,
      title: data.title,
      amount: Number(data.amount),
      paid_at: data.paid_at,
      payer_id: user.id, // Always use current user as payer (RLS policy requirement)
      shares: computedShares,
    }

    if (onSubmit) await onSubmit(payload)
    else console.log("Expense payload:", payload)
  })

  return (
    <form onSubmit={submit} className="max-w-xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h2 className="text-3xl font-semibold tracking-tight text-gray-900 mb-2">支出を追加</h2>
        <p className="text-gray-500 text-base">旅行の費用を記録しましょう</p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl p-8 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.1)]">
        {/* Trip Selection Section */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-400 mb-5">旅行を選択</h3>
          
          <FormField label="旅行" error={errors.trip_id?.message as string | null} required>
            {tripsLoading ? (
              <div className="w-full px-4 py-3.5 bg-gray-50/80 rounded-2xl animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/3" />
              </div>
            ) : trips.length === 0 ? (
              <div className="w-full px-4 py-3.5 bg-amber-50 rounded-2xl text-amber-700 text-sm">
                参加中の旅行がありません
              </div>
            ) : (
              <select
                {...register("trip_id")}
                value={selectedTripId}
                onChange={(e) => {
                  setSelectedTripId(e.target.value)
                  setValue("trip_id", e.target.value)
                }}
                className="
                  w-full px-4 py-3.5
                  bg-gray-50/80
                  border-0 rounded-2xl
                  text-gray-900
                  transition-all duration-300
                  focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:shadow-lg
                  hover:bg-gray-100/80
                  cursor-pointer
                  appearance-none
                "
              >
                <option value="">選択してください</option>
                {trips.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            )}
          </FormField>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-8" />

        {/* Basic Info Section */}
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
                    placeholder="0"
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

          {/* Payer info - read only */}
          <div className="p-4 bg-teal-50 rounded-2xl">
            <p className="text-sm text-teal-700">
              <span className="font-medium">支払者:</span>{" "}
              {userLoading ? (
                <span className="inline-block w-20 h-4 bg-teal-100 rounded animate-pulse" />
              ) : user ? (
                <span className="font-semibold">あなた</span>
              ) : (
                <span className="text-amber-600">ログインしてください</span>
              )}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-8" />

        {/* Participants Section */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-400 mb-5">参加メンバー</h3>
          
          <FormField label="" error={errors.participants ? String(errors.participants.message) : null}>
            {membersLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-4 bg-gray-50/80 rounded-2xl animate-pulse">
                    <div className="h-5 bg-gray-200 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : !selectedTripId ? (
              <div className="p-4 bg-gray-50/80 rounded-2xl text-gray-400 text-sm text-center">
                先に旅行を選択してください
              </div>
            ) : members.length === 0 ? (
              <div className="p-4 bg-amber-50 rounded-2xl text-amber-700 text-sm text-center">
                メンバーがいません
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {members.map(m => (
                <label
                  key={m.id}
                  className="
                    flex items-center gap-3 p-4
                    bg-gray-50/80 rounded-2xl
                    cursor-pointer transition-all duration-300
                    hover:bg-gray-100 hover:shadow-sm
                    has-[:checked]:bg-teal-50 has-[:checked]:shadow-[0_0_0_2px_rgba(20,184,166,0.3)]
                  "
                >
                  <input
                    type="checkbox"
                    value={m.id}
                    {...register("participants")}
                    className="
                      w-5 h-5 rounded-lg
                      border-2 border-gray-300
                      text-teal-500 focus:ring-teal-500/30
                      transition-colors
                    "
                  />
                  <span className="text-sm font-medium text-gray-700">{m.name}</span>
                </label>
              ))}
            </div>
            )}
          </FormField>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-8" />

        {/* Split Section */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-400 mb-5">分割設定</h3>
          
          <FormField label="分割方法" error={null}>
            <div className="flex gap-3">
              {[
                { value: "equal", label: "等分" },
                { value: "ratio", label: "比率" },
                { value: "fixed", label: "固定額" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="
                    flex-1 flex items-center justify-center gap-2 py-3.5
                    bg-gray-50/80 rounded-2xl
                    cursor-pointer transition-all duration-300
                    hover:bg-gray-100
                    has-[:checked]:bg-teal-500 has-[:checked]:text-white has-[:checked]:shadow-lg has-[:checked]:shadow-teal-500/25
                  "
                >
                  <input
                    type="radio"
                    value={opt.value}
                    {...register("splitMethod")}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{opt.label}</span>
                </label>
              ))}
            </div>
          </FormField>

          <SplitSelector
            participants={(watchParticipants || []).map((id: string) => ({ id, name: members.find(m => m.id === id)?.name ?? id }))}
            method={watchSplit as any}
            values={shareInputs}
            onChange={(userId, value) => setShareInputs((s) => ({ ...s, [userId]: value }))}
          />
        </div>

        {/* Computed Shares */}
        {computedShares.length > 0 && (
          <div className="p-5 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl">
            <h4 className="text-sm font-medium text-teal-700 mb-4">計算結果</h4>
            <div className="space-y-3">
              {computedShares.map(s => (
                <div key={s.user_id} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{members.find(m=>m.id===s.user_id)?.name ?? s.user_id}</span>
                  <span className="text-xl font-semibold text-gray-900">¥{s.amount_owed.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-8">
        <Button type="submit" size="lg" className="flex-1">
          保存する
        </Button>
        <Button type="button" variant="ghost" size="lg">
          キャンセル
        </Button>
      </div>
    </form>
  )
}
