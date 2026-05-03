import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useEvents } from '@/hooks/useEvents'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Calendar, MapPin } from 'lucide-react'
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

export default function EventsList() {
  const { user, profile, loading: authLoading } = useAuth()
  const { events, loading: eventsLoading, error } = useEvents(profile?.role === 'organizer' ? user?.id : undefined)
  const isOrganizer = profile?.role === 'organizer'

  if (error) {
    return <div className="text-destructive">Error: {error}</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">
            {isOrganizer ? 'Manage your events' : 'Browse all available events'}
          </p>
        </div>
        {isOrganizer && (
          <Link to="/events/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </Link>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventsLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32 mt-2" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))
        ) : events.length === 0 ? (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>No events found</CardTitle>
              <CardDescription>
                {isOrganizer ? 'Create your first event to get started' : 'Check back later for new events'}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          events.map((event) => (
            <Link key={event.id} to={`/events/${event.id}`}>
              <Card className="hover:shadow-lg transition-shadow h-full">
                {event.image_url && (
                  <div className="h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getCategoryColor(event.category)}>
                      {categories.find((c) => c.value === event.category)?.label}
                    </Badge>
                    {isOrganizer && (
                      <Badge variant={event.is_published ? 'default' : 'secondary'}>
                        {event.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDateTime(event.date)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {event.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
