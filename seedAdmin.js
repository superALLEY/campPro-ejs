const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Admin = require('./models/admin'); // Adjust the path if necessary

// MongoDB URI
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/CampProDB';

const seedAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Hash the password
        const hashedPassword = await bcrypt.hash('24042004', 10);

        // Create a new admin
        const admin = new Admin({
            id: 1, // Unique ID
            username: 'Mohamed Ali Inouri', // Admin username
            email: 'mohamed.ali.inouri@gmail.com', // Admin email
            password: hashedPassword, // Hashed password
        });

        // Save the admin to the database
        await admin.save();
        console.log('Admin "Mohamed Ali Inouri" created successfully');
    } catch (err) {
        console.error('Error seeding admin:', err.message);
    } finally {
        // Disconnect from MongoDB
        mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

seedAdmin();
