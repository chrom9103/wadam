import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"
import { requireTripMember, requireUser } from "@/app/lib/api/guards"
import { apiError, apiOk } from "@/app/lib/api/response"

const createExpenseSchema = z.object({
  trip_id: z.string().min(1),
  title: z.string().min(1),
  amount: z.number().positive(),
  paid_at: z
    .preprocess((val) => {
      if (val == null || val === "") return undefined
      if (typeof val === "string") {
        // Accept plain date strings (YYYY-MM-DD) from <input type="date">
        if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
          return new Date(val).toISOString()
        }
      }
      return val
    }, z.string().datetime())
    .optional(),
  shares: z
    .array(
      z.object({
        user_id: z.string().min(1),
        amount_owed: z.number().nonnegative(),
      })
    )
    .min(1),
  itinerary_item_id: z.string().min(1).nullable().optional(),
  receipt_path: z.string().min(1).optional(),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const userResult = await requireUser(supabase)
  if (!userResult.ok) {
    return userResult.response
  }

  const body = await req.json().catch(() => null)
  const parsed = createExpenseSchema.safeParse(body)
  if (!parsed.success) {
    return apiError("INVALID_REQUEST", "Invalid request payload", 400)
  }

  const { trip_id, title, amount, paid_at, shares, itinerary_item_id, receipt_path } = parsed.data

  const memberResult = await requireTripMember(supabase, userResult.data.id, trip_id)
  if (!memberResult.ok) {
    return memberResult.response
  }

  const { data: expense, error: expenseError } = await supabase
    .from("expenses")
    .insert({
      trip_id,
      title,
      amount,
      paid_at,
      payer_id: userResult.data.id,
      itinerary_item_id: itinerary_item_id ?? null,
    })
    .select("id")
    .single()

  if (expenseError) {
    return apiError("INTERNAL", expenseError.message, 500)
  }

  const { error: sharesError } = await supabase.from("expense_shares").insert(
    shares.map((s) => ({
      expense_id: expense.id,
      user_id: s.user_id,
      amount_owed: s.amount_owed,
    }))
  )

  if (sharesError) {
    return apiError("INTERNAL", sharesError.message, 500)
  }

  if (receipt_path) {
    const { error: receiptError } = await supabase.from("receipts").insert({
      expense_id: expense.id,
      storage_path: receipt_path,
    })

    if (receiptError) {
      return apiError("INTERNAL", receiptError.message, 500)
    }
  }

  return apiOk({ id: expense.id })
}