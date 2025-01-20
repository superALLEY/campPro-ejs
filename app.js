
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');
const authRoutes = require('./routes/authRoutes'); 
const adminRoutes = require('./routes/adminRoutes'); 
const userRoutes = require('./routes/userRoutes'); 



const userpageRoutes = require('./routes/userpageRoutes'); 


dotenv.config();


const app = express();


app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(express.static(path.join(__dirname, 'public'))); 
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});
const productRoutes = require('./routes/products'); 
app.use('/', productRoutes);

app.use(
    session({
        secret: process.env.SESSION_SECRET || 'temporary-key', 
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: process.env.NODE_ENV === 'production', 
            httpOnly: true, 
        },
    })
);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


mongoose.set('strictQuery', true);


mongoose
    .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/CampProDB', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('Connected to MongoDB successfully');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err.message);
    });


app.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
});


app.get('/about', (req, res) => {
    res.render('about', { title: 'About Us' }); 
});


app.get('/contact', (req, res) => {
    res.render('contact', { messageStatus: null, title: 'Contact Us' }); 
});

app.post('/contact', (req, res) => {
    const { name, email, subject, message } = req.body;


    if (!name || !email || !subject || !message) {
        return res.render('contact', {
            messageStatus: { type: 'error', text: 'All fields are required. Please fill out the form completely.' },
            title: 'Contact Us',
        });
    }

   
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.render('contact', {
            messageStatus: { type: 'error', text: 'Invalid email address. Please enter a valid email.' },
            title: 'Contact Us',
        });
    }

    
    console.log(`Message received from ${name} (${email}): Subject: ${subject}, Message: ${message}`);

  
    res.render('contact', {
        messageStatus: { type: 'success', text: 'Message sent successfully! We will get back to you soon.' },
        title: 'Contact Us',
    });
});


app.use('/auth', authRoutes);


app.use('/admin', adminRoutes);


app.use('/admin/users', userRoutes);
app.use('/user', userpageRoutes); 
app.use('/cart',userpageRoutes);






app.use((req, res) => {
    res.status(404).render('404', { title: '404 - Page Not Found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
