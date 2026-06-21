'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e) => {
    e.preventDefault()

    if (!email.endsWith('@bitsathy.ac.in')) {
      alert('Only Bitsathy college email allowed!\nExample: yourname@bitsathy.ac.in')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone })
      })

      const data = await res.json()

      if (res.ok) {
        alert('Account created! Please login.')
        window.location.href = '/login'
      } else {
        alert(data.message)
      }
    } catch (err) {
      alert('Something went wrong. Is the backend running?')
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-8">
        Hostel<span className="text-yellow-400">Mart</span>
      </h1>
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8">
        <h2 className="text-xl font-semibold mb-6">Create your account</h2>
        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-yellow-400"
              required />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">College Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="yourname@bitsathy.ac.in"
              className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-yellow-400"
              required />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Phone / WhatsApp Number</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="Your WhatsApp number"
              className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-yellow-400"
              required />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Create a password"
              className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-yellow-400"
              required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-yellow-400 text-black font-bold py-3 rounded-xl hover:bg-yellow-300 transition-all mt-2 disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-yellow-400 hover:underline">Login</Link>
        </p>
      </div>
    </main>
  )
}