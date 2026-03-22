 const fileUpload = require('express-fileupload');
const fetch = require('node-fetch');
const FormData = require('form-data');

module.exports = async (req, res) => {
  await fileUpload({ createParentPath: true })(req, res, async (err) => {
    if (err) return res.status(500).send('Upload error');

    const file = req.files.pdf;
    const password = req.body.password || '12345';

    const formData = new FormData();
    formData.append('file', file.data, file.name);
    formData.append('password', password);

    try {
      const response = await fetch('https://api.ilovepdf.com/v1/protect', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.ILOVEPDF_KEY}` },
        body: formData
      });
      if (!response.ok) throw new Error('API error');
      const buffer = await response.buffer();
      res.setHeader('Content-Disposition', 'attachment; filename=protected.pdf');
      res.send(buffer);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error protecting PDF');
    }
  });
};
