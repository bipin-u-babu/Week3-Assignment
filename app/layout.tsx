import './globals.css'

export const metadata = {
  title: 'Meeting Transcript Analyzer',
  description: 'Analyze meeting transcripts and extract action items',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
