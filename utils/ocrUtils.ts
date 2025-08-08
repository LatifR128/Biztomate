import { BusinessCard } from '@/types';
import { Platform } from 'react-native';

// Convert image URI to base64 with better error handling and optimization
const imageToBase64 = async (uri: string): Promise<string> => {
  try {
    // Handle different URI formats
    let imageUri = uri;
    if (Platform.OS === 'ios' && uri.startsWith('file://')) {
      imageUri = uri;
    } else if (Platform.OS === 'android' && uri.startsWith('content://')) {
      imageUri = uri;
    }

    const response = await fetch(imageUri);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove the data:image/...;base64, prefix
        const base64Data = base64.split(',')[1];
        if (!base64Data) {
          reject(new Error('Invalid base64 data'));
          return;
        }
        resolve(base64Data);
      };
      reader.onerror = () => reject(new Error('Failed to read image data'));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};

// Cache for processed images to avoid re-processing
const imageCache = new Map<string, Partial<BusinessCard>>();

// Enhanced business card processing with performance optimizations
export const processBusinessCard = async (imageUri: string): Promise<Partial<BusinessCard>> => {
  try {
    console.log('🚀 Starting optimized OCR processing for image:', imageUri);
    
    // Check cache first
    const cacheKey = imageUri.split('?')[0]; // Remove query params for caching
    if (imageCache.has(cacheKey)) {
      console.log('⚡ Returning cached result for faster processing');
      return imageCache.get(cacheKey)!;
    }
    
    // Convert image to base64 with compression
    const base64Image = await imageToBase64(imageUri);
    console.log('📸 Image converted to base64, length:', base64Image.length);
    
    // Ultra-optimized AI prompt for faster processing
    const messages = [
      {
        role: 'system' as const,
        content: `Extract business card data. Return ONLY valid JSON:
{
  "name": "Full name",
  "title": "Job title", 
  "company": "Company name",
  "email": "Email address",
  "phone": "Phone number",
  "website": "Website URL",
  "address": "Full address"
}
Rules: Extract prominent text, use empty string for missing fields, handle international formats.`
      },
      {
        role: 'user' as const,
        content: [
          {
            type: 'text' as const,
            text: 'Extract contact info from this business card:'
          },
          {
            type: 'image' as const,
            image: base64Image
          }
        ]
      }
    ];

    console.log('🤖 Making ultra-fast AI API request...');
    
    // ✅ OPTIMIZED: Ultra-fast timeout for better UX
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // Reduced to 8 seconds for faster response
    
    const response = await fetch('https://toolkit.rork.com/text/llm/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`❌ AI API request failed: ${response.status} - ${response.statusText}`);
      console.log('🔄 Using fallback data due to API failure');
      const fallbackData = getEnhancedFallbackData();
      imageCache.set(cacheKey, fallbackData);
      return fallbackData;
    }

    const result = await response.json();
    
    if (!result.completion) {
      console.error('❌ No completion in AI response');
      console.log('🔄 Using fallback data due to missing completion');
      const fallbackData = getEnhancedFallbackData();
      imageCache.set(cacheKey, fallbackData);
      return fallbackData;
    }
    
    console.log('✅ AI response received, processing...');
    
    // Optimized response cleaning
    let cleanedResponse = result.completion.trim();
    
    // Remove markdown code blocks and extra formatting
    cleanedResponse = cleanedResponse.replace(/```json\s*/g, '');
    cleanedResponse = cleanedResponse.replace(/```\s*/g, '');
    cleanedResponse = cleanedResponse.replace(/^```json\s*/g, '');
    cleanedResponse = cleanedResponse.replace(/\s*```$/g, '');
    
    // Find JSON object in the response
    const jsonStart = cleanedResponse.indexOf('{');
    const jsonEnd = cleanedResponse.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1) {
      console.error('❌ No JSON object found in AI response');
      console.log('🔄 Using fallback data due to invalid JSON');
      const fallbackData = getEnhancedFallbackData();
      imageCache.set(cacheKey, fallbackData);
      return fallbackData;
    }
    
    const jsonString = cleanedResponse.substring(jsonStart, jsonEnd + 1);
    
    // Parse and validate the AI response
    try {
      const extractedData = JSON.parse(jsonString);
      console.log('✅ Successfully parsed AI response:', extractedData);
      
      // Optimized data validation and cleaning
      const cleanedData: Partial<BusinessCard> = {};
      
      // Name validation - most critical field
      if (extractedData.name && typeof extractedData.name === 'string' && extractedData.name.trim()) {
        const name = extractedData.name.trim();
        // Basic name validation - should contain letters and spaces
        if (/^[a-zA-Z\s\-\.]+$/.test(name) && name.length >= 2 && name.length <= 50) {
          cleanedData.name = name;
        } else {
          console.log('⚠️ Invalid name format detected:', name);
        }
      }
      
      // Title validation
      if (extractedData.title && typeof extractedData.title === 'string' && extractedData.title.trim()) {
        const title = extractedData.title.trim();
        if (title.length <= 100) {
          cleanedData.title = title;
        }
      }
      
      // Company validation
      if (extractedData.company && typeof extractedData.company === 'string' && extractedData.company.trim()) {
        const company = extractedData.company.trim();
        if (company.length <= 100) {
          cleanedData.company = company;
        }
      }
      
      // Email validation with cleaning
      if (extractedData.email && typeof extractedData.email === 'string' && extractedData.email.trim()) {
        const email = extractedData.email.trim().toLowerCase();
        if (isValidEmail(email)) {
          cleanedData.email = email;
        } else {
          console.log('⚠️ Invalid email format detected:', email);
        }
      }
      
      // Phone validation with cleaning
      if (extractedData.phone && typeof extractedData.phone === 'string' && extractedData.phone.trim()) {
        const phone = extractedData.phone.trim();
        const cleanedPhone = cleanPhoneNumber(phone);
        if (isValidPhone(cleanedPhone)) {
          cleanedData.phone = cleanedPhone;
        } else {
          console.log('⚠️ Invalid phone format detected:', phone);
        }
      }
      
      // Website validation with URL cleaning
      if (extractedData.website && typeof extractedData.website === 'string' && extractedData.website.trim()) {
        const website = extractedData.website.trim();
        const cleanedWebsite = cleanWebsite(website);
        if (isValidWebsite(cleanedWebsite)) {
          cleanedData.website = cleanedWebsite;
        } else {
          console.log('⚠️ Invalid website format detected:', website);
        }
      }
      
      // Address validation
      if (extractedData.address && typeof extractedData.address === 'string' && extractedData.address.trim()) {
        const address = extractedData.address.trim();
        if (address.length <= 200) {
          cleanedData.address = address;
        }
      }
      
      console.log('✅ Optimized cleaned data:', cleanedData);
      
      // Enhanced validation - require at least a valid name
      if (cleanedData.name && cleanedData.name !== 'Unknown Contact' && cleanedData.name.length >= 2) {
        console.log('✅ Returning successfully extracted data');
        // Cache the successful result
        imageCache.set(cacheKey, cleanedData);
        return cleanedData;
      } else {
        console.log('🔄 No valid name extracted, using fallback data');
        const fallbackData = getEnhancedFallbackData();
        imageCache.set(cacheKey, fallbackData);
        return fallbackData;
      }
      
    } catch (parseError) {
      console.error('❌ Error parsing AI response as JSON:', parseError);
      console.log('🔄 Using fallback data due to JSON parse error');
      const fallbackData = getEnhancedFallbackData();
      imageCache.set(cacheKey, fallbackData);
      return fallbackData;
    }
    
  } catch (error) {
    console.error('❌ Error processing business card:', error);
    console.log('🔄 Using fallback data due to processing error');
    const fallbackData = getEnhancedFallbackData();
    const cacheKey = imageUri.split('?')[0]; // Remove query params for caching
    imageCache.set(cacheKey, fallbackData);
    return fallbackData;
  }
};

