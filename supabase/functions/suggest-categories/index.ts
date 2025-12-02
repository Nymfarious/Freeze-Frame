import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { frames } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Prepare analysis data from frames
    const frameDescriptions = frames.map((frame: any, idx: number) => {
      const analysis = frame.analysis || {};
      return `Frame ${idx + 1}: ${analysis.tags?.join(', ') || 'no tags'}, Quality: ${analysis.quality || 'unknown'}, Shot: ${analysis.shotType || 'unknown'}`;
    }).join('\n');

    const prompt = `Analyze these video frame descriptions and suggest 5-8 relevant category labels that would help organize them effectively. 
    
Frame descriptions:
${frameDescriptions}

Return categories that are:
- Specific but not too narrow (e.g., "Portrait", "Landscape", "Action", "Close-up", "Group Photo")
- Useful for organizing and filtering
- Based on content, composition, and subject matter
- Practical for a photo library

Return ONLY a JSON array of category strings, no other text.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that analyzes images and suggests organization categories. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';
    
    // Parse the JSON response
    let suggestions: string[];
    try {
      suggestions = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      // Fallback: extract categories from text
      suggestions = content
        .split('\n')
        .filter((line: string) => line.trim())
        .map((line: string) => line.replace(/^[-*]\s*/, '').replace(/["\[\]]/g, '').trim())
        .filter((cat: string) => cat.length > 0)
        .slice(0, 8);
    }

    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in suggest-categories:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
