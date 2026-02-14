"use client"
import React from "react"
import ExpenseForm from "../../../../components/expense/ExpenseForm"

type Props = {
  params: { trip: string }
}

// simple members stub. Replace with real data fetch in integration.
const sampleMembers = [
  { id: "u1", name: "Alice" },
  { id: "u2", name: "Bob" },
  { id: "u3", name: "Charlie" },
]

export default function ExpenseNewPage({ params }: Props) {
  return (
    <div className="p-4">
      <ExpenseForm tripId={params.trip} members={sampleMembers} onSubmit={(p)=>console.log(p)} />
    </div>
  )
}
