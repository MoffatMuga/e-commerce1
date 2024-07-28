const Users = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const CartItem = require('../models/userCartModel')
const Review = require('../models/userReviewModel')
const Address = require('../models/userAddressModel')
const Wishlist = require('../models/userWishlistModel')
const Product = require('../models/productModel')

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
            return res.status(500).json({ msg: 'error logging in' })
        }
    },
    getUsers: async (req, res) => {
        try {
            const users = await Users.find()
            res.json(users)
        } catch (error) {
            console.error('error fetching users', error)
            res.status(500).json({ msg: error.message })
        }
    },
    updateUserRole: async (req, res) => {
        try {
            const { userId, role } = req.body
            if (!['user', 'admin'].includes(role)) {
                return res.status(400).json({ msg: 'Invalid role' })
            }

            const user = Users.findById(userId)
            if (!user) {
                return res.status(400).json({ msg: 'User Not Found' })
            }

            user.role = role
            await user.save()

            res.json({ msg: 'user role updated successfully' })
        } catch (error) {
            console.error('error updating role', error)
            res.status(400).json({ msg: error.msg })
        }
    },
    deleteUser: async (req, res) => {
        try {
            const { userId } = req.params

            const user = await Users.findByIdAndDelete(userId)
            if (!user) {
                return res.status(404).json({ msg: 'user not found' })
            }

            res.json({ msg: 'user deleted successfully' })
        } catch (error) {
            console.error('error deleting user', error)
            res.status(500).json({ msg: error.msg })
        }
    },
    updateUserProfile: async (req, res) => {
        try {
            const { firstname, lastname, mobile, profilePhoto } = req.body

            const user = await Users.findById(req.user.id)

            if (firstname) user.firstname = firstname
            if (lastname) user.lastname = lastname
            if (mobile) user.mobile = mobile
            if (profilePhoto) user.profilePhoto = profilePhoto

            await user.save()
            res.json({ msg: 'profile updated sucessfully' })
        } catch (error) {
            console.error('Error updating profile:', error)
            res.status(500).json({ msg: error.message })
        }
    },
    addToCart: async (req, res) => {
        try {
            const { productId, quantity } = req.body
            const userId = req.user.id

            let cartItem = await cartItem.findOne({ productId, quantity })
            if (cartItem) {
                cartItem.quantity += quantity
            } else {
                cartItem = new CartTiem({ productId, userId, quantity })
            }

            await CartItem.save()
            res.status(201).json({ msg: 'Product added to cart successfully' });

        } catch (error) {
            console.error('Error adding to cart:', error);
            res.status(500).json({ msg: error.message });
        }
    },
    removeFromCart: async (req, res) => {
        try {
            const { productId } = req.body
            const userId = req.user.id

            await CartItem.deleteOne({ userId, productId })
            res.status(201).json({ msg: 'item removed from cart successfully' })


        } catch (error) {
            console.error('Error removing from cart:', error);
            res.status(500).json({ msg: error.message });
        }
    },
    getCart: async (req, res) => {
        try {
            const userId = req.user.id

            const cartItems = await CartItem.find({ userId }).populate('productId')
            res.json(cartItems)

        } catch (error) {
            console.error('Error getting cart:', error);
            res.status(500).json({ msg: error.message });
        }
    },
    addToWishlist: async (req, res) => {
        try {
            const { productId } = req.body
            const userId = req.user.id

            let wishlistItem = await Wishlist.findOne({ productId, userId })
            if (!wishlistItem) {
                wishlistItem = new wishlistItem({ productId, userId })
                await wishlistItem.save()
            }

            res.status(201).json({ msg: 'Product added to wishlist successfully' });
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            res.status(500).json({ msg: error.message });
        }
    },
    removeFromWishlist: async (req, res) => {
        try {
            const { productId } = req.body
            const userId = req.user.id

            await Wishlist.deleteOne({ productId, userId })
            res.json({ msg: 'Product removed from wishlist successfully' });
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            res.status(500).json({ msg: error.message });
        }
    },
    getWishlist: async (req, res) => {
        try {
            const user = await Users.findById(req.user.id).populate('wishlist')
            res.json(user.wishlist)
        } catch (error) {
            console.error('Error getting wishlist:', error);
            res.status(500).json({ msg: error.message });
        }
    },
    updateAddress: async (req, res) => {
        try {
            const { country, county, town, building } = req.body
            const userId = req.user.id

            let address = await Address.findOne({ userId })
            if (address) {
                address.country = country;
                address.county = county;
                address.town = town;
                address.building = building;

            } else {
                address = new Address({ userId, country, county, town, building })
            }

            await address.save()
            res.json({ msg: 'Address updated successfully' });
        } catch (error) {
            console.error('Error updating address:', error);
            res.status(500).json({ msg: error.message });

        }
    },
    getAddress: async (req, res) => {
        try {
            const userId = req.user.id
            const address = await Address.findOne({ userId })
            res.json(address)
        } catch (error) {
            console.error('error fetchig address', error)
            return res.status(500).json({ msg: error.msg })
        }
    },
    getReviews: async (req, res) => {
        try {
            const { productId } = req.body

            const reviews = await Review.find({ productId }).populate('user', 'name')
            res.json(reviews)

        } catch (error) {
            console.error('Error fetching reviews:', error);
            res.status(500).json({ msg: error.message });
        }
    },
    addReview: async (req, res) => {
        try {
            const { productId, review, rating } = req.body
            const userId = req.user.id

            const newReview = new Review({
                userId, productId, rating, review
            })

            await newReview.save()
            res.status(201).json({ msg: 'review added successfully' })
        } catch (error) {
            console.error('Error adding review:', error);
            res.status(500).json({ msg: error.message });
        }
    },
    updateReview: async (req, res) => {
        try {
            const { reviewId } = req.params
            const { rating, review } = req.body


            const updatedReview = await Review.findByIdAndUpdate(
                reviewId, { rating, review }, { new: true }
            )
            if (!updatedReview) {
                return res.status(404).json({ msg: 'Review not found' });
            }

            res.json({ msg: 'Review updated successfully', updatedReview });
        } catch (error) {
            console.error('Error updating review:', error);
            res.status(500).json({ msg: error.message });
        }
    },
    deleteReview: async (req, res) => {
        try {
            const { reviewId } = req.params
            const deletedReview = await Review.findByIdAndDelete(reviewId)
            if (!deletedReview) {
                return res.status(404).json({ msg: 'Review not found' });
            }
            res.json({ msg: 'Review deleted successfully' });
        } catch (error) {
            console.error('Error deleting review:', error);
            res.status(500).json({ msg: error.message });
        }
    },
    addProduct: async (req, res) => {
        try {
            const { name, category, description, price, stock } = req.body
            const newProduct = new Product({
                name, category, description, price, stock
            })

            await newProduct.save()
            res.status(201).json({ msg: 'Product added successfully', newProduct });
        } catch (error) {
            console.error('Error adding product:', error);
            res.status(500).json({ msg: error.message });
        }
    },
    getProducts: async (req, res) => {
        try {
            const products = await Product.find()
            res.json(products)
        } catch (error) {
            console.error('Error fetching products:', error);
            res.status(500).json({ msg: error.message });
        }
    },
    getProductById: async (req, res) => {
        try {
            const productId = req.params
            const product = await Product.findById(productId)
            if (!product) {
                return res.status(404).json({ msg: 'Product not found' });
            }
            res.json(product)

        } catch (error) {
            console.error('Error fetching product:', error);
            res.status(500).json({ msg: error.message });
        }
    },
    updateProduct: async (req, res) => {
        try {
            const productId = req.params
            const { price, category, name, description, stock } = req.body

            const updatedProduct = await Product.findbByAndUpdate(
                productId, { price, category, name, description, stock }, { new: true }
            )
            if (!updatedProduct) {
                return res.status(404).json({ msg: 'Product not found' });
            }

            res.json({ msg: 'Product updated successfully', updatedProduct });

        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({ msg: error.message });
        }
    },
    deleteProduct: async (req, res) => {
        try {
            const productId = req.params
            const deletedProduct = await Product.findByIdAndDelete(productId)

            if (!deletedProduct) {
                return res.status(404).json({ msg: 'Product not found' });
            }

            res.json({ msg: 'Product deleted successfully' });

        } catch (error) {
            console.error('Error deleting product:', error);
            res.status(500).json({ msg: error.message });
        }
    }

}
module.exports = userCtrl