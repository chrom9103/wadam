"use client"
import React from "react"
import Button from "../../../../components/ui/atoms/Button"
import Input from "../../../../components/ui/atoms/Input"

type Props = {
  params: { trip: string }
}

export default function ExpenseNewPage({ params }: Props) {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">支出を追加</h1>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-sm font-medium mb-1">タイトル</label>
          <Input name="title" placeholder="例：夕食" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">金額</label>
          <Input name="amount" type="number" placeholder="0" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">支払者</label>
          <Input name="payer" placeholder="支払者名" />
        </div>

        <div className="flex gap-2">
          <Button type="submit">保存</Button>
          <Button type="button" variant="ghost">キャンセル</Button>
        </div>
      </form>
    </div>
  )
}
