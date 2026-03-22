 const formidable = require('formidable');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

export const config = { api: { bodyParser: false } };

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files)=>{
    if(err) return res.status(500).send('Error parsing file');

    const password = fields.password;
    const pdfFile = files.pdf;
    if(!pdfFile) return res.status(400).send('No PDF file uploaded');

    try{
        const existingPdfBytes = fs.readFileSync(pdfFile.filepath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        pdfDoc.encrypt({ userPassword: password, ownerPassword: password, permissions: { printing: 'highResolution' } });
        const pdfBytes = await pdfDoc.save();

        res.setHeader('Content-Disposition','attachment; filename=protected.pdf');
        res.setHeader('Content-Type','application/pdf');
        res.send(Buffer.from(pdfBytes));
    } catch(e){
        res.status(500).send('Error processing PDF');
    }
  });
}
