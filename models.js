const mongoose = require('mongoose')

const product = new mongoose.Schema({
    productName: String,
    price: Number,
    pieces: Number,
    isBestArchive: Boolean
})


const user = new mongoose.Schema({
    name: String,
    username: String,
    password: String,
    loginToken: String,
    email: String,
    role: String
})

const Product = mongoose.model('products', product)
const User = mongoose.model('users', user)

module.exports = { Product, User }
