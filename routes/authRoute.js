const express = require('express')
const router = express.Router()
const userCtrl = require('../controller/userCtrl')
const authMiddleware = require('../middlewares/authHandler')

router.post('/register', userCtrl.register)
router.post('/login', userCtrl.login)
router.put('/profile', authMiddleware.verifyUser, userCtrl.updateUserProfile)

router.get('/users', authMiddleware.verifyAdmin, userCtrl.getUsers)
router.put('/user/role', authMiddleware.verifyAdmin, userCtrl.updateUserRole)
router.delete('/user/:userId', authMiddleware.verifyAdmin, userCtrl.deleteUser)

//Cart Operations
router.get('/cart', authMiddleware.verifyUser, userCtrl.getCart)
router.get('/cart/:productId', authMiddleware.verifyUser, userCtrl.getCartObjectById)
router.post('/cart', authMiddleware.verifyUser, userCtrl.addToCart)
router.delete('/cart', authMiddleware.verifyUser, userCtrl.removeFromCart)

//Wishlist Operations
router.get('/wishlist', authMiddleware.verifyUser, userCtrl.getWishlist)
router.post('/wishlist', authMiddleware.verifyUser, userCtrl.addToWishlist)
router.delete('/wishlist', authMiddleware.verifyUser, userCtrl.removeFromWishlist)

//Address Operations
router.get('/address', authMiddleware.verifyUser, userCtrl.getAddress)
router.put('/address', authMiddleware.verifyUser, userCtrl.updateAddress)

//Reviews
router.post('/review', authMiddleware.verifyUser, userCtrl.addReview)
router.get('/reviews/:productId', userCtrl.getReviews);
router.put('/review/:reviewId', authMiddleware.verifyUser, userCtrl.updateReview);
router.delete('/review/:reviewId', authMiddleware.verifyUser, userCtrl.deleteReview);

//Products
router.get('/products', userCtrl.getProducts);
router.get('/product/:productId', userCtrl.getProductById);

// Admin Routes
router.post('/product', authMiddleware.verifyAdmin, userCtrl.addProduct);
router.put('/product/:productId', authMiddleware.verifyAdmin, userCtrl.updateProduct);
router.delete('/product/:productId', authMiddleware.verifyAdmin, userCtrl.deleteProduct);

module.exports = router