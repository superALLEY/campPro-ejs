const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Admin = require('../models/admin');
const bcrypt = require('bcrypt');

// Middleware to check admin authentication
router.use((req, res, next) => {
    if (!req.session || req.session.role !== 'admin') {
        return res.redirect('/auth'); // Redirect to authentication if not admin
    }
    next();
});

// Show Users and Admins
router.get('/', async (req, res) => {
    try {
        const admins = await Admin.find().sort({ username: 1 });
        const users = await User.find().sort({ username: 1 });

        res.render('users', {
            adminName: req.session.username || 'Admin',
            admins,
            users,
        });
    } catch (error) {
        console.error('Error fetching users and admins:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Error loading users and admins. Please try again later.',
        });
    }
});

// Render Add User/Admin Form
router.get('/add-user', (req, res) => {
    res.render('add-user', {
        adminName: req.session.username || 'Admin',
        message: null,
    });
});

// Handle Adding User or Admin
router.post('/add-user', async (req, res) => {
    const { role, username, password, email } = req.body;

    if (!role || !username || !password || !email) {
        return res.render('add-user', {
            adminName: req.session.username || 'Admin',
            message: { type: 'error', text: 'All fields are required.' },
        });
    }

    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        const existingAdmin = await Admin.findOne({ $or: [{ username }, { email }] });

        if (existingUser || existingAdmin) {
            return res.render('add-user', {
                adminName: req.session.username || 'Admin',
                message: { type: 'error', text: 'Username or email already exists.' },
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        if (role === 'admin') {
            const newAdmin = new Admin({ username, email, password: hashedPassword });
            await newAdmin.save();
        } else if (role === 'user') {
            const newUser = new User({ username, email, password: hashedPassword });
            await newUser.save();
        } else {
            return res.render('add-user', {
                adminName: req.session.username || 'Admin',
                message: { type: 'error', text: 'Invalid role selected.' },
            });
        }

        res.render('add-user', {
            adminName: req.session.username || 'Admin',
            message: { type: 'success', text: `${role.charAt(0).toUpperCase() + role.slice(1)} added successfully!` },
        });
    } catch (error) {
        console.error('Error adding user/admin:', error.message);
        res.render('add-user', {
            adminName: req.session.username || 'Admin',
            message: { type: 'error', text: 'An error occurred while adding the user/admin. Please try again.' },
        });
    }
});

// Handle Admin Deletion
router.post('/delete-admin', async (req, res) => {
    const { admin_id } = req.body;

    if (!admin_id) {
        return res.status(400).render('error', {
            title: 'Error',
            message: 'Admin ID is required.',
        });
    }

    try {
        const deletedAdmin = await Admin.findByIdAndDelete(admin_id);

        if (!deletedAdmin) {
            return res.status(404).render('error', {
                title: 'Error',
                message: 'Admin not found.',
            });
        }

        res.redirect('/admin/users');
    } catch (error) {
        console.error('Error deleting admin:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Error deleting admin. Please try again later.',
        });
    }
});

// Handle User Deletion
router.post('/delete-user', async (req, res) => {
    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).render('error', {
            title: 'Error',
            message: 'User ID is required.',
        });
    }

    try {
        const deletedUser = await User.findByIdAndDelete(user_id);

        if (!deletedUser) {
            return res.status(404).render('error', {
                title: 'Error',
                message: 'User not found.',
            });
        }

        res.redirect('/admin/users');
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Error deleting user. Please try again later.',
        });
    }
});

// Render Modify Admin Page
router.get('/modify-admin/:id', async (req, res) => {
    const adminId = req.params.id;

    try {
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).render('error', {
                title: 'Error',
                message: 'Admin not found.',
            });
        }

        res.render('modify-admin', {
            adminName: req.session.username || 'Admin',
            admin,
            message: null,
        });
    } catch (error) {
        console.error('Error fetching admin data:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to fetch admin data. Please try again later.',
        });
    }
});

// Handle Modify Admin Form Submission
router.post('/modify-admin/:id', async (req, res) => {
    const adminId = req.params.id;
    const { username, email, password } = req.body;

    try {
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).render('error', {
                title: 'Error',
                message: 'Admin not found.',
            });
        }

        admin.username = username;
        admin.email = email;

        if (password && password.trim()) {
            admin.password = await bcrypt.hash(password, 10);
        }

        await admin.save();
        res.redirect('/admin/users');
    } catch (error) {
        console.error('Error updating admin:', error);
        res.render('modify-admin', {
            adminName: req.session.username || 'Admin',
            admin: { _id: adminId, username, email },
            message: { type: 'error', text: 'Failed to update admin. Please try again.' },
        });
    }
});
router.get('/modify-user/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).render('error', {
                title: 'Error',
                message: 'User not found.',
            });
        }

        res.render('modify-user', {
            adminName: req.session.username || 'Admin',
            user,
            message: null,
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to fetch user data. Please try again later.',
        });
    }
});

// Handle Modify User Form Submission
router.post('/modify-user/:id', async (req, res) => {
    const userId = req.params.id;
    const { username, email, password } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).render('error', {
                title: 'Error',
                message: 'User not found.',
            });
        }

        // Update user fields
        user.username = username;
        user.email = email;

        // Only update password if provided
        if (password && password.trim()) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();

        // Redirect back to user list
        res.redirect('/admin/users');
    } catch (error) {
        console.error('Error updating user:', error);
        res.render('modify-user', {
            adminName: req.session.username || 'Admin',
            user: { _id: userId, username, email }, // Preserve form data
            message: { type: 'error', text: 'Failed to update user. Please try again.' },
        });
    }
}); 
module.exports = router;
