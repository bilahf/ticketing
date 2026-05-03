export type EventCategory = 'MUSIC' | 'SPORTS' | 'CONFERENCE' | 'WORKSHOP' | 'OTHER'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: 'organizer' | 'attendee'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          role: 'organizer' | 'attendee'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'organizer' | 'attendee'
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          organizer_id: string
          title: string
          description: string
          date: string
          location: string
          image_url?: string
          category: EventCategory
          is_published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          organizer_id: string
          title: string
          description: string
          date: string
          location: string
          image_url?: string
          category?: EventCategory
          is_published?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          organizer_id?: string
          title?: string
          description?: string
          date?: string
          location?: string
          image_url?: string
          category?: EventCategory
          is_published?: boolean
          created_at?: string
        }
      }
      ticket_tiers: {
        Row: {
          id: string
          event_id: string
          name: string
          price: number
          quantity: number
          sold: number
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          price: number
          quantity: number
          sold?: number
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          price?: number
          quantity?: number
          sold?: number
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          event_id: string
          ticket_tier_id: string
          quantity: number
          total_price: number
          status: 'pending' | 'completed' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_id: string
          ticket_tier_id: string
          quantity: number
          total_price: number
          status?: 'pending' | 'completed' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_id?: string
          ticket_tier_id?: string
          quantity?: number
          total_price?: number
          status?: 'pending' | 'completed' | 'cancelled'
          created_at?: string
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Event = Database['public']['Tables']['events']['Row']
export type TicketTier = Database['public']['Tables']['ticket_tiers']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
