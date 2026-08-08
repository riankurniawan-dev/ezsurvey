import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Survey Report PDF',
}

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-white min-h-screen text-black print:bg-white print:m-0 print:p-0">
      {children}
    </div>
  )
}
