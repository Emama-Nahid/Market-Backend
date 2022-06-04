const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const http = require('http')
const morgan = require('morgan')
const { Product, User } = require('./models')

const app = express()
const LISTEN_PORT = 3000

// Mongoose DB Connection

const MONGO_CONNECTION_URI = process.env.MONGODB_CONN_URI || 'mongodb://localhost:27017/db'
mongoose.connect(MONGO_CONNECTION_URI, (err) => {
    if (err) {
        console.log("Couldn't connect to mongodb");
    }
})

app.use(morgan('combined'))
app.use(cors())
app.use(bodyParser.raw())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


// Authentication middleware. Checks for good tokens, otherwise returns Unauthorized (401)
const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).end(); // Unauthorized
    } else {
        const user = await User.findOne({ loginToken :token });
        console.log(user,token);
        if (!user) {
            return res.status(401).end(); // Unauthorized
        } else {
            next() // Good to go!
        }
    }
}


// Get all product
app.get('/products', async (req, res) => {
    const allProducts = await Product.find()
    return res.json(allProducts)
})

// Creates a new product
app.post('/create-product', authMiddleware, async (req, res) => {
    const { productName, price, pieces, isBestArchive } = req.body;

    Product.create({ productName, price, pieces, isBestArchive });

    return res.json({ status: 1 });
})

// Register a User
app.post('/user', async (req, res) => {
    const { name, username, password, email } = req.body;

    // Check if username already exist

    if (await User.findOne({ username })) {
        // Can't create user with duplicate username
        return res.json({ status: 0 });
    }

    const role = 'user';

    // Good to go
    User.create({ name, username, password, email, role })

    return res.json({ status: 1 });
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username, password })

    const crypt = require('crypto')

    const randomToken = crypt.randomUUID()

    if (user) {
        // assign a token
        user.loginToken = randomToken;
        await user.save()
        return res.json({ token: randomToken })
    }

    return res.status(400).send()
})

http.createServer(app).listen(LISTEN_PORT, () => {
    console.log('Listening at ', LISTEN_PORT);
})
