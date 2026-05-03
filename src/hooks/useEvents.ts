import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Event } from '@/types'

export function useEvents(organizerId?: string) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase.from('events').select('*')

      if (organizerId) {
        query = query.eq('organizer_id', organizerId)
      } else {
        query = query.eq('is_published', true)
      }

      const { data, error } = await query.order('date', { ascending: true })
      if (error) throw error
      setEvents(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [organizerId])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  return { events, loading, error, refetch: fetchEvents }
}

export function useEvent(eventId: string | undefined) {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) {
        setLoading(false)
        setError(null)
        setEvent(null)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single()
        
        if (error) throw error
        setEvent(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [eventId])

  return { event, loading, error }
}
