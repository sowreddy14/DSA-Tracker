require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const dsaRoutes = require('./routes/dsaRoutes');

const app = express();

// Initialize Database connection engine
connectDB();

app.use(cors({ origin: '*' }));
app.use(express.json());

// Main Router Endpoint Mapping
app.use('/api/modules', dsaRoutes);

app.use((req, res) => {
    res.status(404).json({ error: 'Requested routing endpoint destination invalid' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Application core live running on port: ${PORT}`));