"use client"
import React, { useMemo, useState } from "react"
import { useForm, FormProvider, useWatch } from "react-hook-form"
import * as z from "zod"
import Button from "../ui/atoms/Button"
import { distribute, type ShareInput } from "../../lib/distribute"
import useMembers from "../../hooks/useMembers"
import useCurrentUser from "../../hooks/useCurrentUser"
import TripSelectionSection from "./TripSelectionSection"
import BasicInfoSection from "./BasicInfoSection"
import ParticipantsSection from "./ParticipantsSection"
import SplitMethodSelector from "./SplitMethodSelector"
import SplitSelector from "../ui/molecules/SplitSelector"
import SharesSummary from "./SharesSummary"
import ReceiptUploader from "./ReceiptUploader"
import type { Share } from "../../types"

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
  title: string
  description?: string
}

type Props = {
  trips?: Trip[]
  tripsLoading?: boolean
  initialTripId?: string
  onSubmit?: (payload: {
    trip_id: string
    title: string
    amount: number
    paid_at?: string
    shares: Share[]
  }) => Promise<void> | void
}

export default function ExpenseForm({
  trips = [],
  tripsLoading = false,
  initialTripId,
  onSubmit,
}: Props) {
  const [shareInputs, setShareInputs] = useState<Record<string, number>>({})
  const [receiptPath, setReceiptPath] = useState<string | null>(null)

  const { user, loading: userLoading } = useCurrentUser()

  const methods = useForm<FormSchema>({
    defaultValues: {
      trip_id: initialTripId ?? "",
      title: "",
      amount: 0,
      paid_at: new Date().toISOString().slice(0, 10),
      participants: [],
      splitMethod: "equal",
    },
  })

  const { handleSubmit, setError, clearErrors, setValue, formState: { errors } } = methods

  const watchTripId = useWatch({ control: methods.control, name: "trip_id", defaultValue: "" })
  const watchAmount = useWatch({ control: methods.control, name: "amount", defaultValue: 0 })
  const watchParticipants = useWatch({ control: methods.control, name: "participants", defaultValue: [] })
  const watchSplit = useWatch({ control: methods.control, name: "splitMethod", defaultValue: "equal" }) as FormSchema["splitMethod"]

  const { members, loading: membersLoading } = useMembers(watchTripId || undefined)

  // Trip変更時に participants と shareInputs をリセット
  React.useEffect(() => {
    setValue("participants", [])
    setShareInputs({})
  }, [watchTripId, setValue])

  // members読み込み後に participants をセット
  React.useEffect(() => {
    if (members.length > 0) {
      setValue("participants", members.map((m) => m.id))
    }
  }, [members, setValue])

  const computedShares = useMemo(() => {
    const parts: string[] = watchParticipants || []
    let shares: ShareInput[] = parts.map((id) => ({ user_id: id, ratio: 1 }))

    if (watchSplit === "ratio") {
      shares = parts.map((id) => ({ user_id: id, ratio: shareInputs[id] ?? 1 }))
    } else if (watchSplit === "fixed") {
      shares = parts.map((id) => ({ user_id: id, fixed: shareInputs[id] ?? 0 }))
    }

    return distribute(
      Number(watchAmount || 0),
      shares,
      watchSplit,
      user?.id
    )
  }, [watchAmount, watchParticipants, watchSplit, user?.id, shareInputs])

  const submit = handleSubmit(async (data) => {
    if (!user?.id) {
      alert("ログインしてください")
      return
    }

    try {
      const parsedInput = { ...data, amount: Number(data.amount) }
      schema.parse(parsedInput)
    } catch (err) {
      if (err instanceof z.ZodError) {
        err.issues.forEach((e) => {
          const key = e.path[0] as keyof FormSchema | undefined
          if (key) {
            setError(key as keyof FormSchema, { type: "manual", message: e.message })
          }
        })
        return
      }
      throw err
    }

    const payload = {
      trip_id: data.trip_id,
      title: data.title,
      amount: Number(data.amount),
      paid_at: data.paid_at,
      shares: computedShares,
      receipt_path: receiptPath ?? undefined,
    }

    if (onSubmit) await onSubmit(payload)
    else console.log("Expense payload:", payload)
  })

  return (
    <FormProvider {...methods}>
      <form onSubmit={submit} className="max-w-xl mx-auto">
        <input type="hidden" {...methods.register("trip_id")} />

        <div className="mb-10">
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900 mb-2">
            支出を追加
          </h2>
          <p className="text-gray-500 text-base">旅行の費用を記録しましょう</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.1)]">
          <TripSelectionSection
            trips={trips}
            loading={tripsLoading}
            selectedTripId={watchTripId}
            error={errors.trip_id?.message as string | null}
            onChange={(tripId) => {
              setValue("trip_id", tripId, { shouldValidate: true, shouldDirty: true })
              clearErrors("trip_id")
            }}
          />

          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-8" />

          <BasicInfoSection user={user} userLoading={userLoading} />

          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-8" />

          <ParticipantsSection
            members={members}
            loading={membersLoading}
            selectedTripId={watchTripId}
            participants={watchParticipants || []}
            error={errors.participants?.message}
            onChange={(parts) => setValue("participants", parts)}
          />

          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-8" />

          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-400 mb-5">分割設定</h3>
            <SplitMethodSelector
              method={watchSplit as "equal" | "ratio" | "fixed"}
              onChange={(method) => methods.setValue("splitMethod", method)}
            />

            <SplitSelector
              participants={(watchParticipants || []).map((id: string) => ({
                id,
                name: members.find((m) => m.id === id)?.name ?? id,
              }))}
              method={watchSplit}
              values={shareInputs}
              onChange={(userId, value) =>
                setShareInputs((s) => ({ ...s, [userId]: value }))
              }
            />
          </div>

          <SharesSummary shares={computedShares} members={members} />

          <ReceiptUploader
            tripId={watchTripId}
            onUpload={(path) => setReceiptPath(path)}
          />
        </div>

        <div className="flex gap-4 mt-8">
          <Button type="submit" size="lg" className="flex-1">
            保存する
          </Button>
          <Button type="button" variant="ghost" size="lg">
            キャンセル
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
