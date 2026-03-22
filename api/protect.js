import fetch from 'node-fetch';
import FormData from 'form-data';

const API_KEY = 'YOUR_ILOVEPDF_API_KEY'; // ILovePDF API Key

export default async function handler(req, res) {
    if(req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { pdf, password } = req.body;
    if(!pdf || !password) return res.status(400).send('Missing file or password');

    const formData = new FormData();
    formData.append('file', Buffer.from(pdf, 'base64'), 'file.pdf');
    formData.append('password', password);

    try {
        const response = await fetch('https://api.ilovepdf.com/v1/protect', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${API_KEY}` },
            body: formData
        });

        const buffer = await response.arrayBuffer();
        res.setHeader('Content-Disposition','attachment; filename=protected.pdf');
        res.setHeader('Content-Type','application/pdf');
        res.send(Buffer.from(buffer));
    } catch (err) {
        console.error(err);
        res.status(500).send('Error protecting PDF');
    }
}
