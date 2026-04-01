import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// One-time charity seeder — call GET /api/seed-charities to populate the DB
export async function GET() {
  const supabase = await createClient()

  const charities = [
    {
      name: 'Cancer Research UK',
      description: 'Fighting cancer through world-class research. Every subscription contribution funds groundbreaking science that saves lives.',
      website_url: 'https://www.cancerresearchuk.org',
      upcoming_events: 'Golf Day — June 15, 2026 at Royal Birkdale',
      is_featured: true,
      is_active: true,
    },
    {
      name: 'British Heart Foundation',
      description: 'Funding vital research and support for people living with heart and circulatory diseases. Every swing counts.',
      website_url: 'https://www.bhf.org.uk',
      upcoming_events: 'Charity Golf Tournament — July 20, 2026',
      is_featured: false,
      is_active: true,
    },
    {
      name: 'Macmillan Cancer Support',
      description: 'Providing medical, emotional, practical and financial support to people living with cancer and their families.',
      website_url: 'https://www.macmillan.org.uk',
      upcoming_events: null,
      is_featured: false,
      is_active: true,
    },
    {
      name: 'Mind',
      description: 'Mental health charity providing advice and support to empower anyone experiencing a mental health problem.',
      website_url: 'https://www.mind.org.uk',
      upcoming_events: 'Mental Health Golf Day — August 2026',
      is_featured: false,
      is_active: true,
    },
    {
      name: "St Jude Children's Research Hospital",
      description: "Leading the way the world understands, treats and defeats childhood cancer and other life-threatening diseases.",
      website_url: 'https://www.stjude.org',
      upcoming_events: null,
      is_featured: false,
      is_active: true,
    },
  ]

  // Check if charities already exist
  const { data: existing } = await supabase.from('charities').select('id').limit(1)
  if (existing && existing.length > 0) {
    return NextResponse.json({ message: 'Charities already seeded', count: existing.length })
  }

  const { data, error } = await supabase.from('charities').insert(charities).select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Charities seeded successfully!', count: data.length, charities: data.map(c => c.name) })
}
