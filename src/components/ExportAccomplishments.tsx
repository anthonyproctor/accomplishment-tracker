'use client'

interface ExportProps {
  accomplishments: Array<{
    title: string
    description: string
    date: string
    created_at: string
  }>
  onExport?: () => void
}

export default function ExportAccomplishments({ accomplishments, onExport }: ExportProps) {
  const exportToCSV = () => {
    // Convert accomplishments to CSV format
    const headers = ['Title', 'Description', 'Date', 'Created At']
    const csvContent = [
      headers.join(','),
      ...accomplishments.map(acc => [
        `"${acc.title.replace(/"/g, '""')}"`,
        `"${acc.description.replace(/"/g, '""')}"`,
        acc.date,
        new Date(acc.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `accomplishments-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Call onExport callback if provided
    onExport?.()
  }

  return (
    <button
      onClick={exportToCSV}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      <svg
        className="mr-2 h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
      Export to CSV
    </button>
  )
}
