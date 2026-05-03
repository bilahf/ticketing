import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useEvent } from '@/hooks/useEvents'
import { useTicketTiers } from '@/hooks/useTicketTiers'
import { useOrders } from '@/hooks/useOrders'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Edit, Plus, Calendar, MapPin, CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { EventCategory } from '@/types'

const categories: { value: EventCategory; label: string }[] = [
  { value: 'MUSIC', label: 'Music' },
  { value: 'SPORTS', label: 'Sports' },
  { value: 'CONFERENCE', label: 'Conference' },
  { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'OTHER', label: 'Other' },
]

const getCategoryColor = (category: EventCategory) => {
  switch (category) {
    case 'MUSIC':
      return 'bg-pink-100 text-pink-800'
    case 'SPORTS':
      return 'bg-blue-100 text-blue-800'
    case 'CONFERENCE':
      return 'bg-purple-100 text-purple-800'
    case 'WORKSHOP':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>()
  const { user, profile } = useAuth()
  const { event, loading: eventLoading, error: eventError } = useEvent(eventId)
  const { ticketTiers, loading: tiersLoading, error: tiersError } = useTicketTiers(eventId)
  const { orders, loading: ordersLoading, refetch: refetchOrders } = useOrders(
    profile?.role === 'organizer' ? '' : user?.id || ''
  )
  const navigate = useNavigate()

  const [selectedTier, setSelectedTier] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [buying, setBuying] = useState(false)
  const [addingTier, setAddingTier] = useState(false)
  const [confirming, setConfirming] = useState<string | null>(null)
  const [newTier, setNewTier] = useState({ name: '', price: '', quantity: '' })

  const isOrganizer = profile?.role === 'organizer' && event?.organizer_id === user?.id
  const isAttendee = profile?.role === 'attendee'

  const organizerOrders = isOrganizer
    ? (orders as any[]).filter((o: any) => o.event_id === eventId)
    : []

  const handleBuyTicket = async () => {
    if (!user || !selectedTier || !eventId) return
    setBuying(true)

    try {
      const tier = ticketTiers.find(t => t.id === selectedTier)
      if (!tier) throw new Error('Invalid ticket tier')

      const totalPrice = tier.price * quantity

      const { error: orderError } = await supabase.from('orders').insert({
        user_id: user.id,
        event_id: eventId,
        ticket_tier_id: selectedTier,
        quantity,
        total_price: totalPrice,
        status: 'pending',
      })
      if (orderError) throw orderError

      toast.success('Order placed! Wait for organizer confirmation.')
      navigate('/tickets')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setBuying(false)
    }
  }

  const handleAddTier = async () => {
    if (!eventId) return
    setAddingTier(true)
    try {
      const { error } = await supabase.from('ticket_tiers').insert({
        event_id: eventId,
        name: newTier.name,
        price: parseFloat(newTier.price),
        quantity: parseInt(newTier.quantity),
        sold: 0,
      })
      if (error) throw error
      setNewTier({ name: '', price: '', quantity: '' })
      toast.success('Ticket tier added!')
      window.location.reload()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setAddingTier(false)
    }
  }

  const handlePublish = async () => {
    if (!eventId) return
    await supabase.from('events').update({ is_published: !event?.is_published }).eq('id', eventId)
    toast.success(event?.is_published ? 'Event unpublished' : 'Event published')
    window.location.reload()
  }

  const handleConfirmPayment = async (orderId: string, ticketTierId: string, qty: number) => {
    setConfirming(orderId)
    try {
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', orderId)
      if (orderError) throw orderError

      const { error: tierError } = await supabase.rpc('increment_ticket_sold', {
        tier_id: ticketTierId,
        increment_amount: qty
      })
      if (tierError) throw tierError

      toast.success('Payment confirmed!')
      refetchOrders()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setConfirming(null)
    }
  }

  if (eventError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-destructive text-lg font-semibold">{eventError}</p>
          <Link to="/">
            <Button className="mt-4">Back to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!eventLoading && !event) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground text-lg font-semibold">Event not found</p>
          <Link to="/">
            <Button className="mt-4">Back to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          {eventLoading ? (
            <>
              <Skeleton className="h-10 w-80" />
              <Skeleton className="h-5 w-64 mt-2" />
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-2">{event?.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                <Badge className={getCategoryColor(event?.category || 'OTHER')}>
                  {categories.find((c) => c.value === event?.category)?.label}
                </Badge>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {event && formatDateTime(event.date)}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {event?.location}
                </div>
                {isOrganizer && event && (
                  <Badge variant={event.is_published ? 'default' : 'secondary'}>
                    {event.is_published ? 'Published' : 'Draft'}
                  </Badge>
                )}
              </div>
            </>
          )}
        </div>
        {isOrganizer && eventId && (
          <div className="flex gap-2">
            <Link to={`/events/${eventId}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            {!eventLoading && event && (
              <Button onClick={handlePublish}>
                {event.is_published ? 'Unpublish' : 'Publish'}
              </Button>
            )}
          </div>
        )}
      </div>

      {!eventLoading && event?.image_url && (
        <div className="mb-8 rounded-lg overflow-hidden border">
          <img src={event.image_url} alt={event.title} className="w-full h-96 object-cover" />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>About this Event</CardTitle>
            </CardHeader>
            <CardContent>
              {eventLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              ) : (
                <p className="text-muted-foreground">{event?.description}</p>
              )}
            </CardContent>
          </Card>

          {isOrganizer && (
            <Card>
              <CardHeader>
                <CardTitle>Orders</CardTitle>
                <CardDescription>Manage and confirm ticket orders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {ordersLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48 mt-1" />
                    </div>
                  ))
                ) : organizerOrders.length === 0 ? (
                  <p className="text-muted-foreground">No orders yet</p>
                ) : (
                  organizerOrders.map((order: any) => (
                    <div key={order.id} className="border rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.quantity}x {order.ticket_tiers?.name} - ${order.total_price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge
                          variant={
                            order.status === 'completed'
                              ? 'default'
                              : order.status === 'pending'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {order.status}
                        </Badge>
                        {order.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleConfirmPayment(order.id, order.ticket_tier_id, order.quantity)
                            }
                            disabled={confirming === order.id}
                          >
                            {confirming === order.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Confirm
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {isOrganizer ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Ticket Tiers</CardTitle>
                  <CardDescription>Manage your ticket tiers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tiersLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-20 mt-1" />
                      </div>
                    ))
                  ) : (
                    ticketTiers.map((tier) => (
                      <div key={tier.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{tier.name}</p>
                            <p className="text-sm text-muted-foreground">${tier.price.toFixed(2)}</p>
                          </div>
                          <Badge variant="secondary">{tier.sold} / {tier.quantity} sold</Badge>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Add Ticket Tier</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="tierName">Name</Label>
                    <Input id="tierName" value={newTier.name} onChange={(e) => setNewTier({ ...newTier, name: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="tierPrice">Price</Label>
                    <Input id="tierPrice" type="number" value={newTier.price} onChange={(e) => setNewTier({ ...newTier, price: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="tierQuantity">Quantity</Label>
                    <Input id="tierQuantity" type="number" value={newTier.quantity} onChange={(e) => setNewTier({ ...newTier, quantity: e.target.value })} />
                  </div>
                  <Button onClick={handleAddTier} disabled={addingTier || !eventId} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    {addingTier ? 'Adding...' : 'Add Tier'}
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Buy Tickets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!user ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">Login to purchase tickets</p>
                    <Link to="/signin">
                      <Button>Login</Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="tier">Ticket Tier</Label>
                      {tiersLoading ? (
                        <Skeleton className="h-10 w-full" />
                      ) : (
                        <Select id="tier" value={selectedTier} onChange={(e) => setSelectedTier(e.target.value)}>
                          <option value="">Select a tier</option>
                          {ticketTiers.filter(t => t.sold < t.quantity).map((tier) => (
                            <option key={tier.id} value={tier.id}>
                              {tier.name} - ${tier.price.toFixed(2)} ({tier.quantity - tier.sold} left)
                            </option>
                          ))}
                        </Select>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input id="quantity" type="number" min="1" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} />
                    </div>
                    {selectedTier && (
                      <div className="border-t pt-4">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold">
                          ${(ticketTiers.find(t => t.id === selectedTier)?.price || 0) * quantity}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
              {user && (
                <CardFooter>
                  <Button onClick={handleBuyTicket} disabled={!selectedTier || buying || !eventId} className="w-full">
                    {buying ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Buy Tickets'
                    )}
                  </Button>
                </CardFooter>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
