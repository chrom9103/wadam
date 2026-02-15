export async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init)

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    const message = text || `HTTP ${res.status}`
    throw new Error(message)
  }

  return (await res.json()) as T
}