// /api/protect.js
const fetch = require('node-fetch');
const FormData = require('form-data');

const API_KEY = 'YOUR_ILOVEPDF_API_KEY'; // ILovePDF API Key

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const file = req.body.pdf;
  const password = req.body.password;

  if (!file || !password) return res.status(400).send('File or password missing');

  const formData = new FormData();
  formData.append('file', Buffer.from(file, 'base64'), 'file.pdf');
  formData.append('password', password);

  try {
    const response = await fetch('https://api.ilovepdf.com/v1/protect', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${API_KEY}` },
      body: formData
    });

    const buffer = await response.arrayBuffer();
    res.setHeader('Content-Disposition', 'attachment; filename=protected.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).send('Error protecting PDF');
  }
}
