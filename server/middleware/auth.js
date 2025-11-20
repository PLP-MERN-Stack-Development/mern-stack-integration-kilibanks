const jwt = require('jsonwebtoken')
const User = require('../models/User')

module.exports = async function auth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No token provided' })
  }
  const token = authHeader.split(' ')[1]
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    const user = await User.findById(payload.id).select('-password').exec()
    if (!user) return res.status(401).json({ success: false, error: 'Invalid token' })
    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Token invalid or expired' })
  }
}
