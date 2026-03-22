const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');

const app = express();
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB max
}));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// API route
const protectRouter = require('./api/protect');
app.use('/api/protect', protectRouter);

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'protect.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
