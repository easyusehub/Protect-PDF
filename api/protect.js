import fetch from "node-fetch";
import FormData from "form-data";

export const config = { api: { bodyParser: false } };

export default async function handler(req,res){
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});

  try{
    const apiKey = process.env.ILOVEPDF_SECRET_KEY;
    if(!apiKey) return res.status(500).json({error:"API key missing"});

    const data = await new Promise((resolve,reject)=>{
      const chunks = [];
      req.on("data",chunk=>chunks.push(chunk));
      req.on("end",()=>resolve(Buffer.concat(chunks)));
      req.on("error",err=>reject(err));
    });

    const form = new FormData();
    form.append("file", data, { filename:"file.pdf", contentType:"application/pdf" });
    form.append("password", req.body.password || "1234");

    const apiResponse = await fetch("https://api.ilovepdf.com/v1/protect", {
      method:"POST",
      headers: { Authorization:`Bearer ${apiKey}` },
      body: form
    });

    if(!apiResponse.ok) throw new Error("ILovePDF API error");

    const buffer = await apiResponse.arrayBuffer();
    res.setHeader("Content-Type","application/pdf");
    res.send(Buffer.from(buffer));
  }catch(e){
    console.error(e);
    res.status(500).json({error:e.message});
  }
}
