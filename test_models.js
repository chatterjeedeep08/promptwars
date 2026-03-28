import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

const keyMatch = fs.readFileSync('.env', 'utf8').match(/VITE_GEMINI_API_KEY="?(.*?)"?$/m);
const key = keyMatch ? keyMatch[1] : '';

async function run() {
  const genAI = new GoogleGenerativeAI(key);
  try {
     const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
     const data = await response.json();
     console.log(data.models.map(m => m.name).join('\n'));
  } catch (e) {
     console.error(e);
  }
}
run();
