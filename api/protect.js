import { PDFDocument } from "pdf-lib";
import formidable from "formidable";

export const config = { api: { bodyParser: false } };

export default async function handler(req,res){
    if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});

    try{
        const form = new formidable.IncomingForm();
        form.parse(req, async (err, fields, files) => {
            if(err) return res.status(500).json({error:"Failed to parse file"});

            const password = fields.password;
            const file = files.file;

            if(!file || !password) return res.status(400).json({error:"File or password missing"});

            const fileBuffer = await fs.promises.readFile(file.filepath);
            const pdfDoc = await PDFDocument.load(fileBuffer);

            pdfDoc.encrypt({ password });

            const pdfBytes = await pdfDoc.save();

            res.setHeader("Content-Type","application/pdf");
            res.send(Buffer.from(pdfBytes));
        });
    }catch(e){
        console.error(e);
        res.status(500).json({error:e.message});
    }
}
