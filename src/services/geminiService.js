export async function analyzeInput(userInput, apiKeyUnused, inputType = 'text', imageBase64 = null, mimeType = null) {
  // We no longer need the API key from the frontend. The backend injects it securely!
  
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: userInput,
      type: inputType,
      imageBase64,
      mimeType,
    })
  });

  if (!response.ok) {
    let errorMsg = `Backend Proxy Error (${response.status})`;
    try {
      const errorData = await response.json();
      if (errorData.error) errorMsg = errorData.error;
    } catch (e) {
      // Ignored
    }
    throw new Error(errorMsg);
  }

  return response.json();
}
