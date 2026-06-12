import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlineUser, HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineSparkles } from 'react-icons/hi'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import Button from '../components/common/Button'
import Input from '../components/common/Input'

const getStrength = (pw) => {
  let s = 0
  if (pw.length >= 6) s++
  if (pw.length >= 10) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}
const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
const strengthColors = ['', 'bg-rose-500', 'bg-amber-500', 'bg-yellow-400', 'bg-emerald-400', 'bg-emerald-500']

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [agreed, setAgreed] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()
  const strength = getStrength(form.password)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 6) errs.password = 'Min 6 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    if (!agreed) errs.terms = 'You must accept the terms'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success('Account created!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f23] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-indigo-600/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <HiOutlineSparkles className="text-white text-xl" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-4">Create Account</h1>
          <p className="text-gray-400 text-sm mt-1">Start your analytics journey</p>
        </div>

        <div className="glass rounded-2xl p-8 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name" icon={<HiOutlineUser />} placeholder="John Doe" value={form.name} onChange={set('name')} error={errors.name} />
            <Input label="Email Address" type="email" icon={<HiOutlineMail />} placeholder="you@example.com" value={form.email} onChange={set('email')} error={errors.email} />

            <div className="relative">
              <Input label="Password" type={showPw ? 'text' : 'password'} icon={<HiOutlineLockClosed />} placeholder="••••••••" value={form.password} onChange={set('password')} error={errors.password} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-300 transition-colors">
                {showPw ? <HiOutlineEyeOff className="text-lg" /> : <HiOutlineEye className="text-lg" />}
              </button>
            </div>

            {/* Strength bar */}
            {form.password && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength ? strengthColors[strength] : 'bg-white/10'}`} />
                  ))}
                </div>
                <p className={`text-xs ${strength <= 2 ? 'text-rose-400' : 'text-emerald-400'}`}>{strengthLabels[strength]}</p>
              </div>
            )}

            <Input label="Confirm Password" type="password" icon={<HiOutlineLockClosed />} placeholder="••••••••" value={form.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} />

            <label className="flex items-start gap-2 text-sm text-gray-400 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-4 h-4 mt-0.5 rounded bg-white/5 border-white/10 text-indigo-500 focus:ring-indigo-500/50" />
              <span>I agree to the <a href="#" className="text-indigo-400 hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-400 hover:underline">Privacy Policy</a></span>
            </label>
            {errors.terms && <p className="text-rose-400 text-xs">{errors.terms}</p>}

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">Create Account</Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Sign in</Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
