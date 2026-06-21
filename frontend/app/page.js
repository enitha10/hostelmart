'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const categories = ["All", "Kitchen", "Bedding", "Electronics", "Stationery", "Furniture", "Clothing", "Toiletries", "Other"]

const categoryIcons = {
  "All": "🏠", "Kitchen": "🪣", "Bedding": "🛏️", "Electronics": "💻",
  "Stationery": "📚", "Furniture": "🪑", "Clothing": "👕", "Toiletries": "🧴", "Other": "📦"
}

export default function Home() {
  const [selectedCat, setSelectedCat] = useState("All")
  const [search, setSearch] = useState("")
  const [user, setUser] = useState(null)
  const [notifCount, setNotifCount] = useState(0)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('user')
    if (saved) {
      setUser(JSON.parse(saved))
      fetchNotifCount()
    }
    fetchListings()
  }, [])

  const fetchListings = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/listings')
      const data = await res.json()
      setListings(data)
    } catch (err) {
      console.log('Error fetching listings:', err)
    }
    setLoading(false)
  }

  const fetchNotifCount = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      const res = await fetch('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (Array.isArray(data)) {
        setNotifCount(data.filter(n => !n.read).length)
      }
    } catch (err) {}
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const filtered = listings.filter(item => {
    const matchCat = selectedCat === "All" || item.category === selectedCat
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <main className="min-h-screen bg-zinc-950 text-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 sticky top-0 bg-zinc-950 z-10 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏪</span>
          <h1 className="text-xl font-bold">Hostel<span className="text-yellow-400">Mart</span></h1>
        </div>
        <div className="flex-1 mx-8 hidden md:block">
          <div className="relative">
            <span className="absolute left-4 top-2.5 text-gray-500">🔍</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search items..."
              className="w-full bg-zinc-900 text-white border border-zinc-700 rounded-full pl-10 pr-5 py-2.5 text-sm outline-none focus:border-yellow-400 transition-all" />
          </div>
        </div>
        <div className="flex gap-3 items-center">
          {user ? (
            <>
              <span className="text-zinc-400 text-sm hidden md:block">Hi, {user.name.split(' ')[0]} 👋</span>
              <Link href="/notifications" className="relative p-2 text-zinc-400 hover:text-white transition-all">
                🔔
                {notifCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {notifCount}
                  </span>
                )}
              </Link>
              <Link href="/mylistings" className="text-zinc-400 hover:text-white text-sm transition-all hidden md:block">My Items</Link>
              <Link href="/sell" className="bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-yellow-300 transition-all">
                + Sell
              </Link>
              <button onClick={handleLogout} className="text-zinc-500 hover:text-white text-sm transition-all">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-zinc-400 hover:text-white text-sm">Login</Link>
              <Link href="/signup" className="bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-yellow-300">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero banner */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 px-6 py-8 text-black">
        <h2 className="text-2xl font-bold">Buy & Sell Hostel Items 🏠</h2>
        <p className="text-sm mt-1 opacity-75">Exclusive for Bitsathy students — no middlemen, no shipping!</p>
        {user && (
          <Link href="/sell" className="mt-4 inline-block bg-black text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-zinc-800 transition-all">
            + Post an Item
          </Link>
        )}
      </div>

      {/* Mobile search */}
      <div className="px-4 mt-4 md:hidden">
        <div className="relative">
          <span className="absolute left-4 top-2.5 text-gray-500">🔍</span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search items..."
            className="w-full bg-zinc-900 text-white border border-zinc-700 rounded-full pl-10 pr-5 py-2.5 text-sm outline-none focus:border-yellow-400" />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 px-4 mt-5 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button key={cat} onClick={() => setSelectedCat(cat)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm whitespace-nowrap border transition-all
              ${selectedCat === cat
                ? "bg-yellow-400 text-black border-yellow-400 font-bold"
                : "bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-yellow-400 hover:text-yellow-400"
              }`}>
            <span>{categoryIcons[cat]}</span>
            <span>{cat}</span>
          </button>
        ))}
      </div>

      {/* Count */}
      <div className="px-4 mt-4 text-zinc-500 text-sm">
        {loading ? '⏳ Loading...' : `${filtered.length} items found`}
      </div>

      {/* Listings grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 mt-3 pb-10">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="bg-zinc-900 rounded-2xl overflow-hidden animate-pulse">
              <div className="w-full h-44 bg-zinc-800" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-zinc-800 rounded w-3/4" />
                <div className="h-3 bg-zinc-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-lg font-medium">No items found</p>
          <p className="text-sm mt-2">Be the first to sell something!</p>
          {user && (
            <Link href="/sell" className="mt-6 bg-yellow-400 text-black px-6 py-2.5 rounded-full font-bold hover:bg-yellow-300 transition-all">
              + Post an Item
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 mt-3 pb-10">
          {filtered.map(item => (
            <Link href={`/listing/${item._id}`} key={item._id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-400/10 cursor-pointer transition-all group">
              {item.photos.length > 0 ? (
                <div className="overflow-hidden">
                  <img src={item.photos[0]} alt={item.title}
                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              ) : (
                <div className="w-full h-44 bg-zinc-800 flex items-center justify-center text-zinc-600 text-3xl">📦</div>
              )}
              <div className="p-3">
                <p className="text-white font-semibold text-sm truncate">{item.title}</p>
                <p className="text-yellow-400 font-bold text-lg mt-1">₹{item.price}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-zinc-500 text-xs bg-zinc-800 px-2 py-0.5 rounded-full">
                    {categoryIcons[item.category]} {item.category}
                  </span>
                  <span className="text-zinc-600 text-xs">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

    </main>
  )
}