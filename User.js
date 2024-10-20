const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true }, // Ensure email is unique
    department: String,
    stage: String,
    password: String,
});

// Use 'UserSchema' during export
module.exports = mongoose.model('User', UserSchema, 'users');
