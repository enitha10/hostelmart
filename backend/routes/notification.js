const express = require('express')
const router = express.Router()
const Notification = require('../models/Notification')
const jwt = require('jsonwebtoken')

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

// POST — buyer sends interest
router.post('/', auth, async (req, res) => {
  try {
    const { sellerId, listingId, listingTitle, buyerName, buyerPhone } = req.body

    const notification = new Notification({
      seller: sellerId,
      buyer: req.userId,
      buyerName,
      buyerPhone,
      listingId,
      listingTitle
    })

    await notification.save()
    res.status(201).json({ message: 'Seller notified!' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// GET — seller sees their notifications
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ seller: req.userId }).sort({ createdAt: -1 })
    res.json(notifications)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// PATCH — mark all as read
router.patch('/read', auth, async (req, res) => {
  try {
    await Notification.updateMany({ seller: req.userId, read: false }, { read: true })
    res.json({ message: 'Marked as read' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router