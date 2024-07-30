const mongoose = require('mongoose')
const User = require('../models/userModel')
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
            const { email, password, firstname, lastname, mobile, role } = req.body

            if (!email || !password || !firstname || !lastname || !mobile) {
                return res.status(400).json({ msg: 'please enter all fields' })
            }

            const user = await User.findOne({ email })
            if (user) {
                return res.status(400).json({ msg: 'user already exists' })
            }

            if (password < 6) {
                return res.status(400).json({ msg: 'password cannot be less than 6 characters' })
            }

            const passwordHash = await bcrypt.hash(password, 12)

            const newUser = new User({
                email, lastname, firstname, password: passwordHash, mobile, role: role || 'user'
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

            const user = await User.findOne({ email })
            if (!user) {
                return res.status(400).json({ msg: 'user does not exist' })
            }

            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) {
                return res.status(400).json({ msg: 'invalid credentials' })
            }

            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '3hrs' })
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
            const users = await User.find()
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

            const user = await User.findById(userId)
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

            const user = await User.findByIdAndDelete(userId)
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

            const user = await User.findById(req.user.id)

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

            let cartItem = await CartItem.findOne({ productId, quantity })
            if (cartItem) {
                cartItem.quantity += quantity
            } else {
                cartItem = new CartItem({ productId, userId, quantity })
            }

            await cartItem.save()
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

            const cartItems = await CartItem.find({ userId }).populate('items.productId', { strictPopulate: false })
            res.json(cartItems)

        } catch (error) {
            console.error('Error getting cart:', error);
            res.status(500).json({ msg: error.message });
        }
    },
    getCartObjectById: async (req, res) => {
        try {
            const { productId } = req.params

            const cartItem = await CartItem.findById(productId)
            res.json(cartItem)
        } catch (error) {
            console.error('Error getting Item', error);
            res.status(500).json({ msg: error.message });
        }
    },
    addToWishlist: async (req, res) => {
        try {
            const { productId, userId } = req.body


            let wishlistItem = await Wishlist.findOne({ productId, userId })
            if (!wishlistItem) {
                wishlistItem = new Wishlist({ productId, userId })
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

            await Wishlist.findOneAndDelete({ productId, userId })
            res.json({ msg: 'Product removed from wishlist successfully' });
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            res.status(500).json({ msg: error.message });
        }
    },
    getWishlist: async (req, res) => {
        try {
            const userId = req.user.id
            console.log(`Fetching wishlist for userId: ${userId}`);
            const wishlistItem = await Wishlist.find({ userId: userId })
                //.populate('userId', 'lastname email') // Populate user details
                .populate('productId', 'name price'); // Populate product details
            console.log(`Wishlist items found: ${wishlistItem.length}`);
            res.json(wishlistItem)
        } catch (error) {
            console.error('Error getting wishlist:', error);
            res.status(500).json({ msg: error.message });
        }
    },
    updateWishlist: async (req, res) => {
        try {
            const wishlistId = req.params.wishlistId
            const updates = req.body

            const updatedWishlist = await Wishlist.findByIdAndUpdate(wishlistId, updates, { new: true })

            if (!updatedWishlist) {
                return res.status(404).json({ msg: 'Wishlist item not found' });
            }

            res.json({ msg: 'Wishlist item updated successfully', updatedWishlist });
        } catch (error) {
            console.error('Error updating wishlist item:', error);
            res.status(500).json({ msg: error.message });
        }
    },
    addAddress: async (req, res) => {
        try {
            const userId = req.user.id
            const { country, county, town, building } = req.body

            const newAddress = new Address({
                userId,
                country,
                county,
                town,
                building
            })

            await newAddress.save()
            res.status(201).json({ msg: 'Address added successfully', newAddress });
        } catch (error) {
            console.error('Error adding address:', error);
            res.status(500).json({ msg: error.message });
        }
    },
    updateAddress: async (req, res) => {
        try {
            const addressId = req.params.addressId
            const updates = req.body

            const updatedAddress = await Address.findByIdAndUpdate(addressId, updates, { new: true })
            if (!updatedAddress) {
                return res.status(404).json({ msg: 'Address not found' });
            }

            res.json({ msg: 'Address updated successfully', updatedAddress });
        } catch (error) {
            console.error('Error updating address:', error);
            res.status(500).json({ msg: error.message });

        }
    },
    getAddress: async (req, res) => {
        try {
            const userId = req.user.id
            const address = await Address.find({ userId })
            res.json({ address })
        } catch (error) {
            console.error('error fetchig address', error)
            return res.status(500).json({ msg: error.msg })
        }
    },
    getReviews: async (req, res) => {
        try {
            const { productId } = req.params;
            console.log(`Fetching reviews for productId: ${productId}`);

            const reviews = await Review.find({ productId }).populate('userId', 'firstname lastname');
            console.log(`Reviews found: ${reviews.length}`);
            res.json(reviews);
        } catch (error) {
            console.error('Error getting reviews:', error);
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
            const productId = req.params.productId
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
            const productId = req.params.productId
            //const { price, category, name, description, stock } = req.body

            const updatedProduct = await Product.findByIdAndUpdate(
                productId, req.body, { new: true }

            )
            if (!updatedProduct) {
                return res.status(404).json({ msg: 'Product not found for ID: ' + productId });
            }

            res.json({ msg: 'Product updated successfully', updatedProduct });

        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({ msg: error.message });
        }
    },
    deleteProduct: async (req, res) => {
        try {
            const productId = req.params.productId

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