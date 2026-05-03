import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Order } from '@/types'

export function useOrders(userId: string) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    if (!userId && userId !== '') {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('orders')
        .select('*, events(*), ticket_tiers(*), profiles!inner(email)')

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query.order('created_at', { ascending: false })
      if (error) throw error
      setOrders(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return { orders, loading, error, refetch: fetchOrders }
}
