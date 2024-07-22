const jwt = require('jsonwebtoken')
const User = require('../models/userModel')

const authMiddleware = {
    verifyUser: async (req, res, next) => {
        try {
            const token = req.header('Authorization')
            if (!token) return res.status(401).json({ msg: 'No token, no authorization' })

            const verified = jwt.verify(token, process.env.JWT_SECRET)
            if (!verified) return res.status(401).json({ msg: 'Token verification failed, access denied' })

            req.user = verified
            next()

        } catch (error) {
            console.error('Error Authnticating user', error)
            return res.status(401).json({ msg: error.msg })
        }


    },
    verifyAdmin: async (req, res) => {
        try {
            const token = req.header('Authorization')
            if (!token) return res.status(401).json({ msg: 'Token verification failed, access denied' })

            const verified = jwt.verify(token, process.env.JWT_SECRET)
            if (!token) return res.status(401).json({ msg: 'Token Verification failed, accces denied' })

            const user = await User.findById(verified.id)
            if (user.role !== 'admin') return res.status(403).json({ msg: 'Access denied, not an admin' })

            req.user = verified
            next()

        } catch (error) {
            res.status(500).json({ msg: error.message })
        }
    }
}

module.exports = authMiddleware