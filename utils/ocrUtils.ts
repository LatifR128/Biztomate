import { BusinessCard } from '@/types';

// Convert image URI to base64
const imageToBase64 = async (uri: string): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove the data:image/...;base64, prefix
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};

// Process business card using AI
export const processBusinessCard = async (imageUri: string): Promise<Partial<BusinessCard>> => {
  try {
    console.log('Starting OCR processing for image:', imageUri);
    
    // Convert image to base64
    const base64Image = await imageToBase64(imageUri);
    console.log('Image converted to base64, length:', base64Image.length);
    
    // Prepare the AI request
    const messages = [
      {
        role: 'system' as const,
        content: `You are an expert at extracting information from business cards. Analyze the business card image and extract the following information.

IMPORTANT: You must respond with ONLY a valid JSON object in this exact format:

{
  "name": "Full name of the person",
  "title": "Job title or position",
  "company": "Company or organization name",
  "email": "Email address",
  "phone": "Phone number",
  "website": "Website URL",
  "address": "Full address"
}

Rules:
- Only include fields that are clearly visible on the business card
- If a field is not present or unclear, set it to an empty string ""
- Do not include any text before or after the JSON
- Ensure the JSON is properly formatted and valid
- Do not use null values, use empty strings instead
- Be very careful with name extraction - only extract if it's clearly a person's name`
      },
      {
        role: 'user' as const,
        content: [
          {
            type: 'text' as const,
            text: 'Please extract the contact information from this business card and return only the JSON object:'
          },
          {
            type: 'image' as const,
            image: base64Image
          }
        ]
      }
    ];

    console.log('Making AI API request...');
    
    // Make request to AI API
    const response = await fetch('https://toolkit.rork.com/text/llm/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages })
    });

    if (!response.ok) {
      console.error(`AI API request failed: ${response.status} - ${response.statusText}`);
      console.log('Using fallback data due to API failure');
      return getFallbackData();
    }

    const result = await response.json();
    
    if (!result.completion) {
      console.error('No completion in AI response');
      console.log('Using fallback data due to missing completion');
      return getFallbackData();
    }
    
    console.log('AI response received, processing...');
    
    // Clean the response - remove any markdown formatting or extra text
    let cleanedResponse = result.completion.trim();
    
    // Remove markdown code blocks if present
    cleanedResponse = cleanedResponse.replace(/```json\s*/g, '');
    cleanedResponse = cleanedResponse.replace(/```\s*/g, '');
    
    // Find JSON object in the response
    const jsonStart = cleanedResponse.indexOf('{');
    const jsonEnd = cleanedResponse.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1) {
      console.error('No JSON object found in AI response');
      console.log('Raw AI response:', result.completion);
      console.log('Using fallback data due to invalid JSON');
      return getFallbackData();
    }
    
    const jsonString = cleanedResponse.substring(jsonStart, jsonEnd + 1);
    
    // Parse the AI response
    try {
      const extractedData = JSON.parse(jsonString);
      console.log('Successfully parsed AI response:', extractedData);
      
      // Validate and clean the extracted data
      const cleanedData: Partial<BusinessCard> = {};
      
      if (extractedData.name && typeof extractedData.name === 'string' && extractedData.name.trim()) {
        cleanedData.name = extractedData.name.trim();
      }
      
      if (extractedData.title && typeof extractedData.title === 'string' && extractedData.title.trim()) {
        cleanedData.title = extractedData.title.trim();
      }
      
      if (extractedData.company && typeof extractedData.company === 'string' && extractedData.company.trim()) {
        cleanedData.company = extractedData.company.trim();
      }
      
      if (extractedData.email && typeof extractedData.email === 'string' && extractedData.email.trim()) {
        const email = extractedData.email.trim();
        if (isValidEmail(email)) {
          cleanedData.email = email;
        }
      }
      
      if (extractedData.phone && typeof extractedData.phone === 'string' && extractedData.phone.trim()) {
        cleanedData.phone = extractedData.phone.trim();
      }
      
      if (extractedData.website && typeof extractedData.website === 'string' && extractedData.website.trim()) {
        cleanedData.website = extractedData.website.trim();
      }
      
      if (extractedData.address && typeof extractedData.address === 'string' && extractedData.address.trim()) {
        cleanedData.address = extractedData.address.trim();
      }
      
      console.log('Cleaned data:', cleanedData);
      
      // If we got at least a name, return the data, otherwise use fallback
      if (cleanedData.name && cleanedData.name !== 'Unknown Contact') {
        console.log('Returning successfully extracted data');
        return cleanedData;
      } else {
        console.log('No valid name extracted, using fallback data');
        return getFallbackData();
      }
      
    } catch (parseError) {
      console.error('Error parsing AI response as JSON:', parseError);
      console.error('Raw AI response:', result.completion);
      console.error('Cleaned JSON string:', jsonString);
      console.log('Using fallback data due to JSON parse error');
      // Fallback to mock data if AI response is invalid
      return getFallbackData();
    }
    
  } catch (error) {
    console.error('Error processing business card:', error);
    console.log('Using fallback data due to processing error');
    // Return fallback data in case of any error
    return getFallbackData();
  }
};

// Fallback mock data for when AI processing fails
const getFallbackData = (): Partial<BusinessCard> => {
  // Generate unique fallback data with timestamp to avoid duplicates
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  
  return {
    name: `Unknown Contact ${randomSuffix}`,
    title: "",
    company: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    // Add a unique identifier to prevent false duplicates
    _fallbackId: `${timestamp}_${randomSuffix}`
  };
};

// This would be a real implementation using AI to extract fields
export const extractFieldsWithAI = async (
  rawText: string
): Promise<Partial<BusinessCard>> => {
  try {
    const messages = [
      {
        role: 'system' as const,
        content: `You are an expert at parsing business card text and extracting structured information. Given raw OCR text from a business card, extract the following information.

IMPORTANT: You must respond with ONLY a valid JSON object in this exact format:

{
  "name": "Full name of the person",
  "title": "Job title or position", 
  "company": "Company or organization name",
  "email": "Email address",
  "phone": "Phone number",
  "website": "Website URL",
  "address": "Full address"
}

Rules:
- Only include fields that are clearly identifiable
- If a field is not present or unclear, set it to an empty string ""
- Do not include any text before or after the JSON
- Ensure the JSON is properly formatted and valid
- Do not use null values, use empty strings instead`
      },
      {
        role: 'user' as const,
        content: `Please extract structured contact information from this business card text and return only the JSON object: ${rawText}`
      }
    ];

    const response = await fetch('https://toolkit.rork.com/text/llm/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages })
    });

    if (!response.ok) {
      throw new Error(`AI API request failed: ${response.status}`);
    }

    const result = await response.json();
    
    // Clean and parse the response
    let cleanedResponse = result.completion.trim();
    cleanedResponse = cleanedResponse.replace(/```json\s*/g, '');
    cleanedResponse = cleanedResponse.replace(/```\s*/g, '');
    
    const jsonStart = cleanedResponse.indexOf('{');
    const jsonEnd = cleanedResponse.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1) {
      return getFallbackData();
    }
    
    const jsonString = cleanedResponse.substring(jsonStart, jsonEnd + 1);
    return JSON.parse(jsonString);
    
  } catch (error) {
    console.error('Error extracting fields with AI:', error);
    return getFallbackData();
  }
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number format (basic validation)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone);
};

// Validate website format
export const isValidWebsite = (website: string): boolean => {
  const urlRegex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
  return urlRegex.test(website);
};