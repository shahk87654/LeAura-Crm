import { Download, FileJson, FileText, Printer } from 'lucide-react'
import { useState } from 'react'

interface ExportMenuProps {
  onExportCSV: () => void
  onExportPDF: () => void
  onPrint: () => void
  onExportJSON?: () => void
  isLoading?: boolean
}

export function ExportMenu({ onExportCSV, onExportPDF, onPrint, onExportJSON, isLoading = false }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-4 py-2 font-semibold text-white hover:bg-cyan-700 transition-colors disabled:opacity-50"
      >
        <Download size={16} />
        Export
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-40 mt-2 w-48 rounded-lg border border-slate-700 bg-slate-950 shadow-lg overflow-hidden">
          <button
            onClick={() => {
              onExportCSV()
              setIsOpen(false)
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-slate-200 hover:bg-slate-900 transition-colors"
          >
            <FileJson size={16} className="text-blue-400" />
            Export as CSV
          </button>

          <button
            onClick={() => {
              onExportPDF()
              setIsOpen(false)
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-slate-200 hover:bg-slate-900 transition-colors border-t border-slate-800"
          >
            <FileText size={16} className="text-red-400" />
            Export as PDF
          </button>

          <button
            onClick={() => {
              onPrint()
              setIsOpen(false)
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-slate-200 hover:bg-slate-900 transition-colors border-t border-slate-800"
          >
            <Printer size={16} className="text-green-400" />
            Print
          </button>

          {onExportJSON && (
            <button
              onClick={() => {
                onExportJSON()
                setIsOpen(false)
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-slate-200 hover:bg-slate-900 transition-colors border-t border-slate-800"
            >
              <FileJson size={16} className="text-purple-400" />
              Export as JSON
            </button>
          )}
        </div>
      )}
    </div>
  )
}
