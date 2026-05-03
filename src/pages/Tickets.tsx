import { useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useOrders } from '@/hooks/useOrders'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { QRCodeSVG } from 'qrcode.react'
import { Download, Ticket as TicketIcon } from 'lucide-react'
import { toPng } from 'html-to-image'

export default function Tickets() {
  const { user, loading: authLoading } = useAuth()
  const { orders, loading: ordersLoading, error } = useOrders(user?.id || '')
  const qrRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  const downloadQR = async (orderId: string) => {
    const element = qrRefs.current[orderId]
    if (!element) return

    try {
      const dataUrl = await toPng(element, { quality: 1.0 })
      const link = document.createElement('a')
      link.download = `ticket-${orderId}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Failed to download QR code', err)
    }
  }

  if (error) {
    return <div className="text-destructive">Error: {error}</div>
  }

  const completedOrders = (orders as any[]).filter((order) => order.status === 'completed')

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Tickets</h1>
        <p className="text-muted-foreground">View and manage your purchased tickets</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {ordersLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-40 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))
        ) : completedOrders.length === 0 ? (
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>No tickets yet</CardTitle>
              <CardDescription>Browse events and buy your first ticket</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          completedOrders.map((order: any) => {
            const qrData = JSON.stringify({
              eventTitle: order.events?.title,
              date: order.events?.date,
              location: order.events?.location,
              userName: order.profiles?.email,
              ticketTier: order.ticket_tiers?.name,
              quantity: order.quantity,
              bookingCode: order.id,
            })

            return (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <TicketIcon className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle>{order.events?.title}</CardTitle>
                      <CardDescription>
                        {new Date(order.events?.date).toLocaleDateString()} • {order.events?.location}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{order.ticket_tiers?.name}</p>
                      <p className="text-sm text-muted-foreground">Quantity: {order.quantity}</p>
                    </div>
                    <p className="text-lg font-bold">${order.total_price.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-center bg-white p-4 rounded-lg border" ref={(el) => (qrRefs.current[order.id] = el)}>
                    <div className="text-center">
                      <QRCodeSVG value={qrData} size={150} level="H" />
                      <p className="text-xs text-muted-foreground mt-2">{order.id.slice(0, 8)}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => downloadQR(order.id)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Ticket
                  </Button>
                </CardFooter>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
