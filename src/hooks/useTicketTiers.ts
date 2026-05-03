import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { TicketTier } from '@/types'

export function useTicketTiers(eventId: string | undefined) {
  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTicketTiers = async () => {
      if (!eventId) {
        setLoading(false)
        setError('Event ID is required')
        return
      }

      setLoading(true)
      setError(null)

      try {
        const { data, error } = await supabase
          .from('ticket_tiers')
          .select('*')
          .eq('event_id', eventId)
        if (error) throw error
        setTicketTiers(data || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTicketTiers()
  }, [eventId])

  return { ticketTiers, loading, error }
}
