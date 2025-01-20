const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('./models/user'); // Adjust the path if necessary

// MongoDB URI
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/CampProDB';

const seedUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Hash the password
        const hashedPassword = await bcrypt.hash('29092004', 10);

        // Create a new user
        const user = new User({
            username: 'Nourine', // User username
            email: 'nourine@gmail.com', // User email
            password: hashedPassword, // Hashed password
        });

        // Save the user to the database
        await user.save();
        console.log('User "Nourine" created successfully');
    } catch (err) {
        console.error('Error seeding user:', err.message);
    } finally {
        // Disconnect from MongoDB
        mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

seedUser();
