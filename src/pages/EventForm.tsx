import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useEvent } from '@/hooks/useEvents'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { EventCategory } from '@/types'

const categories: { value: EventCategory; label: string }[] = [
  { value: 'MUSIC', label: 'Music' },
  { value: 'SPORTS', label: 'Sports' },
  { value: 'CONFERENCE', label: 'Conference' },
  { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'OTHER', label: 'Other' },
]

export default function EventForm() {
  const { user } = useAuth()
  const { eventId } = useParams<{ eventId?: string }>()
  const { event, loading: eventLoading, error: eventError } = useEvent(eventId)
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEditMode = !!eventId

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    image_url: '',
    category: 'OTHER' as EventCategory,
    is_published: false,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (event && isEditMode) {
      const date = new Date(event.date)
      const dateStr = date.toISOString().split('T')[0]
      const timeStr = date.toTimeString().slice(0, 5)

      setFormData({
        title: event.title,
        description: event.description,
        date: dateStr,
        time: timeStr,
        location: event.location,
        image_url: event.image_url || '',
        category: event.category || 'OTHER',
        is_published: event.is_published,
      })
      if (event.image_url) {
        setImagePreview(event.image_url)
      }
    }
  }, [event, isEditMode])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setFormData({ ...formData, image_url: '' })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadImage = async () => {
    if (!imageFile) return formData.image_url

    setUploadingImage(true)

    const fileName = `${Date.now()}-${imageFile.name}`
    const { error } = await supabase.storage
      .from('event-images')
      .upload(fileName, imageFile)

    if (error) throw error

    const { data } = supabase.storage
      .from('event-images')
      .getPublicUrl(fileName)

    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)

    try {
      const imageUrl = await uploadImage()

      const dateTime = new Date(`${formData.date}T${formData.time}`).toISOString()

      const { time, ...eventData } = formData

      if (isEditMode && eventId) {
        const { error } = await supabase
          .from('events')
          .update({
            ...eventData,
            image_url: imageUrl,
            date: dateTime,
          })
          .eq('id', eventId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('events')
          .insert({
            ...eventData,
            organizer_id: user.id,
            image_url: imageUrl,
            date: dateTime,
          })
        if (error) throw error
      }

      toast.success(isEditMode ? 'Event updated!' : 'Event created!')
      navigate('/events')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setUploadingImage(false)
      setLoading(false)
    }
  }

  if (isEditMode && eventError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-destructive text-lg font-semibold">{eventError}</p>
          <Link to="/events">
            <Button className="mt-4">Back to Events</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (isEditMode && eventLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{isEditMode ? 'Edit Event' : 'Create Event'}</h1>
        <p className="text-muted-foreground">
          {isEditMode ? 'Update your event details' : 'Create a new event to sell tickets'}
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>Fill in the information for your event</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as EventCategory })}
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="imageUpload">Event Image</Label>
              <input
                id="imageUpload"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="sr-only"
              />
              {imagePreview ? (
                <div className="relative mt-2">
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg border" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="mt-2 border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <label
                    htmlFor="imageUpload"
                    className="inline-flex cursor-pointer items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    Upload Image
                  </label>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_published"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              />
              <Label htmlFor="is_published">Publish event</Label>
            </div>
            <div className="flex gap-4">
              <Button type="submit" disabled={loading || uploadingImage}>
                {(loading || uploadingImage) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {uploadingImage ? 'Uploading...' : loading ? 'Saving...' : (isEditMode ? 'Update Event' : 'Create Event')}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/events')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
