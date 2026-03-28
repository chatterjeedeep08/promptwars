import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Client } from "@googlemaps/google-maps-services-js";
import rateLimit from 'express-rate-limit';

// Polyfill for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load local .env (In production Cloud Run, variables are injected automatically)
dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  'https://bridgeai-439552689701.us-central1.run.app/'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json({ limit: '10mb' })); // Support large base64 image strings

// System Prompt for BridgeAI Engine
const SYSTEM_PROMPT = `You are BridgeAI, an advanced intent extraction and action planning system. Your job is to analyze any unstructured input (voice transcripts, text descriptions, image descriptions, or document content) and extract structured intent with actionable outputs.

You MUST respond with ONLY a valid JSON object. No markdown, no explanation, just the JSON.

The JSON must follow this exact schema:
{
  "intent": "<category: medical_emergency | disaster_response | legal_assistance | accident_response | medication_parsing | mental_health | infrastructure | general>",
  "urgency": "<critical | high | medium | low>",
  "confidence": <0.0 to 1.0>,
  "entities": {
    "subject": "<who is affected>",
    "symptoms_or_issues": ["<list of key issues>"],
    "location_hint": "<any location mentioned or null>",
    "time_sensitivity": "<immediate | urgent | scheduled | flexible>"
  },
  "risk_assessment": "<1-2 sentence risk summary>",
  "reasoning": "<2-3 sentence explanation of your decision>",
  "suggested_actions": ["<action_1>", "<action_2>", "<action_3>"],
  "safeguards_applied": ["<any safety checks or caveats noted>"],
  "data_verified": <true | false>
}

Examples of action strings: "call_emergency_services", "notify_family_contacts", "navigate_to_nearest_hospital", "dispatch_rescue_team", "parse_prescription", "connect_to_legal_aid", "monitor_vitals", "share_location".

Always prioritize human safety. For medical/disaster inputs, urgency should be at least "high". Be specific with entities. confidence should reflect genuine uncertainty.`;

const FEW_SHOT_EXAMPLES = `
Example 1:
Input: "My father suddenly grabbed his chest and fell down, he's barely breathing"
Output: {"intent":"medical_emergency","urgency":"critical","confidence":0.97,"entities":{"subject":"father","symptoms_or_issues":["chest pain","loss of consciousness","breathing difficulty"],"location_hint":null,"time_sensitivity":"immediate"},"risk_assessment":"Probable cardiac arrest or severe cardiac event. Every second matters — permanent damage or death possible within minutes.","reasoning":"Chest pain combined with collapse and breathing difficulty strongly indicates cardiac arrest or massive MI. Standard emergency triage protocol classifies this as STEMI-equivalent requiring immediate EMS response.","suggested_actions":["call_emergency_services","perform_cpr_guidance","notify_family_contacts","share_location","navigate_to_nearest_hospital"],"safeguards_applied":["human confirmation required before 911 call","CPR guidance provided with professional disclaimer"],"data_verified":false}

Example 2:
Input: "There's flooding in our neighborhood, water is up to my waist and rising"
Output: {"intent":"disaster_response","urgency":"critical","confidence":0.95,"entities":{"subject":"user and neighbors","symptoms_or_issues":["flash flooding","rising water levels","trapped"],"location_hint":null,"time_sensitivity":"immediate"},"risk_assessment":"Life-threatening flash flood scenario. Drowning risk escalates rapidly as water rises above waist level.","reasoning":"User reports active flooding with rising water indicating a dynamic emergency. Flash floods can rise to lethal levels in minutes. Standard disaster protocol requires immediate evacuation assistance.","suggested_actions":["dispatch_rescue_team","send_flood_alert","share_location","navigate_to_high_ground","notify_emergency_contacts"],"safeguards_applied":["location verification recommended","do not attempt to walk in water above knee height advisory"],"data_verified":false}
`;

// Initialize the secure Google SDK using backend-only environment variable
// We gracefully fallback to VITE_GEMINI_API_KEY in case your `.env` didn't rename it yet.
const API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  console.warn("WARNING: Backend proxy started without GEMINI_API_KEY. AI requests will fail!");
}

const genAI = new GoogleGenerativeAI(API_KEY || 'MISSING_KEY');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// ============================================
// API ENDPOINT: /api/analyze
// ============================================

const analyzeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per `window`
  message: { error: 'Too many requests from this IP, please try again after a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/api/analyze', analyzeLimiter, async (req, res) => {
  const { text, type = 'text', imageBase64, mimeType } = req.body;

  if (!text && !imageBase64) {
    return res.status(400).json({ error: "Missing required 'text' or 'imageBase64' field." });
  }

  try {
    const prompt = `${SYSTEM_PROMPT}\n\nFew-shot examples for calibration:\n${FEW_SHOT_EXAMPLES}\n\nNow analyze this ${type} input and respond with ONLY the JSON object:\n\n"${text}"`;

    let result;
    if (imageBase64 && mimeType) {
      const imagePart = { inlineData: { data: imageBase64, mimeType } };
      const textPart = { text: `${SYSTEM_PROMPT}\n\nAnalyze this image and any accompanying text. Extract the intent and provide ONLY the JSON:\n\n${text || 'Analyze the image content'}` };
      result = await model.generateContent([textPart, imagePart]);
    } else {
      result = await model.generateContent(prompt);
    }

    const raw = result.response.text().trim();
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    try {
      const parsed = JSON.parse(cleaned);
      return res.json(parsed);
    } catch {
      // Fallback JSON extraction
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) return res.json(JSON.parse(match[0]));
      throw new Error('Gemini returned non-JSON response.');
    }
  } catch (error) {
    console.error("Backend Proxy Error:", error.message);
    return res.status(500).json({ error: error.message || "Failed to contact proxy." });
  }
});

const mapsClient = new Client({});
const MAPS_KEY = process.env.GOOGLE_MAPS_API_KEY;

if (!MAPS_KEY) {
  console.warn("WARNING: Backend proxy started without GOOGLE_MAPS_API_KEY. Map routing will fail!");
}

// ============================================
// API ENDPOINT: /api/maps/geocode
// ============================================
app.get('/api/maps/geocode', async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: "Missing lat/lng" });

  try {
    const response = await mapsClient.reverseGeocode({
      params: { latlng: `${lat},${lng}`, key: MAPS_KEY }
    });
    return res.json({ address: response.data.results[0]?.formatted_address || "Unknown Location" });
  } catch (error) {
    console.error("Geocoding Error:", error.response?.data?.error_message || error.message);
    return res.status(500).json({ error: "Geocoding failed" });
  }
});

// ============================================
// API ENDPOINT: /api/maps/places
// ============================================
app.get('/api/maps/places', async (req, res) => {
  const { lat, lng, keyword, radius = 15000 } = req.query;
  if (!lat || !lng || !keyword) return res.status(400).json({ error: "Missing parameters" });

  try {
    const response = await mapsClient.placesNearby({
      params: { location: `${lat},${lng}`, radius, keyword, key: MAPS_KEY }
    });
    
    // Sort by business status to prioritize operational centers
    const operational = response.data.results.filter(p => p.business_status === "OPERATIONAL" || !p.business_status);
    return res.json({ results: operational.slice(0, 5) }); // return top 5
  } catch (error) {
    console.error("Places API Error:", error.response?.data?.error_message || error.message);
    return res.status(500).json({ error: "Places search failed" });
  }
});

// ============================================
// API ENDPOINT: /api/maps/directions
// ============================================
app.get('/api/maps/directions', async (req, res) => {
  const { originLat, originLng, destLat, destLng } = req.query;
  if (!originLat || !destLat) return res.status(400).json({ error: "Missing parameters" });

  try {
    const response = await mapsClient.directions({
      params: {
        origin: `${originLat},${originLng}`,
        destination: `${destLat},${destLng}`,
        mode: "driving",
        key: MAPS_KEY
      }
    });
    
    const route = response.data.routes[0]?.legs[0];
    if (!route) return res.json({ distance: null, duration: null });

    return res.json({
      distance: route.distance.text, // e.g., "5.4 mi"
      duration: route.duration.text, // e.g., "12 mins"
      durationValue: route.duration.value // in seconds
    });
  } catch (error) {
    console.error("Directions API Error:", error.response?.data?.error_message || error.message);
    return res.status(500).json({ error: "Directions request failed" });
  }
});

// ============================================
// STATIC FILE SERVING FOR REACT (Monolithic Architecture)
// ============================================
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback all other routes to React Router (SPA handling)
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start Server
app.listen(port, () => {
  console.log(`✅ BridgeAI Monolith Sandbox running on http://localhost:${port}`);
});
