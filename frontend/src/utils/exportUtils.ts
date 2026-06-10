import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import Papa from 'papaparse'

/**
 * Export data to CSV file
 */
export function exportToCSV(data: Record<string, any>[], filename: string) {
  const csv = Papa.unparse(data)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export HTML element to PDF
 */
export async function exportHTMLToPDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId)
  if (!element) {
    console.error(`Element with id ${elementId} not found`)
    return
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#f8fafc',
      scale: 2,
      useCORS: true,
      logging: false
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 210 - 20 // A4 width - margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    let position = 10

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
    heightLeft -= 297 - 20 // A4 height - margins

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
      heightLeft -= 297 - 20
    }

    pdf.save(`${filename}.pdf`)
  } catch (error) {
    console.error('Error generating PDF:', error)
  }
}

/**
 * Export table data to PDF with proper formatting
 */
export function exportTableToPDF(
  tableData: Record<string, any>[],
  columns: { key: string; label: string }[],
  filename: string,
  title?: string
) {
  const pdf = new jsPDF('l', 'mm', 'a4') // landscape
  let yPosition = 10

  // Add title if provided
  if (title) {
    pdf.setFontSize(16)
    pdf.text(title, 10, yPosition)
    yPosition += 15
  }

  // Column widths
  const pageWidth = pdf.internal.pageSize.getWidth()
  const margin = 10
  const contentWidth = pageWidth - 2 * margin
  const columnWidth = contentWidth / columns.length

  // Draw headers
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'bold')
  pdf.setFillColor(200, 200, 200)

  columns.forEach((col, index) => {
    const x = margin + index * columnWidth
    pdf.rect(x, yPosition, columnWidth, 8, 'F')
    pdf.text(col.label, x + 2, yPosition + 5, { maxWidth: columnWidth - 4 })
  })

  yPosition += 10

  // Draw rows
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)

  tableData.forEach((row) => {
    if (yPosition > 270) {
      pdf.addPage()
      yPosition = 10
    }

    columns.forEach((col, index) => {
      const x = margin + index * columnWidth
      const value = row[col.key]?.toString() || '—'
      pdf.text(value, x + 2, yPosition, { maxWidth: columnWidth - 4 })
    })

    yPosition += 7
  })

  pdf.save(`${filename}.pdf`)
}

/**
 * Print content with styling
 */
export function printContent(elementId: string, title?: string) {
  const element = document.getElementById(elementId)
  if (!element) {
    console.error(`Element with id ${elementId} not found`)
    return
  }

  const printWindow = window.open('', '', 'height=600,width=800')
  if (!printWindow) return

  printWindow.document.write(`
    <html>
      <head>
        <title>${title || 'Print'}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            padding: 20px;
            color: #1f2937;
          }
          h1 {
            text-align: center;
            margin-bottom: 30px;
            color: #111827;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th {
            background-color: #f3f4f6;
            border: 1px solid #d1d5db;
            padding: 12px;
            text-align: left;
            font-weight: 600;
          }
          td {
            border: 1px solid #d1d5db;
            padding: 12px;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .section {
            margin: 30px 0;
          }
          .section-title {
            font-size: 18px;
            font-weight: 600;
            margin: 20px 0 10px;
            color: #111827;
          }
          .detail-row {
            display: flex;
            gap: 40px;
            margin: 10px 0;
          }
          .detail-item {
            flex: 1;
          }
          .detail-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
          }
          .detail-value {
            font-size: 16px;
            font-weight: 500;
            color: #111827;
          }
          @media print {
            body {
              margin: 0;
              padding: 10px;
            }
          }
        </style>
      </head>
      <body>
        ${title ? `<h1>${title}</h1>` : ''}
        ${element.innerHTML}
      </body>
    </html>
  `)

  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => {
    printWindow.print()
  }, 250)
}

/**
 * Format booking data for export
 */
export function formatBookingForExport(booking: Record<string, any>) {
  return {
    'Booking Ref': booking.bookingRef || '—',
    'Client Name': booking.clientName || '—',
    'Phone': booking.phone || '—',
    'Email': booking.email || '—',
    'Event Type': booking.eventType || '—',
    'Event Date': booking.eventDate || '—',
    'Venue Area': booking.venueArea || '—',
    'Total Amount': booking.totalAmount || 0,
    'Advance Paid': booking.advancePaid || 0,
    'Pending Amount': (booking.totalAmount || 0) - (booking.advancePaid || 0),
    'Booking Status': booking.bookingStatus || '—',
    'Payment Status': booking.paymentStatus || '—'
  }
}

/**
 * Format lead data for export
 */
export function formatLeadForExport(lead: Record<string, any>) {
  return {
    'Lead Name': lead.fullName || '—',
    'Phone': lead.phone || '—',
    'Email': lead.email || '—',
    'Source': lead.source || '—',
    'Event Type': lead.eventType || '—',
    'Event Date': lead.eventDate || '—',
    'Guest Count': lead.guestCount || '—',
    'Budget Range': lead.budgetRange || '—',
    'Venue Area': lead.venueArea || '—',
    'Stage': lead.stage || '—',
    'Priority': lead.priority || '—',
    'Assigned To': lead.assignedTo?.name || '—',
    'Notes': lead.notes || '—'
  }
}
