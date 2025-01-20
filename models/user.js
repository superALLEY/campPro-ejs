    const mongoose = require('mongoose');

    const userSchema = new mongoose.Schema({

        username: { type: String, required: true, unique: true, maxlength: 50 },
        password: { type: String, required: true },
        email: { type: String, required: true, unique: true, maxlength: 100 },
    });

    module.exports = mongoose.model('User', userSchema);
