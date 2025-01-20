const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const mongoose = require('mongoose');


router.use((req, res, next) => {
    if (!req.session || req.session.role !== 'admin') {
        return res.redirect('/auth'); 
    }
    next();
});


router.get('/', async (req, res) => {
    try {
        
        const products = await Product.find().sort({ type: 1, name: 1 });

        const groupedProducts = products.reduce((group, product) => {
            (group[product.type] = group[product.type] || []).push(product);
            return group;
        }, {});

    
        res.render('admin', { adminName: req.session.username || 'Admin', products: groupedProducts });
    } catch (err) {
        console.error('Error loading admin dashboard:', err);
        res.status(500).send('Error loading admin dashboard. Please try again later.');
    }
});



router.delete('/delete-product/:id', async (req, res) => {
    try {
        const productId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid product ID." });
        }

        const deletedProduct = await Product.findByIdAndDelete(productId);

        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found." });
        }

        return res.status(200).json({ message: "Product deleted successfully." });
    } catch (err) {
        console.error("Error deleting product:", err);
        return res.status(500).json({ message: "An error occurred while deleting the product." });
    }
});



router.get('/add-product', (req, res) => {
    res.render('add-product', {
        adminName: req.session.username || 'Admin',
        message: null,
    });
});
router.get('/add-product', (req, res) => {
    console.log('Navigated to Add Product Page');
    res.render('add-product', {
        adminName: req.session.username || 'Admin',
        message: null,
    });
});
router.get('/add-product', (req, res) => {
    try {
        res.render('add-product', {
            adminName: req.session.username || 'Admin',
            message: null,
        });
    } catch (err) {
        console.error('Error rendering add-product page:', err);
        res.status(500).send('Internal Server Error');
    }
});



// Route to add a new product
router.post('/add-product', async (req, res) => {
    try {
        const { name, price, size, description, gender, age, type, image } = req.body;

        // Validate required fields
        if (!name || !price || !size || !description || !gender || !age || !type || !image) {
            return res.status(400).render('add-product', {
                adminName: req.session.username || 'Admin',
                message: { type: 'error', text: 'All fields are required.' },
            });
        }

        // Convert price to Decimal128
        const decimalPrice = mongoose.Types.Decimal128.fromString(price.toString());

        // Validate enum fields
        const allowedGenders = ['Unisex', 'Male', 'Female'];
        const allowedAges = ['Kids', 'Adults', 'All Ages'];
        const allowedTypes = [
            'Tent (with stakes and guylines)',
            'Sleeping Bag (appropriate for the season)',
            'Sleeping Pad or Air Mattress',
            'Camping Stove (with fuel) & Cookware (pots, pans, utensils)',
            'Water Filter or Water Purification Tablets',
            'Headlamp or Flashlight (with extra batteries)',
            'First Aid Kit',
            'Sturdy Hiking Boots or Shoes',
            'Weather-Appropriate Clothing (layers, including a waterproof jacket and warm layers)',
            'Sunscreen and Insect Repellent',
            'Camping Clothes',
        ];

        if (!allowedGenders.includes(gender) || !allowedAges.includes(age) || !allowedTypes.includes(type)) {
            return res.status(400).render('add-product', {
                adminName: req.session.username || 'Admin',
                message: { type: 'error', text: 'Invalid value for gender, age, or type.' },
            });
        }

        // Create a new product
        const newProduct = new Product({
            name,
            price: decimalPrice,
            size,
            description,
            gender,
            age,
            type,
            image,
        });

        // Save to database
        await newProduct.save();

        // Redirect or render success message
        res.render('add-product', {
            adminName: req.session.username || 'Admin',
            message: { type: 'success', text: 'Product added successfully!' },
        });
    } catch (err) {
        console.error('Error adding product:', err.message);
        res.status(500).render('add-product', {
            adminName: req.session.username || 'Admin',
            message: { type: 'error', text: 'An error occurred while adding the product. Please try again.' },
        });
    }
});


router.get('/modify-product/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).render('error', {
                title: 'Error',
                message: 'Product not found.',
            });
        }

        const allowedTypes = [
            'Tent (with stakes and guylines)',
            'Sleeping Bag (appropriate for the season)',
            'Sleeping Pad or Air Mattress',
            'Camping Stove (with fuel) & Cookware (pots, pans, utensils)',
            'Water Filter or Water Purification Tablets',
            'Headlamp or Flashlight (with extra batteries)',
            'First Aid Kit',
            'Sturdy Hiking Boots or Shoes',
            'Weather-Appropriate Clothing (layers, including a waterproof jacket and warm layers)',
            'Sunscreen and Insect Repellent',
            'Camping Clothes',
        ];

        res.render('modify-product', {
            adminName: req.session.username || 'Admin',
            product,
            allowedTypes,
            message: null,
        });
    } catch (error) {
        console.error('Error fetching product data:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to fetch product data. Please try again later.',
        });
    }
});


router.post('/modify-product/:id', async (req, res) => {
    const productId = req.params.id;
    const { name, price, size, description, gender, age, type, image } = req.body;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).render('error', {
                title: 'Error',
                message: 'Product not found.',
            });
        }

        product.name = name;
        product.price = price;
        product.size = size;
        product.description = description;
        product.gender = gender;
        product.age = age;
        product.type = type;
        product.image = image;

        await product.save();

        res.redirect('/admin');
    } catch (error) {
        console.error('Error updating product:', error);
        res.render('modify-product', {
            adminName: req.session.username || 'Admin',
            product: req.body,
            allowedTypes: [
                'Tent (with stakes and guylines)',
                'Sleeping Bag (appropriate for the season)',
                'Sleeping Pad or Air Mattress',
                'Camping Stove (with fuel) & Cookware (pots, pans, utensils)',
                'Water Filter or Water Purification Tablets',
                'Headlamp or Flashlight (with extra batteries)',
                'First Aid Kit',
                'Sturdy Hiking Boots or Shoes',
                'Weather-Appropriate Clothing (layers, including a waterproof jacket and warm layers)',
                'Sunscreen and Insect Repellent',
                'Camping Clothes',
            ],
            message: { type: 'error', text: 'Failed to update product. Please try again.' },
        });
    }
});

module.exports = router;
