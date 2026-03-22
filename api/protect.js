 const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch');
const FormData = require('form-data');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Replace this with your actual Public Key from iLovePDF Dashboard
const PUBLIC_KEY = process.env.ILOVEPDF_PUBLIC_KEY; 

app.post('/api/protect', upload.single('pdf'), async (req, res) => {
    try {
        const file = req.file;
        const password = req.body.password;

        if (!file || !password) return res.status(400).send('Missing file or password');

        // STEP 1: Start a 'protect' task
        const startRes = await fetch(`https://api.ilovepdf.com/v1/start/protect`, {
            headers: { 'Authorization': `Bearer ${PUBLIC_KEY}` }
        });
        const { task, server } = await startRes.json();

        // STEP 2: Upload the file to iLovePDF server
        const uploadData = new FormData();
        uploadData.append('task', task);
        uploadData.append('file', file.buffer, { filename: file.originalname });

        const uploadRes = await fetch(`https://${server}/v1/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${PUBLIC_KEY}` },
            body: uploadData
        });
        const { server_filename } = await uploadRes.json();

        // STEP 3: Process the protection (Set the password)
        const processData = new FormData();
        processData.append('task', task);
        processData.append('tool', 'protect');
        processData.append('files[0][server_filename]', server_filename);
        processData.append('files[0][filename]', file.originalname);
        processData.append('password', password);

        await fetch(`https://${server}/v1/process`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${PUBLIC_KEY}` },
            body: processData
        });

        // STEP 4: Download the finished PDF
        const downloadRes = await fetch(`https://${server}/v1/download/${task}`, {
            headers: { 'Authorization': `Bearer ${PUBLIC_KEY}` }
        });

        const buffer = await downloadRes.buffer();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=protected_${file.originalname}`);
        res.send(buffer);

    } catch (error) {
        console.error('iLovePDF Error:', error);
        res.status(500).send('API Error: ' + error.message);
    }
});

module.exports = app;
