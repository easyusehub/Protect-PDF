 const express = require('express');
const fileUpload = require('express-fileupload');
const fetch = require('node-fetch');
const FormData = require('form-data');

const router = express.Router();
const API_KEY = process.env.ILOVEPDF_PUBLIC_KEY; // ILovePDF secret key

router.post('/', async (req, res) => {
    if (!req.files || !req.files.pdf) return res.status(400).send('No file uploaded');

    const file = req.files.pdf;
    const password = req.body.password;

    const formData = new FormData();
    formData.append('file', file.data, file.name);
    formData.append('password', password);

    try {
        const response = await fetch('https://api.ilovepdf.com/v1/protect', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${API_KEY}` },
            body: formData
        });

        if (!response.ok) throw new Error('API error');

        const buffer = await response.buffer();
        res.setHeader('Content-Disposition', 'attachment; filename=protected.pdf');
        res.send(buffer);
    } catch (err) {
        res.status(500).send('Error protecting PDF');
    }
});

module.exports = router;
