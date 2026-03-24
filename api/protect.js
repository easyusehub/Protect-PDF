import fetch from "node-fetch";
import FormData from "form-data";

export const config = { api: { bodyParser: false } };

export default async function handler(req,res){
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});

  try{
    const secretKey = process.env.ILOVEPDF_SECRET_KEY;
    if(!secretKey) return res.status(500).json({error:"API key missing"});

    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    const form = new FormData();
    form.append("file", buffer, { filename:"file.pdf", contentType:"application/pdf" });
    form.append("password", req.headers["password"] || "1234"); // optional default

    const apiResponse = await fetch("https://api.ilovepdf.com/v2/protect", {
      method:"POST",
      headers: { Authorization:`Bearer ${secretKey}` },
      body: form
    });

    if(!apiResponse.ok) throw new Error("ILovePDF API error");

    const resultBuffer = await apiResponse.arrayBuffer();
    res.setHeader("Content-Type","application/pdf");
    res.send(Buffer.from(resultBuffer));
  }catch(e){
    console.error(e);
    res.status(500).json({error:e.message});
  }
}
