"use client"
import React, { useMemo, useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import * as z from "zod"
import Input from "../ui/atoms/Input"
import Button from "../ui/atoms/Button"
import FormField from "../ui/molecules/FormField"
import SplitSelector from "../ui/molecules/SplitSelector"
import { distribute } from "../../lib/distribute"

const schema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  amount: z.number().min(1, "金額は1以上である必要があります"),
  paid_at: z.string().optional(),
  payer_id: z.string().min(1, "支払者を選択してください"),
  participants: z.array(z.string()).min(1, "参加者を1人以上選択してください"),
  splitMethod: z.enum(["equal", "ratio", "fixed"]),
})

type FormSchema = z.infer<typeof schema>

type Props = {
  tripId: string
  members?: { id: string; name: string }[]
  onSubmit?: (payload: any) => Promise<void> | void
}

export default function ExpenseForm({ tripId, members = [], onSubmit }: Props) {
  const { register, handleSubmit, control, watch, setError, formState: { errors } } = useForm<FormSchema>({
    defaultValues: {
      title: "",
      amount: 0,
      paid_at: new Date().toISOString().slice(0, 10),
      payer_id: members[0]?.id ?? "",
      participants: members.length ? members.map(m => m.id) : [],
      splitMethod: "equal",
    }
  })

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
  const watchPayer = watch("payer_id")

  const computedShares = useMemo(() => {
    const parts: string[] = watchParticipants || []
    let shares = parts.map((id) => ({ user_id: id, ratio: 1 }))
    if ((watchSplit as string) === "ratio") {
      shares = parts.map((id) => ({ user_id: id, ratio: shareInputs[id] ?? 1 }))
    } else if ((watchSplit as string) === "fixed") {
      shares = parts.map((id) => ({ user_id: id, fixed: shareInputs[id] ?? 0 })) as any
    }
    return distribute(Number(watchAmount || 0), shares as any, watchSplit as any, watchPayer)
  }, [watchAmount, watchParticipants, watchSplit, watchPayer, shareInputs])

  const submit = handleSubmit(async (data) => {
    // validate with zod here to avoid requiring @hookform/resolvers
    try {
      // ensure amount is a number
      const parsedInput = { ...data, amount: Number((data as any).amount) }
      schema.parse(parsedInput)
    } catch (err) {
      if (err instanceof z.ZodError) {
        err.errors.forEach(e => {
          const key = e.path[0] as keyof FormSchema | undefined
          if (key) setError(key as any, { type: 'manual', message: e.message })
        })
        return
      }
      throw err
    }

    const payload = {
      trip_id: tripId,
      title: data.title,
      amount: Number(data.amount),
      paid_at: data.paid_at,
      payer_id: data.payer_id,
      shares: computedShares,
    }

    if (onSubmit) await onSubmit(payload)
    else console.log("Expense payload:", payload)
  })

  return (
    <form onSubmit={submit} className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">支出を追加</h2>

      <FormField label="タイトル" error={errors.title?.message as string | null}>
        <Input {...register("title")} />
      </FormField>

      <FormField label="金額" error={errors.amount?.message as string | null}>
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
          )}
        />
      </FormField>

      <FormField label="支払日" error={null}>
        <Input {...register("paid_at")} type="date" />
      </FormField>

      <FormField label="支払者" error={errors.payer_id?.message as string | null}>
        <select {...register("payer_id")} className="border px-3 py-2 rounded-md w-full">
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </FormField>

      <FormField label="参加メンバー" error={errors.participants ? String(errors.participants.message) : null}>
        <div className="grid grid-cols-2 gap-2">
          {members.map(m => (
            <label key={m.id} className="inline-flex items-center gap-2">
              <input type="checkbox" value={m.id} {...register("participants")} />
              <span>{m.name}</span>
            </label>
          ))}
        </div>
      </FormField>

      <FormField label="分割方法" error={null}>
        <div className="flex gap-3 items-center">
          <label className="inline-flex items-center gap-2"><input type="radio" value="equal" {...register("splitMethod")} defaultChecked /> 等分</label>
          <label className="inline-flex items-center gap-2"><input type="radio" value="ratio" {...register("splitMethod")} /> 比率</label>
          <label className="inline-flex items-center gap-2"><input type="radio" value="fixed" {...register("splitMethod")} /> 固定額</label>
        </div>
      </FormField>

      <SplitSelector
        participants={(watchParticipants || []).map((id: string) => ({ id, name: members.find(m => m.id === id)?.name ?? id }))}
        method={watchSplit as any}
        values={shareInputs}
        onChange={(userId, value) => setShareInputs((s) => ({ ...s, [userId]: value }))}
      />

      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">自動計算された負担額</h3>
        <ul>
          {computedShares.map(s => (
            <li key={s.user_id} className="flex justify-between border-b py-1">
              <span>{members.find(m=>m.id===s.user_id)?.name ?? s.user_id}</span>
              <span>¥{s.amount_owed}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-2">
        <Button type="submit">保存</Button>
        <Button type="button" variant="ghost">キャンセル</Button>
      </div>
    </form>
  )
}
