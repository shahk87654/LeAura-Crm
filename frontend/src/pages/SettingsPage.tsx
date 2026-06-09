import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AppShell } from '../components/layout/AppShell'
import { getUsers, createUser, deactivateUser } from '../api/users.api'
import { getPackages, createPackage, deactivatePackage } from '../api/packages.api'

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'manager'])
})

const packageSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
  includes: z.array(z.string()).optional()
})

type UserFormValues = z.infer<typeof userSchema>
type PackageFormValues = z.infer<typeof packageSchema>

export default function SettingsPage() {
  const [tab, setTab] = useState<'users' | 'packages' | 'profile'>('users')
  const queryClient = useQueryClient()
  const usersQuery = useQuery({ queryKey: ['users'], queryFn: getUsers })
  const packagesQuery = useQuery({ queryKey: ['packages'], queryFn: getPackages })
  const userForm = useForm<UserFormValues>({ resolver: zodResolver(userSchema), defaultValues: { role: 'manager' } })
  const packageForm = useForm<PackageFormValues>({ resolver: zodResolver(packageSchema) })

  const createUserMutation = useMutation({ mutationFn: createUser, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }) })
  const createPackageMutation = useMutation({ mutationFn: createPackage, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['packages'] }) })

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-navy">Settings</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {['users', 'packages', 'profile'].map((value) => (
              <button
                key={value}
                onClick={() => setTab(value as typeof tab)}
                className={`rounded-2xl px-4 py-2 ${tab === value ? 'bg-gold text-navy' : 'bg-slate-100 text-slate-700'}`}
              >
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {tab === 'users' && (
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-navy">Managers</h3>
              {usersQuery.data?.length ? (
                <div className="mt-4 space-y-3">
                  {usersQuery.data.map((user) => (
                    <div key={user.id} className="flex items-center justify-between rounded-3xl border border-slate-200 p-4">
                      <div>
                        <p className="font-semibold text-navy">{user.name}</p>
                        <p className="text-slate-500">{user.email}</p>
                      </div>
                      <button onClick={() => deactivateUser(user.id).then(() => queryClient.invalidateQueries({ queryKey: ['users'] }))} className="rounded-full bg-red-100 px-4 py-2 text-red-700">
                        Deactivate
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-slate-500">No managers found.</p>
              )}
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-navy">Add Manager</h3>
              <form onSubmit={userForm.handleSubmit((data) => createUserMutation.mutate(data))} className="mt-4 space-y-4">
                <input placeholder="Name" {...userForm.register('name')} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                <input placeholder="Email" {...userForm.register('email')} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                <input type="password" placeholder="Password" {...userForm.register('password')} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                <select {...userForm.register('role')} className="w-full rounded-2xl border border-slate-200 px-4 py-3">
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
                <button type="submit" className="rounded-2xl bg-gold px-5 py-3 font-semibold text-navy">Create user</button>
              </form>
            </div>
          </div>
        )}

        {tab === 'packages' && (
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-navy">Packages</h3>
              {packagesQuery.data?.length ? (
                <div className="mt-4 space-y-3">
                  {packagesQuery.data.map((pkg) => (
                    <div key={pkg.id} className="rounded-3xl border border-slate-200 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-navy">{pkg.name}</p>
                          <p className="text-slate-500">{pkg.description}</p>
                        </div>
                        <button onClick={() => deactivatePackage(pkg.id).then(() => queryClient.invalidateQueries({ queryKey: ['packages'] }))} className="rounded-full bg-red-100 px-4 py-2 text-red-700">
                          Deactivate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-slate-500">No packages defined.</p>
              )}
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-navy">Add Package</h3>
              <form onSubmit={packageForm.handleSubmit((data) => createPackageMutation.mutate({ ...data, includes: data.includes || [] }))} className="mt-4 space-y-4">
                <input placeholder="Name" {...packageForm.register('name')} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                <input placeholder="Price" type="number" {...packageForm.register('price', { valueAsNumber: true })} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                <textarea placeholder="Description" {...packageForm.register('description')} className="w-full rounded-2xl border border-slate-200 px-4 py-3" rows={4} />
                <button type="submit" className="rounded-2xl bg-gold px-5 py-3 font-semibold text-navy">Create package</button>
              </form>
            </div>
          </div>
        )}

        {tab === 'profile' && (
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-navy">Profile</h3>
            <p className="mt-4 text-slate-500">Manage your profile and password from the backend settings or by implementing a profile update form.</p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
