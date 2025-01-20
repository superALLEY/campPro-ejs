const express = require('express');
const router = express.Router();
const Product = require('../models/product'); // Adjust path to your Product model

// GET: Fetch and display all products grouped by type
router.get('/discover', async (req, res) => {
    try {
        // Fetch all products and sort them by type and name
        const products = await Product.find().sort({ type: 1, name: 1 }).lean();

        // Group products by type
        const groupedProducts = products.reduce((acc, product) => {
            if (!acc[product.type]) acc[product.type] = [];
            acc[product.type].push(product);
            return acc;
        }, {});

        // Render the view with grouped products
        res.render('discover', { products: groupedProducts });
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
