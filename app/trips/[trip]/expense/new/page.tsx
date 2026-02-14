"use client"
import React from "react"
import ExpenseForm from "../../../../components/expense/ExpenseForm"
import useMembers from "../../../../hooks/useMembers"
import useCreateExpense from "../../../../hooks/useCreateExpense"

type Props = {
  params: { trip: string }
}

export default function ExpenseNewPage({ params }: Props) {
  const { members, loading, error } = useMembers(params.trip)
  const { createExpense, loading: creating } = useCreateExpense()

  return (
    <div className="p-4">
      {loading ? (
        <p>メンバーを読み込み中...</p>
      ) : error ? (
        <p className="text-red-600">メンバーの取得に失敗しました: {error}</p>
      ) : (
        <ExpenseForm
          tripId={params.trip}
          members={members}
          onSubmit={async (p) => {
            try {
              await createExpense(p)
              // simple success feedback
              alert("支出を作成しました")
            } catch (err: any) {
              alert("作成に失敗しました: " + (err?.message ?? String(err)))
            }
          }}
        />
      )}
    </div>
  )
}