// Clear cache when needed
export const clearImageCache = () => {
  imageCache.clear();
  console.log('Image cache cleared');
};

// Enhanced fallback data with better uniqueness
const getEnhancedFallbackData = (): Partial<BusinessCard> => {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 10);
  const sessionId = Math.random().toString(36).substring(2, 8);
  
  return {
    name: `Unknown Contact ${sessionId}`,
    title: "",
    company: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    // Enhanced unique identifier to prevent false duplicates
    _fallbackId: `fallback_${timestamp}_${randomSuffix}_${sessionId}`,
    _isFallback: true
  };
};

// Enhanced phone number cleaning
const cleanPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters except + at the beginning
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Ensure + is only at the beginning
  if (cleaned.startsWith('+')) {
    cleaned = '+' + cleaned.substring(1).replace(/\+/g, '');
  }
  
  // Remove leading zeros after country code
  if (cleaned.startsWith('+1')) {
    cleaned = '+1' + cleaned.substring(2).replace(/^0+/, '');
  }
  
  return cleaned;
};

// Enhanced website cleaning
const cleanWebsite = (website: string): string => {
  let cleaned = website.trim().toLowerCase();
  
  // Remove common prefixes if they're not part of the actual URL
  if (cleaned.startsWith('www.')) {
    cleaned = 'https://' + cleaned;
  } else if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = 'https://' + cleaned;
  }
  
  return cleaned;
};

// Enhanced email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Enhanced phone validation
export const isValidPhone = (phone: string): boolean => {
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Check for minimum and maximum length
  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    return false;
  }
  
  // Basic format validation
  const phoneRegex = /^[+]?[0-9\s\-\(\)]{7,20}$/;
  return phoneRegex.test(phone);
};

// Enhanced website validation
export const isValidWebsite = (website: string): boolean => {
  try {
    const url = new URL(website);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

// Enhanced duplicate detection helper
export const normalizeForComparison = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\d/g, ''); // Remove numbers for name comparison
};

// Enhanced field extraction for text-based processing
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
- Do not use null values, use empty strings instead
- Be very careful with name extraction - only extract if clearly a person's name`
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
      return getEnhancedFallbackData();
    }
    
    const jsonString = cleanedResponse.substring(jsonStart, jsonEnd + 1);
    return JSON.parse(jsonString);
    
  } catch (error) {
    console.error('Error extracting fields with AI:', error);
    return getEnhancedFallbackData();
  }
};
