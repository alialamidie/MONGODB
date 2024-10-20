const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const User = require('./User');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://localhost/userAuth', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected...'))
.catch(err => console.log('MongoDB connection error:', err));


app.post('/admin/users/create', async (req, res) => {
    const { email, department, stage, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).send('Account already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            email,
            department,
            stage,
            password: hashedPassword,
            status: 'not allowed',
        });

        await newUser.save();
        res.status(201).send('User created successfully');
    } catch (error) {
        res.status(500).send('Error creating user: ' + error.message);
    }
});


app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).send('Invalid email or password'); 
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send('Invalid email or password');
        }


        res.redirect(`/welcome.html?email=${encodeURIComponent(user.email)}`);
    } catch (error) {
        res.status(500).send('Error logging in: ' + error.message);
    }
});


const ADMIN_PASSCODE = 'your_secure_passcode'; 
app.post('/admin/login', async (req, res) => {
    const { passcode } = req.body;

    if (passcode !== ADMIN_PASSCODE) {
        return res.status(401).send('Invalid passcode');
    }


    res.redirect('/admin_dashboard.html');
});


app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).send('Error fetching users: ' + error.message);
    }
});


app.delete('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        await User.findByIdAndDelete(userId);
        res.status(204).send();
    } catch (error) {
        res.status(500).send('Error deleting user: ' + error.message);
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});