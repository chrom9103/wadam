import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const body = await req.json()

  const {
    trip_id,
    title,
    amount,
    paid_at,
    shares,
    itinerary_item_id,
    receipt_path,
  }: {
    trip_id: string
    title: string
    amount: number
    paid_at?: string
    shares: { user_id: string; amount_owed: number }[]
    itinerary_item_id?: string | null
    receipt_path?: string
  } = body

  if (!trip_id || !title || !amount || !Array.isArray(shares)) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 })
  }

  const { data: expense, error: expenseError } = await supabase
    .from("expenses")
    .insert({
      trip_id,
      title,
      amount,
      paid_at,
      payer_id: user.id,
      itinerary_item_id: itinerary_item_id ?? null,
    })
    .select("id")
    .single()

  if (expenseError) {
    return NextResponse.json({ error: expenseError.message }, { status: 500 })
  }

  const { error: sharesError } = await supabase.from("expense_shares").insert(
    shares.map((s) => ({
      expense_id: expense.id,
      user_id: s.user_id,
      amount_owed: s.amount_owed,
    }))
  )

  if (sharesError) {
    return NextResponse.json({ error: sharesError.message }, { status: 500 })
  }

  if (receipt_path) {
    const { error: receiptError } = await supabase.from("receipts").insert({
      expense_id: expense.id,
      storage_path: receipt_path,
    })

    if (receiptError) {
      return NextResponse.json({ error: receiptError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ id: expense.id })
}