const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    name: { type: String, required: true, maxlength: 100 },
    price: { 
        type: mongoose.Schema.Types.Decimal128, 
        required: true,
        get: v => parseFloat(v.toString())
    },
    size: { type: String, required: true, maxlength: 50 },
    description: { type: String, required: true },
    gender: { type: String, enum: ['Unisex', 'Male', 'Female'], required: true },
    age: { type: String, enum: ['Kids', 'Adults', 'All Ages'], required: true },
    type: {
        type: String,
        enum: [
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
        required: true,
    }, 
    image: { type: String, required: true },
});

productSchema.set('toJSON', { getters: true });

module.exports = mongoose.model('Product', productSchema);
