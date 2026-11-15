require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemPrompt = `You are a smart tourist guide chatbot for Morocco.`;

async function run() {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      systemInstruction: systemPrompt
    });
    const result = await model.generateContent("Quels sont les meilleurs hôtels?");
    console.log("SUCCESS:");
    console.log(result.response.text());
  } catch (e) {
    console.error("ERROR CAUGHT:");
    console.error(e);
  }
}

run();
