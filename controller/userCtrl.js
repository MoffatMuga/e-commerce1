const Users = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userCtrl = {
    register: async (req, res) => {
        try {
            const { email, password, firstname, lastname, mobile } = req.body

            if (!email || !password || !firstname || !lastname || !mobile) {
                return res.status(400).json({ msg: 'please enter all fields' })
            }

            const user = await Users.findOne({ email })
            if (user) {
                return res.status(400).json({ msg: 'user already exists' })
            }

            if (password < 6) {
                return res.status(400).json({ msg: 'password cannot be less than 6 characters' })
            }

            const passwordHash = await bcrypt.hash(password, 12)

            const newUser = new Users({
                email, lastname, firstname, password: passwordHash, mobile
            })

            await newUser.save()
            res.status(201).json({ msg: 'user registered successfully' })


        } catch (error) {
            console.error('Error creating user:', error);
            return res.status(500).json({ msg: error.msg })
        }
    },
    login: async (req, res) => {
        try {
            const { email, password } = req.body
            if (!email || !password) {
                return res.status(400).json({ msg: 'all fields are required' })
            }

            const user = await Users.findOne({ email })
            if (!user) {
                return res.status(400).json({ msg: 'user does not exist' })
            }

            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) {
                return res.status(400).json({ msg: 'invalid credentials' })
            }

            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1hr' })
            res.json({
                token,
                user: {
                    id: user._id,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    mobile: user.mobile
                }
            })
        } catch (error) {
            console.error('Error logging in', error)
            return res.status(400).json({ msg: 'error logging in' })
        }
    }
}

module.exports = userCtrl