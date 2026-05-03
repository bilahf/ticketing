# Nextix - Ticketing Platform

A modern, full-stack ticketing platform built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

### For Organizers
- Create, edit, and publish events
- Manage ticket tiers
- View and confirm orders
- Upload event images

### For Attendees
- Browse events without logging in
- Search and filter events by category
- Purchase tickets
- View and download tickets with QR codes

### General
- Email/password authentication with Supabase Auth
- Responsive design
- Real-time updates
- Toast notifications

## Tech Stack

- **Frontend**: React (Vite) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Auth, Database, Storage)
- **Other**: React Router, Sonner (toasts), QRCode.react, html-to-image

## Setup Instructions

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
Create a `.env` file in the root directory with:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set up Supabase
1. Create a new Supabase project at https://supabase.com
2. Open the SQL Editor and run the SQL from `supabase-setup.sql`
3. Create a storage bucket named "event-images" (already in the SQL)

### 4. Run the development server
```bash
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous public key |

## Folder Structure

```
ticketing/
├── src/
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── badge.tsx
│   │   │   └── skeleton.tsx
│   │   ├── Layout.tsx         # Protected layout
│   │   └── PublicLayout.tsx   # Public layout
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useEvents.ts
│   │   ├── useTicketTiers.ts
│   │   └── useOrders.ts
│   ├── lib/
│   │   ├── supabase.ts        # Supabase client
│   │   └── utils.ts           # Utility functions
│   ├── pages/
│   │   ├── Home.tsx           # Landing page with events
│   │   ├── SignIn.tsx
│   │   ├── SignUp.tsx
│   │   ├── Dashboard.tsx
│   │   ├── EventsList.tsx
│   │   ├── EventForm.tsx
│   │   ├── EventDetail.tsx
│   │   └── Tickets.tsx
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── supabase-setup.sql
└── README.md
```

## Screenshots

### Landing Page
![Landing Page](https://github.com/bilahf/ticketing/blob/main/screenshots/Screenshot%20(2262).png)

### Event Detail
![Event Detail](https://github.com/bilahf/ticketing/blob/main/screenshots/Screenshot%20(2264).png)

### My Tickets
![My Tickets](https://github.com/bilahf/ticketing/blob/main/screenshots/Screenshot%20(2263).png)

## Future Improvements

- [ ] Email notifications for ticket purchases
- [ ] Payment integration (Stripe, Midtrans)
- [ ] Event reviews and ratings
- [ ] Attendee check-in system
- [ ] Advanced filtering and sorting
- [ ] Dark mode
