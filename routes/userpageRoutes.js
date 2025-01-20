const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/product');
const Cart = require('../models/cart');

// Middleware for checking user authentication
router.use((req, res, next) => {
    if (!req.session.username || req.session.role !== 'user') {
        return res.redirect('/'); // Redirect to login if not authenticated
    }
    next();
});

// GET: Display products
router.get('/', async (req, res) => {
    const userId = req.session.userId; // Retrieve userId from session
    const userName = req.session.username; // Retrieve userName from session

    try {
        const products = await Product.find().sort('type').exec();
        const groupedProducts = products.reduce((acc, product) => {
            if (!acc[product.type]) acc[product.type] = [];
            acc[product.type].push(product);
            return acc;
        }, {});

        res.render('user', { userName, userId, products: groupedProducts });
    } catch (error) {
        console.error('Error fetching products:', error.message);
        res.status(500).send('Server error');
    }
});


// POST: Handle Add to Cart Action
router.post('/add', async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.session.userId; // Access userId from session

    console.log('Add to Cart Request:', { userId, productId, quantity });

    try {
        if (!userId || !productId || !quantity) {
            console.log('Invalid request data');
            return res.status(400).json({ message: 'Invalid request data' });
        }

        if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(userId)) {
            console.log('Invalid ObjectId:', { productId, userId });
            return res.status(400).json({ message: 'Invalid product or user ID' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            console.log('Product not found:', productId);
            return res.status(404).json({ message: 'Product not found' });
        }

        const existingCartItem = await Cart.findOne({ user_id: userId, product_id: productId });
        if (existingCartItem) {
            existingCartItem.quantity += parseInt(quantity, 10);
            await existingCartItem.save();
            console.log('Updated cart item:', existingCartItem);
        } else {
            const newCartItem = await Cart.create({ user_id: userId, product_id: productId, quantity });
            console.log('Created new cart item:', newCartItem);
        }

        res.status(200).json({ message: 'Product added to cart' });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'Error adding product to cart' });
    }
});

// GET: Display cart items for a specific user ID
router.get('/cart/:id', async (req, res) => {
    const userId = req.params.id; // Retrieve user ID from URL

    try {
        // Fetch cart items and populate product details
        const cartItems = await Cart.find({ user_id: userId })
            .populate('product_id', 'name price image') // Ensure price, name, and image are populated
            .lean();

        // Debugging: Log cart items to verify structure
        console.log(cartItems);

        // Calculate total price with a fallback for price
        const totalPrice = cartItems.reduce((total, item) => {
            const price = item.product_id && item.product_id.price ? Number(item.product_id.price) : 0;
            return total + price * item.quantity;
        }, 0);

        // Render the cart page
        res.render('cart', {
            userName: req.session.username || 'Guest', // Fallback if username is not available
            userId,
            cartItems,
            totalPrice,
        });
    } catch (error) {
        console.error('Error fetching cart items:', error.message);
        res.status(500).send('Internal Server Error');
    }
});


router.post('/cart/update', async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.session.userId;

    console.log('Update request received:', { userId, productId, quantity });

    try {
        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
            console.log('Invalid userId or productId.');
            return res.status(400).json({ message: 'Invalid userId or productId' });
        }

        // Debug: Log all cart items for the user
        const userCart = await Cart.find({ user_id: mongoose.Types.ObjectId(userId) });
        console.log('All cart items for the user:', userCart);

        // Main query
        const query = {
            user_id: mongoose.Types.ObjectId(userId),
            product_id: mongoose.Types.ObjectId(productId),
        };

        console.log('Query being used:', query);

        const updatedCartItem = await Cart.findOneAndUpdate(
            query,
            { $set: { quantity } },
            { new: true } // Return the updated document
        );

        // If no cart item found, use the fallback query
        if (!updatedCartItem) {
            console.log('Cart item not found.');

            // Fallback query to check if product exists without user association
            const fallbackQuery = { product_id: mongoose.Types.ObjectId(productId) };
            const fallbackResult = await Cart.findOne(fallbackQuery);
            console.log('Fallback query result:', fallbackResult);

            return res.status(404).json({ message: 'Cart item not found' });
        }

        console.log('Cart item updated successfully:', updatedCartItem);
        res.status(200).json({ message: 'Cart item updated successfully', cartItem: updatedCartItem });
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ message: 'Error updating cart item' });
    }
});
router.post('/cart/remove', async (req, res) => {
    const { productId } = req.body;
    const userId = req.session.userId;

    console.log('Remove request received:', { userId, productId });

    try {
        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
            console.log('Invalid userId or productId.');
            return res.status(400).json({ message: 'Invalid userId or productId' });
        }

        // Debug: Log all cart items for the user
        const userCart = await Cart.find({ user_id: mongoose.Types.ObjectId(userId) });
        console.log('All cart items for the user:', userCart);

        // Main query
        const query = {
            user_id: mongoose.Types.ObjectId(userId),
            product_id: mongoose.Types.ObjectId(productId),
        };

        console.log('Query being used:', query);

        const deletedCartItem = await Cart.findOneAndDelete(query);

        // If no cart item found, use the fallback query
        if (!deletedCartItem) {
            console.log('Cart item not found.');

            // Fallback query to check if product exists without user association
            const fallbackQuery = { product_id: mongoose.Types.ObjectId(productId) };
            const fallbackResult = await Cart.findOne(fallbackQuery);
            console.log('Fallback query result:', fallbackResult);

            return res.status(404).json({ message: 'Cart item not found' });
        }

        console.log('Cart item removed successfully:', deletedCartItem);
        res.status(200).json({ message: 'Cart item removed successfully' });
    } catch (error) {
        console.error('Error removing cart item:', error);
        res.status(500).json({ message: 'Error removing cart item' });
    }
});




module.exports = router;
