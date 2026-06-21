const express = require('express')
const router = express.Router()
const cloudinary = require('cloudinary').v2
const multer = require('multer')
const Listing = require('../models/Listing')
const jwt = require('jsonwebtoken')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const upload = multer({ storage: multer.memoryStorage() })

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Not logged in' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
}

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'hostelmart' },
      (error, result) => {
        if (error) reject(error)
        else resolve(result.secure_url)
      }
    )
    stream.end(buffer)
  })
}

router.post('/', auth, upload.array('photos', 3), async (req, res) => {
  try {
    const { title, description, price, category, sellerName, sellerPhone } = req.body
    const photoUrls = []
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer)
        photoUrls.push(url)
      }
    }
    const listing = new Listing({
      title, description, price: Number(price), category,
      photos: photoUrls, seller: req.userId,
      sellerName, sellerPhone, status: 'available'
    })
    await listing.save()
    res.status(201).json({ message: 'Item posted successfully', listing })
  } catch (err) {
    console.log('Error:', err.message)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

router.get('/', async (req, res) => {
  try {
    const listings = await Listing.find({ status: 'available' }).sort({ createdAt: -1 })
    res.json(listings)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.get('/my', auth, async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.userId }).sort({ createdAt: -1 })
    res.json(listings)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
    if (!listing) return res.status(404).json({ message: 'Not found' })
    res.json(listing)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.patch('/:id/sold', auth, async (req, res) => {
  try {
    await Listing.findByIdAndUpdate(req.params.id, { status: 'sold' })
    res.json({ message: 'Marked as sold' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

router.delete('/:id', auth, async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.id)
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router