import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GolfGive — Play. Win. Give.',
  description: 'The subscription platform where your golf scores enter you into monthly prize draws while supporting the charities that matter most to you.',
  keywords: 'golf, charity, prize draw, subscription, stableford, fundraising',
  openGraph: {
    title: 'GolfGive — Play. Win. Give.',
    description: 'Monthly prize draws powered by your golf scores. Every subscription supports charity.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
