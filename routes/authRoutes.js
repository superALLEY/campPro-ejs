const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

const User = require('../models/user');
const Admin = require('../models/admin');


router.get('/', (req, res) => {
    res.render('auth', { errorMessage: null }); 
});


router.post('/', async (req, res) => {
    const { role, username, password } = req.body;

    if (!role || !username || !password) {
        return res.render('auth', { errorMessage: 'All fields are required.' });
    }

    try {
     
        const Model = role === 'admin' ? Admin : User;
        const user = await Model.findOne({ username });

        if (!user) {
            return res.render('auth', { errorMessage: 'Invalid username or password.' });
        }

     
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.render('auth', { errorMessage: 'Invalid username or password.' });
        }

        req.session.role = role;
        req.session.username = username;
        req.session.userId = user.id;

      
        if (role === 'admin') {
            return res.redirect('/admin');
        }
        return res.redirect('/user');
    } catch (err) {
        console.error('Error during login:', err.message);
        return res.render('auth', { errorMessage: 'An error occurred. Please try again later.' });
    }
});

module.exports = router;
