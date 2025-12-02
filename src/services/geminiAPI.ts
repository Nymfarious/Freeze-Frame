import { FrameAnalysis, EnhancementStyles } from '@/types';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries === 0) throw error;
    
    if (error?.status === 429 || error?.message?.includes('429')) {
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, MAX_RETRIES - retries);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1);
    }
    
    throw error;
  }
}

export async function analyzeFrame(
  imageData: string,
  apiMode: 'lovable' | 'custom',
  customKey?: string
): Promise<FrameAnalysis> {
  return retryWithBackoff(async () => {
    if (apiMode === 'lovable') {
      // Use Lovable AI Gateway via edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-frame`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ imageData }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Analysis failed');
      }

      const data = await response.json();
      return data.analysis;
    } else {
      // Direct API call with custom key
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': customKey!,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Analyze this video frame as a potential photograph. Provide structured analysis including:
- Quality assessment (excellent/good/fair)
- Reason for quality rating
- People detected (list names/descriptions)
- Shot type (posed/candid/uncertain)
- Relevant tags
- Composition score (0-100)
- Technical advice for improvement`,
                  },
                  {
                    inlineData: {
                      mimeType: 'image/jpeg',
                      data: imageData.split(',')[1],
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.4,
              responseSchema: {
                type: 'object',
                properties: {
                  quality: { type: 'string', enum: ['excellent', 'good', 'fair'] },
                  qualityReason: { type: 'string' },
                  people: { type: 'array', items: { type: 'string' } },
                  shotType: { type: 'string', enum: ['posed', 'candid', 'uncertain'] },
                  tags: { type: 'array', items: { type: 'string' } },
                  compositionScore: { type: 'number' },
                  technicalAdvice: { type: 'array', items: { type: 'string' } },
                },
                required: [
                  'quality',
                  'qualityReason',
                  'people',
                  'shotType',
                  'tags',
                  'compositionScore',
                  'technicalAdvice',
                ],
              },
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;
      return JSON.parse(text);
    }
  });
}

export async function enhanceFrame(
  imageData: string,
  styles: EnhancementStyles,
  apiMode: 'lovable' | 'custom',
  customKey?: string
): Promise<string> {
  return retryWithBackoff(async () => {
    const stylePrompts: string[] = [];
    if (styles.unblur) stylePrompts.push('sharpen and remove blur');
    if (styles.cinematicLighting) stylePrompts.push('apply cinematic lighting');
    if (styles.portraitBokeh) stylePrompts.push('add portrait bokeh effect');
    if (styles.removeBackground) stylePrompts.push('remove background');
    if (styles.colorPop) stylePrompts.push('enhance colors with color pop');
    if (styles.hdr) stylePrompts.push('apply HDR enhancement');

    const prompt = `Enhance this image with the following improvements: ${stylePrompts.join(', ')}. Maintain the original composition and subject.`;

    if (apiMode === 'lovable') {
      // Use Lovable AI Gateway via edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/enhance-frame`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ imageData, prompt }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Enhancement failed');
      }

      const data = await response.json();
      return data.enhancedImage;
    } else {
      // Direct API call with custom key
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': customKey!,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType: 'image/jpeg',
                      data: imageData.split(',')[1],
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const imageBase64 = data.candidates[0].content.parts[0].inlineData.data;
      return `data:image/jpeg;base64,${imageBase64}`;
    }
  });
}
