import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { login } from '../api/auth.api'
import { useAuthStore } from '../store/authStore'

const schema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' })
})

type LoginForm = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const { register, handleSubmit, formState } = useForm<LoginForm>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: LoginForm) => {
    try {
      const data = await login(values)
      setAuth(data.token, data.user)
      navigate('/dashboard')
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Unable to sign in')
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.15),_transparent_15%),radial-gradient(circle_at_bottom_right,_rgba(201,169,110,0.18),_transparent_20%),#1A1A2E] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl rounded-[40px] bg-white/95 shadow-soft backdrop-blur-xl border border-white/10 overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[1.2fr_1fr]">
          <div className="relative bg-navy p-10 text-white lg:p-12">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(255,255,255,0.08),_transparent_60%)]" />
            <div className="relative z-10 flex h-full flex-col justify-between gap-8">
              <div>
                <div className="inline-flex items-center justify-center rounded-full bg-gold/15 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-gold">
                  Welcome back
                </div>
                <h1 className="mt-8 text-4xl font-[Cormorant_Garamond] font-semibold tracking-tight text-white">
                  Le Aura Grand
                </h1>
                <p className="mt-4 max-w-sm text-base leading-7 text-slate-200">
                  Manage high-end events, nurture leads, and keep your follow-ups beautifully organized with confidence.
                </p>
              </div>

              <div className="grid gap-4 rounded-[32px] bg-white/5 p-6 text-sm text-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Smart CRM</p>
                  <p>Quickly view overdue follow-ups and stay on top of your most important leads.</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Secure login</p>
                  <p>Encrypted sessions and role-based access for your team.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-10 lg:p-12">
            <div className="max-w-md">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Sign in to your account</p>
              <h2 className="mt-4 text-3xl font-semibold text-navy">Let's get you back to the dashboard</h2>
              <p className="mt-3 text-sm text-slate-500">Enter your credentials and continue managing your venue pipeline.</p>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Email address</label>
                  <input
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                    className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/10"
                  />
                  {formState.errors.email && (
                    <p className="mt-2 text-sm text-rose-600">{formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                  <input
                    type="password"
                    autoComplete="current-password"
                    {...register('password')}
                    className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/10"
                  />
                  {formState.errors.password && (
                    <p className="mt-2 text-sm text-rose-600">{formState.errors.password.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="submit"
                    disabled={formState.isSubmitting}
                    className="inline-flex w-full items-center justify-center rounded-full bg-gold px-6 py-4 text-sm font-semibold text-navy transition hover:bg-goldLight disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                  >
                    {formState.isSubmitting ? 'Signing in…' : 'Sign In'}
                  </button>
                  <button type="button" className="text-sm font-medium text-slate-500 transition hover:text-navy">
                    Forgot password?
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
