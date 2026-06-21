'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function MyListings() {
  const router = useRouter()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('user')
    if (!saved) {
      router.push('/login')
      return
    }
    fetchMyListings()
  }, [])

  const fetchMyListings = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5000/api/listings/my', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setListings(data)
    } catch (err) {
      console.log('Error:', err)
    }
    setLoading(false)
  }

  const handleMarkSold = async (id) => {
    const token = localStorage.getItem('token')
    const res = await fetch(`http://localhost:5000/api/listings/${id}/sold`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) fetchMyListings()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return
    const token = localStorage.getItem('token')
    const res = await fetch(`http://localhost:5000/api/listings/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) fetchMyListings()
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold cursor-pointer" onClick={() => router.push('/')}>
          Hostel<span className="text-yellow-400">Mart</span>
        </h1>
        <Link href="/sell" className="bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-bold">
          + Sell Item
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold mb-6">My Listings</h2>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <p className="text-4xl mb-4">📦</p>
            <p>You haven't posted anything yet</p>
            <Link href="/sell" className="mt-4 inline-block bg-yellow-400 text-black px-6 py-2 rounded-full font-bold">
              + Post an Item
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {listings.map(item => (
              <div key={item._id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex gap-4">
                {item.photos.length > 0 ? (
                  <img src={item.photos[0]} className="w-20 h-20 object-cover rounded-lg" />
                ) : (
                  <div className="w-20 h-20 bg-gray-800 rounded-lg flex items-center justify-center text-gray-600">📦</div>
                )}
                <div className="flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-yellow-400 font-bold">₹ {item.price}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${item.status === 'sold' ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
                    {item.status === 'sold' ? 'Sold' : 'Available'}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {item.status === 'available' && (
                    <button onClick={() => handleMarkSold(item._id)}
                      className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg">
                      Mark Sold
                    </button>
                  )}
                  <button onClick={() => handleDelete(item._id)}
                    className="text-xs bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}