'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const categories = ["Kitchen", "Bedding", "Electronics", "Stationery", "Furniture", "Clothing", "Toiletries", "Other"]

export default function Sell() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('Kitchen')
  const [photos, setPhotos] = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('user')
    if (!saved) {
      alert('Please login first')
      router.push('/login')
    } else {
      setUser(JSON.parse(saved))
    }
  }, [])

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files).slice(0, 3)
    setPhotos(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('price', price)
      formData.append('category', category)
      formData.append('sellerName', user.name)
      formData.append('sellerPhone', user.phone)
      photos.forEach(photo => formData.append('photos', photo))

      const res = await fetch('http://localhost:5000/api/listings', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })

      const data = await res.json()

      if (res.ok) {
        alert('Item posted successfully!')
        router.push('/')
      } else {
        alert(data.message)
      }
    } catch (err) {
      alert('Something went wrong')
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold cursor-pointer" onClick={() => router.push('/')}>
          Hostel<span className="text-yellow-400">Mart</span>
        </h1>
      </nav>

      <div className="max-w-xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold mb-6">Post an Item</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Title */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Item Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Plastic Bucket, Table Fan..."
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-yellow-400"
              required />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Condition, age, reason for selling..."
              rows={3}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-yellow-400 resize-none"
              required />
          </div>

          {/* Price */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Price (₹)</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)}
              placeholder="Enter price in rupees"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-yellow-400"
              required />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-yellow-400">
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          {/* Photos */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Photos (max 3)</label>
            <input type="file" accept="image/*" multiple onChange={handlePhotos}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-400 outline-none" />
            {previews.length > 0 && (
              <div className="flex gap-2 mt-3">
                {previews.map((src, i) => (
                  <img key={i} src={src} className="w-24 h-24 object-cover rounded-lg border border-gray-700" />
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-yellow-400 text-black font-bold py-3 rounded-xl hover:bg-yellow-300 transition-all disabled:opacity-50">
            {loading ? 'Posting...' : 'Post Item'}
          </button>

        </form>
      </div>
    </main>
  )
}