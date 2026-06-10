import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { AppShell } from '../components/layout/AppShell'
import { getUsers, createUser, deactivateUser } from '../api/users.api'
import { getPackages, createPackage, deactivatePackage } from '../api/packages.api'
import { Settings, Users, Package as PackageIcon, Lock, Bell, Palette, CreditCard, Trash2, Plus, Eye, EyeOff } from 'lucide-react'

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'manager'])
})

const packageSchema = z.object({
  name: z.string().min(1, 'Package name required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be non-negative'),
  includes: z.array(z.string()).optional()
})

type UserFormValues = z.infer<typeof userSchema>
type PackageFormValues = z.infer<typeof packageSchema>

function SettingTab({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-medium transition-all ${
        active
          ? 'bg-cyan-600 text-white shadow-lg'
          : 'bg-slate-900/60 border border-slate-700 text-slate-300 hover:bg-slate-900 hover:border-slate-600'
      }`}
    >
      {Icon}
      {label}
    </button>
  )
}

export default function SettingsPage() {
  const [tab, setTab] = useState<'team' | 'packages' | 'security' | 'notifications' | 'appearance'>('team')
  const [showPassword, setShowPassword] = useState(false)
  const queryClient = useQueryClient()
  const usersQuery = useQuery({ queryKey: ['users'], queryFn: getUsers })
  const packagesQuery = useQuery({ queryKey: ['packages'], queryFn: getPackages })
  const userForm = useForm<UserFormValues>({ resolver: zodResolver(userSchema), defaultValues: { role: 'manager' } })
  const packageForm = useForm<PackageFormValues>({ resolver: zodResolver(packageSchema) })

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      userForm.reset()
      toast.success('Manager added successfully')
    },
    onError: () => toast.error('Failed to add manager')
  })
  const createPackageMutation = useMutation({
    mutationFn: createPackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] })
      packageForm.reset()
      toast.success('Package created successfully')
    },
    onError: () => toast.error('Failed to create package')
  })

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="rounded-3xl bg-gradient-to-r from-purple-700 to-pink-700 px-8 py-8 text-white shadow-xl border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white/10 p-3">
              <Settings size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-white/80 mt-1">Manage your team, packages, security, and preferences</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <SettingTab
            active={tab === 'team'}
            onClick={() => setTab('team')}
            icon={<Users size={18} />}
            label="Team"
          />
          <SettingTab
            active={tab === 'packages'}
            onClick={() => setTab('packages')}
            icon={<PackageIcon size={18} />}
            label="Packages"
          />
          <SettingTab
            active={tab === 'security'}
            onClick={() => setTab('security')}
            icon={<Lock size={18} />}
            label="Security"
          />
          <SettingTab
            active={tab === 'notifications'}
            onClick={() => setTab('notifications')}
            icon={<Bell size={18} />}
            label="Notifications"
          />
          <SettingTab
            active={tab === 'appearance'}
            onClick={() => setTab('appearance')}
            icon={<Palette size={18} />}
            label="Appearance"
          />
        </div>

        {/* Team Settings */}
        {tab === 'team' && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Team Members List */}
            <div className="rounded-3xl bg-slate-950/80 p-8 shadow-lg border border-slate-800">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <div className="rounded-lg bg-cyan-500/10 p-2">
                    <Users size={20} className="text-cyan-400" />
                  </div>
                  Team Members
                </h2>
                <p className="text-slate-400 mt-1">{usersQuery.data?.length ?? 0} members in your team</p>
              </div>

              {usersQuery.isLoading ? (
                <div className="py-8 text-center text-slate-400">Loading team members...</div>
              ) : usersQuery.data?.length ? (
                <div className="space-y-3">
                  {usersQuery.data.map((user) => (
                    <div key={user.id} className="rounded-2xl bg-slate-900/60 border border-slate-700 p-4 hover:border-slate-600 transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-semibold text-white">{user.name}</p>
                          <p className="text-sm text-slate-400 mt-1">{user.email}</p>
                          <div className="flex items-center gap-2 mt-3">
                            <span className={`inline-block h-2 w-2 rounded-full ${user.role === 'admin' ? 'bg-orange-400' : 'bg-cyan-400'}`} />
                            <span className="text-xs font-medium uppercase text-slate-300">{user.role}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            deactivateUser(user.id).then(() => {
                              queryClient.invalidateQueries({ queryKey: ['users'] })
                              toast.success('Member deactivated')
                            })
                          }}
                          className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                          title="Deactivate member"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">No team members yet</div>
              )}
            </div>

            {/* Add Member Form */}
            <div className="rounded-3xl bg-slate-950/80 p-8 shadow-lg border border-slate-800">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <div className="rounded-lg bg-emerald-500/10 p-2">
                    <Plus size={20} className="text-emerald-400" />
                  </div>
                  Add Team Member
                </h3>
              </div>

              <form onSubmit={userForm.handleSubmit((data) => createUserMutation.mutate(data))} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                  <input
                    placeholder="John Doe"
                    {...userForm.register('name')}
                    className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                  {userForm.formState.errors.name && <p className="text-red-400 text-sm mt-1">{userForm.formState.errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                  <input
                    placeholder="john@example.com"
                    type="email"
                    {...userForm.register('email')}
                    className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                  {userForm.formState.errors.email && <p className="text-red-400 text-sm mt-1">{userForm.formState.errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                  <div className="relative">
                    <input
                      placeholder="Secure password"
                      type={showPassword ? 'text' : 'password'}
                      {...userForm.register('password')}
                      className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-4 py-3 pr-10 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {userForm.formState.errors.password && <p className="text-red-400 text-sm mt-1">{userForm.formState.errors.password.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
                  <select
                    {...userForm.register('role')}
                    className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="manager">Manager</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={createUserMutation.isPending}
                  className="w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 font-semibold text-white hover:from-cyan-700 hover:to-blue-700 transition-all disabled:opacity-50 mt-6"
                >
                  {createUserMutation.isPending ? 'Adding...' : 'Add Member'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Packages Settings */}
        {tab === 'packages' && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Packages List */}
            <div className="rounded-3xl bg-slate-950/80 p-8 shadow-lg border border-slate-800">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <div className="rounded-lg bg-violet-500/10 p-2">
                    <PackageIcon size={20} className="text-violet-400" />
                  </div>
                  Service Packages
                </h2>
                <p className="text-slate-400 mt-1">{packagesQuery.data?.length ?? 0} packages available</p>
              </div>

              {packagesQuery.isLoading ? (
                <div className="py-8 text-center text-slate-400">Loading packages...</div>
              ) : packagesQuery.data?.length ? (
                <div className="space-y-3">
                  {packagesQuery.data.map((pkg) => (
                    <div key={pkg.id} className="rounded-2xl bg-slate-900/60 border border-slate-700 p-4 hover:border-slate-600 transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-semibold text-white">{pkg.name}</p>
                          {pkg.description && <p className="text-sm text-slate-400 mt-1">{pkg.description}</p>}
                          <p className="text-lg font-bold text-emerald-400 mt-2">₹{pkg.price?.toLocaleString()}</p>
                        </div>
                        <button
                          onClick={() => {
                            deactivatePackage(pkg.id).then(() => {
                              queryClient.invalidateQueries({ queryKey: ['packages'] })
                              toast.success('Package deactivated')
                            })
                          }}
                          className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                          title="Deactivate package"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">No packages yet</div>
              )}
            </div>

            {/* Add Package Form */}
            <div className="rounded-3xl bg-slate-950/80 p-8 shadow-lg border border-slate-800">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <div className="rounded-lg bg-emerald-500/10 p-2">
                    <Plus size={20} className="text-emerald-400" />
                  </div>
                  Create Package
                </h3>
              </div>

              <form onSubmit={packageForm.handleSubmit((data) => createPackageMutation.mutate({ ...data, includes: data.includes || [] }))} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Package Name</label>
                  <input
                    placeholder="Gold Package"
                    {...packageForm.register('name')}
                    className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                  {packageForm.formState.errors.name && <p className="text-red-400 text-sm mt-1">{packageForm.formState.errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Price (₹)</label>
                  <input
                    placeholder="50000"
                    type="number"
                    step="1000"
                    {...packageForm.register('price')}
                    className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                  {packageForm.formState.errors.price && <p className="text-red-400 text-sm mt-1">{packageForm.formState.errors.price.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                  <textarea
                    placeholder="Describe what's included in this package..."
                    {...packageForm.register('description')}
                    className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    rows={4}
                  />
                </div>

                <button
                  type="submit"
                  disabled={createPackageMutation.isPending}
                  className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 font-semibold text-white hover:from-violet-700 hover:to-purple-700 transition-all disabled:opacity-50 mt-6"
                >
                  {createPackageMutation.isPending ? 'Creating...' : 'Create Package'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {tab === 'security' && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl bg-slate-950/80 p-8 shadow-lg border border-slate-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-lg bg-orange-500/10 p-2">
                  <Lock size={20} className="text-orange-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Security</h2>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl bg-slate-900/60 border border-slate-700 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">Two-Factor Authentication</p>
                      <p className="text-sm text-slate-400 mt-1">Add an extra layer of security</p>
                    </div>
                    <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">Enabled</span>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-900/60 border border-slate-700 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">Password Policy</p>
                      <p className="text-sm text-slate-400 mt-1">Enforce strong passwords for all users</p>
                    </div>
                    <button className="px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-sm font-medium transition-colors">
                      Configure
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-900/60 border border-slate-700 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">Session Timeout</p>
                      <p className="text-sm text-slate-400 mt-1">Auto logout after 30 minutes of inactivity</p>
                    </div>
                    <button className="px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-sm font-medium transition-colors">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-950/80 p-8 shadow-lg border border-slate-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-lg bg-red-500/10 p-2">
                  <CreditCard size={20} className="text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Billing</h2>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl bg-slate-900/60 border border-slate-700 p-4">
                  <p className="text-sm text-slate-400">Subscription Plan</p>
                  <p className="text-xl font-bold text-white mt-2">Pro (Enterprise)</p>
                  <p className="text-sm text-emerald-400 mt-1">Active • Renews on Jan 1, 2027</p>
                </div>

                <div className="rounded-2xl bg-slate-900/60 border border-slate-700 p-4">
                  <p className="text-sm text-slate-400">Monthly Amount</p>
                  <p className="text-xl font-bold text-white mt-2">₹9,999</p>
                </div>

                <button className="w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 font-semibold text-white hover:from-cyan-700 hover:to-blue-700 transition-all">
                  View Billing History
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Settings */}
        {tab === 'notifications' && (
          <div className="rounded-3xl bg-slate-950/80 p-8 shadow-lg border border-slate-800 max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-lg bg-yellow-500/10 p-2">
                <Bell size={20} className="text-yellow-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Notification Preferences</h2>
            </div>

            <div className="space-y-4">
              {[
                { title: 'New Lead Created', description: 'Get notified when a new lead is added' },
                { title: 'Booking Confirmed', description: 'Receive alerts for confirmed bookings' },
                { title: 'Payment Received', description: 'Notifications for new payments' },
                { title: 'Manager Activity', description: 'Updates on team member activities' },
                { title: 'System Updates', description: 'Important system notifications' }
              ].map((notif) => (
                <div key={notif.title} className="rounded-2xl bg-slate-900/60 border border-slate-700 p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{notif.title}</p>
                    <p className="text-sm text-slate-400 mt-1">{notif.description}</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Appearance Settings */}
        {tab === 'appearance' && (
          <div className="rounded-3xl bg-slate-950/80 p-8 shadow-lg border border-slate-800 max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-lg bg-pink-500/10 p-2">
                <Palette size={20} className="text-pink-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Appearance</h2>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-slate-300 mb-4">Theme</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: 'Dark', active: true },
                    { name: 'Light', active: false }
                  ].map((theme) => (
                    <button
                      key={theme.name}
                      className={`p-4 rounded-2xl font-medium transition-all border-2 ${
                        theme.active
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                          : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {theme.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-300 mb-4">Accent Color</p>
                <div className="grid grid-cols-5 gap-3">
                  {[
                    { name: 'Cyan', color: 'bg-cyan-500' },
                    { name: 'Blue', color: 'bg-blue-500' },
                    { name: 'Violet', color: 'bg-violet-500' },
                    { name: 'Pink', color: 'bg-pink-500' },
                    { name: 'Green', color: 'bg-emerald-500' }
                  ].map((accent) => (
                    <button
                      key={accent.name}
                      className={`w-12 h-12 rounded-2xl ${accent.color} opacity-70 hover:opacity-100 transition-all ${accent.name === 'Cyan' ? 'ring-2 ring-white' : ''}`}
                      title={accent.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
