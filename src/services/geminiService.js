import { GoogleGenerativeAI } from '@google/generative-ai';

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

export async function analyzeInput(userInput, apiKey, inputType = 'text', imageBase64 = null, mimeType = null) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `${SYSTEM_PROMPT}\n\nFew-shot examples for calibration:\n${FEW_SHOT_EXAMPLES}\n\nNow analyze this ${inputType} input and respond with ONLY the JSON object:\n\n"${userInput}"`;

  let result;

  if (imageBase64 && mimeType) {
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType,
      },
    };
    const textPart = { text: `${SYSTEM_PROMPT}\n\nAnalyze this image and any accompanying text. Extract the intent and provide ONLY the JSON:\n\n${userInput || 'Analyze the image content'}` };
    result = await model.generateContent([textPart, imagePart]);
  } else {
    result = await model.generateContent(prompt);
  }

  const raw = result.response.text().trim();

  // Strip markdown code fences if present
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Fallback: try to extract JSON from the response
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Gemini returned non-JSON response: ' + raw.substring(0, 200));
  }
}
