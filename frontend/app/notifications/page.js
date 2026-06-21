'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Notifications() {
  const router = useRouter()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('user')
    if (!saved) { router.push('/login'); return }
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setNotifications(data)
      // Mark all as read
      await fetch('http://localhost:5000/api/notifications/read', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch (err) {
      console.log('Error:', err)
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold cursor-pointer" onClick={() => router.push('/')}>
          Hostel<span className="text-yellow-400">Mart</span>
        </h1>
        <button onClick={() => router.push('/')} className="text-gray-400 hover:text-white text-sm">← Back</button>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold mb-6">🔔 Notifications</h2>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <p className="text-4xl mb-4">🔔</p>
            <p>No notifications yet</p>
            <p className="text-sm mt-2">When someone is interested in your item, you'll see it here</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {notifications.map(n => (
              <div key={n._id} className={`p-4 rounded-xl border ${n.read ? 'bg-gray-900 border-gray-800' : 'bg-gray-800 border-yellow-400'}`}>
                <p className="font-medium text-white">
                  <span className="text-yellow-400">{n.buyerName}</span> is interested in <span className="text-yellow-400">{n.listingTitle}</span>
                </p>
                <p className="text-gray-400 text-sm mt-1">📞 {n.buyerPhone}</p>
                <a href={`https://wa.me/91${n.buyerPhone}?text=Hi ${n.buyerName}, I saw your interest in my ${n.listingTitle} on HostelMart!`}
                  target="_blank"
                  className="mt-3 inline-block bg-green-600 hover:bg-green-500 text-white text-sm px-4 py-2 rounded-lg">
                  💬 Reply on WhatsApp
                </a>
                <p className="text-gray-600 text-xs mt-2">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}