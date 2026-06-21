const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// SIGNUP
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body

    // College email check
    if (!email.endsWith('@bitsathy.ac.in')) {
      return res.status(400).json({ message: 'Only Bitsathy college email allowed' })
    }

    // Check if user already exists
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10)

    // Save user
    const user = new User({ name, email, password: hashed, phone })
    await user.save()

    res.status(201).json({ message: 'Account created successfully' })

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Email not found' })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Wrong password' })
    }

    // Create token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone }
    })

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

module.exports = router