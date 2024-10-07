<<<<<<< HEAD
const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

// Replace with your actual MongoDB connection string
const mongoUri = 'mongodb+srv://myAtlasDBUser:myatlas-001@myatlasclusteredu.79wmt.mongodb.net/?retryWrites=true&w=majority&appName=myAtlasClusterEDU';

let db;

// Initialize MongoDB connection
MongoClient.connect(mongoUri, { useUnifiedTopology: true })
    .then((client) => {
        db = client.db('Sanggunian'); // Your database name
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB', err);
    });

// Serve static files like CSS, JS
app.use(express.static(path.join(__dirname)));

// Serve the index.html file when visiting the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Add routes to interact with MongoDB
app.get('/get-data', async (req, res) => {
    try {
        if (!db) {
            return res.status(500).send('Database not initialized.'); // Check if the database is connected
        }

        const collection = db.collection('oob'); // Use a string for the collection name
        const data = await collection.find().toArray();
        res.json(data);
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
=======
const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

// Replace with your actual MongoDB connection string
const mongoUri = 'mongodb+srv://myAtlasDBUser:myatlas-001@myatlasclusteredu.79wmt.mongodb.net/?retryWrites=true&w=majority&appName=myAtlasClusterEDU';

let db;

// Initialize MongoDB connection
MongoClient.connect(mongoUri, { useUnifiedTopology: true })
    .then((client) => {
        db = client.db('Sanggunian'); // Your database name
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB', err);
    });

// Serve static files like CSS, JS
app.use(express.static(path.join(__dirname)));

// Serve the index.html file when visiting the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Add routes to interact with MongoDB
app.get('/get-data', async (req, res) => {
    try {
        if (!db) {
            return res.status(500).send('Database not initialized.'); // Check if the database is connected
        }

        const collection = db.collection('oob'); // Use a string for the collection name
        const data = await collection.find().toArray();
        res.json(data);
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
>>>>>>> e848cf91a8e345524138656fefd95cfc020e1d87
