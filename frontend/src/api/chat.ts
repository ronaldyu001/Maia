import axios from "axios";


// --- backend chat endpoint ---
const API_URL = 'http://127.0.0.1:8000/chat';


// --- API Call: Send Message ---
export async function sendMessage(message: string, session_id: string): Promise<string> {
  const res = await axios.post(API_URL, { message: message, session_id: session_id });
  return String(res.data.response);
}

