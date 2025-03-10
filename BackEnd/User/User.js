const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

mongoose.connect('mongodb://localhost:27017/Journal')
    .then(() => console.log('mongodb://localhost:27017/Journal'))
    .catch(err => console.log(err));

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    Journal: {type: Array, default: []},
    folders: {type: Array, default: [{title: 'Personal', id: '1'}, {title: 'Work', id: '2'}]},
});

module.exports = mongoose.model('User', UserSchema);