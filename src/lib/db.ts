import { supabase } from './supabase'

const db = () => {
  if (!supabase) throw new Error('Supabase not configured')
  return supabase as any
}

export async function insert<T extends Record<string, any>>(table: string, row: T): Promise<T> {
  const { data, error } = await db().from(table).upsert(row, { onConflict: 'id' }).select().single()
  if (error) { console.error(`DB insert error [${table}]:`, error); throw error }
  return data
}

export async function insertMany<T extends Record<string, any>>(table: string, rows: T[]): Promise<T[]> {
  const { data, error } = await db().from(table).upsert(rows, { onConflict: 'id' }).select()
  if (error) { console.error(`DB insertMany error [${table}]:`, error); throw error }
  return data || []
}

export async function update(table: string, id: string, patch: Record<string, any>) {
  const { error } = await db().from(table).update(patch).eq('id', id)
  if (error) { console.error(`DB update error [${table}]:`, error); throw error }
}

export async function remove(table: string, id: string) {
  const { error } = await db().from(table).delete().eq('id', id)
  if (error) { console.error(`DB remove error [${table}]:`, error); throw error }
}

export async function removeWhere(table: string, col: string, value: string) {
  const { error } = await db().from(table).delete().eq(col, value)
  if (error) { console.error(`DB removeWhere error [${table}]:`, error); throw error }
}

export async function query<T>(
  table: string,
  filters?: Record<string, any>,
  order?: { col: string; asc: boolean },
): Promise<T[]> {
  let q = db().from(table).select()
  if (filters) for (const [k, v] of Object.entries(filters)) q = q.eq(k, v)
  if (order) q = q.order(order.col, { ascending: order.asc })
  const { data, error } = await q
  if (error) { console.error(`DB query error [${table}]:`, error); throw error }
  return data || []
}
