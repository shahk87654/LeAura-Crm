import { type PropsWithChildren } from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen flex bg-surface text-slate-900">
      <Sidebar />
      <div className="flex-1 p-6">
        <TopBar />
        <main className="mt-6 space-y-6">{children}</main>
      </div>
    </div>
  )
}
