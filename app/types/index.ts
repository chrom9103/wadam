export type Trip = {
  id: string
  title: string
  start_date?: string
  end_date?: string
}

export type Member = {
  id: string
  name: string
  avatar_url?: string | null
}

export type Share = {
  user_id: string
  amount_owed: number
}