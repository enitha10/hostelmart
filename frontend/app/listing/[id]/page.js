'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function ListingDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [currentPhoto, setCurrentPhoto] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem('user')
    if (saved) setUser(JSON.parse(saved))
    fetchItem()
  }, [])

  const fetchItem = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/listings/${id}`)
      const data = await res.json()
      setItem(data)
    } catch (err) {
      console.log('Error:', err)
    }
    setLoading(false)
  }

  const handleInterested = async () => {
  if (!user) {
    alert('Please login first')
    router.push('/login')
    return
  }
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('http://localhost:5000/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        sellerId: item.seller,
        listingId: item._id,
        listingTitle: item.title,
        buyerName: user.name,
        buyerPhone: user.phone
      })
    })
    if (res.ok) {
      alert('Seller has been notified! They will contact you soon.')
    }
  } catch (err) {
    alert('Something went wrong')
  }
}

  const handleMarkSold = async () => {
    const token = localStorage.getItem('token')
    const res = await fetch(`http://localhost:5000/api/listings/${id}/sold`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) {
      alert('Marked as sold!')
      router.push('/')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item?')) return
    const token = localStorage.getItem('token')
    const res = await fetch(`http://localhost:5000/api/listings/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) {
      alert('Item deleted!')
      router.push('/')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      Loading...
    </div>
  )

  if (!item) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      Item not found
    </div>
  )

  const isOwner = user && item.seller === user.id

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold cursor-pointer" onClick={() => router.push('/')}>
          Hostel<span className="text-yellow-400">Mart</span>
        </h1>
        <button onClick={() => router.push('/')} className="text-gray-400 hover:text-white text-sm">
          ← Back
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Photos */}
        {item.photos.length > 0 ? (
          <div>
            <img src={item.photos[currentPhoto]} alt={item.title}
              className="w-full h-72 object-cover rounded-2xl border border-gray-800" />
            {item.photos.length > 1 && (
              <div className="flex gap-2 mt-3">
                {item.photos.map((photo, i) => (
                  <img key={i} src={photo} onClick={() => setCurrentPhoto(i)}
                    className={`w-16 h-16 object-cover rounded-lg cursor-pointer border-2 ${currentPhoto === i ? 'border-yellow-400' : 'border-gray-700'}`} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-72 bg-gray-900 rounded-2xl flex items-center justify-center text-gray-600">
            📦 No Image
          </div>
        )}

        {/* Details */}
        <div className="mt-6">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold">{item.title}</h2>
            <span className="text-gray-500 text-xs bg-gray-800 px-3 py-1 rounded-full">{item.category}</span>
          </div>
          <p className="text-3xl font-bold text-yellow-400 mt-2">₹ {item.price}</p>
          <p className="text-gray-400 mt-4 text-sm leading-relaxed">{item.description}</p>

          {/* Status */}
          {item.status === 'sold' && (
            <div className="mt-4 bg-red-900 border border-red-700 text-red-300 px-4 py-2 rounded-xl text-sm">
              This item has been sold
            </div>
          )}
        </div>

        {/* Seller info */}
        <div className="mt-6 bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-gray-400 text-sm mb-3">Seller Details</p>
          <p className="font-medium">{item.sellerName}</p>
          <p className="text-gray-400 text-sm mt-1">{item.sellerPhone}</p>

          {item.status === 'available' && !isOwner && (
  <div className="flex flex-col gap-3 mt-4">
    <button onClick={handleInterested}
      className="w-full bg-yellow-400 text-black font-bold py-3 rounded-xl hover:bg-yellow-300 transition-all">
      ✋ I'm Interested — Notify Seller
    </button>
    <a href={`https://wa.me/91${item.sellerPhone}?text=Hi, I'm interested in your ${item.title} listed on HostelMart for ₹${item.price}`}
      target="_blank"
      className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-all">
      💬 Contact on WhatsApp
    </a>
  </div>
)}
        </div>

        {/* Owner controls */}
        {isOwner && (
          <div className="mt-4 flex gap-3">
            {item.status === 'available' && (
              <button onClick={handleMarkSold}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all">
                Mark as Sold
              </button>
            )}
            <button onClick={handleDelete}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-all">
              Delete Item
            </button>
          </div>
        )}

      </div>
    </main>
  )
}