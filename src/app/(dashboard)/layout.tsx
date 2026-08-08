'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  ClipboardList,
  FolderOpen,
  Settings,
  LogOut,
  User as UserIcon,
  Bell,
  Users,
  Building2,
  Box,
  Map,
  FileText
} from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()

  const isAdmin = session?.user?.role === 'ADMIN'
  const isSupervisor = session?.user?.role === 'SUPERVISOR'

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: FolderOpen },
    { name: 'Map', href: '/map', icon: Map },
    { name: 'Assets', href: '/assets', icon: Box },
    { name: 'Reports', href: '/reports', icon: FileText, adminOnly: false },
    { name: 'Templates', href: '/admin/templates', icon: ClipboardList, adminOnly: true },
    { name: 'Users', href: '/admin/users', icon: Users, adminOnly: true },
    { name: 'Clients', href: '/admin/clients', icon: Building2, adminOnly: true },
    { name: 'Settings', href: '/admin/settings', icon: Settings, adminOnly: true },
  ]

  const filteredNav = navigation.filter((item) => !item.adminOnly || isAdmin)

  // Bottom nav: show first 5 items
  const mobileNav = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: FolderOpen },
    { name: 'Map', href: '/map', icon: Map },
    { name: 'Assets', href: '/assets', icon: Box },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Templates', href: '/admin/templates', icon: ClipboardList },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Clients', href: '/admin/clients', icon: Building2 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl fixed inset-y-0 left-0 z-30">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-white tracking-tight">
            <span className="text-blue-500">EZ</span>Survey
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Menu</p>
          {filteredNav.slice(0, 5).map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${isActive
                  ? 'bg-blue-600/10 text-blue-500 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-500' : 'text-slate-500'}`} />
                {item.name}
              </Link>
            )
          })}

          {isAdmin && (
            <>
              <p className="px-3 pt-6 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Admin</p>
              {filteredNav.slice(5).map((item) => {
                const isActive = pathname.startsWith(item.href)
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${isActive
                      ? 'bg-blue-600/10 text-blue-500 font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-500' : 'text-slate-500'}`} />
                    {item.name}
                  </Link>
                )
              })}
            </>
          )}
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{session?.user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{session?.user?.role}</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0 md:ml-64">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center md:hidden">
            <h1 className="text-xl font-bold text-white tracking-tight">
              <span className="text-blue-500">EZ</span>Survey
            </h1>
          </div>

          <div className="hidden md:block">
            <p className="text-sm text-slate-400">
              {pathname === '/dashboard' && 'Dashboard'}
              {pathname.startsWith('/projects') && 'Project Management'}
              {pathname.startsWith('/survey') && 'Survey Execution'}
              {pathname.startsWith('/map') && 'Survey Map'}
              {pathname.startsWith('/assets') && 'Asset Management'}
              {pathname.startsWith('/reports') && 'Reports'}
              {pathname.startsWith('/admin/templates') && 'Survey Templates'}
              {pathname.startsWith('/admin/users') && 'User Management'}
              {pathname.startsWith('/admin/clients') && 'Client Management'}
              {pathname.startsWith('/admin/settings') && 'System Settings'}
            </p>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <Link href="/notifications" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors relative">
              <Bell className="w-5 h-5 text-slate-400" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 border-2 border-slate-900"></span>
            </Link>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center md:hidden text-white text-xs font-bold">
              {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 flex items-center justify-around px-2 z-30" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {mobileNav.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'
                }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-500' : 'text-slate-500'}`} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
