import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { imageData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this video frame as a potential photograph. Provide structured analysis including:
- Quality assessment (excellent/good/fair)
- Reason for quality rating
- People detected (list names/descriptions)
- Shot type (posed/candid/uncertain)
- Relevant tags
- Composition score (0-100)
- Technical advice for improvement

Return as JSON with these exact fields: quality, qualityReason, people (array), shotType, tags (array), compositionScore (number), technicalAdvice (array)`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'analyze_frame',
              description: 'Return structured frame analysis',
              parameters: {
                type: 'object',
                properties: {
                  quality: { type: 'string', enum: ['excellent', 'good', 'fair'] },
                  qualityReason: { type: 'string' },
                  people: { type: 'array', items: { type: 'string' } },
                  shotType: { type: 'string', enum: ['posed', 'candid', 'uncertain'] },
                  tags: { type: 'array', items: { type: 'string' } },
                  compositionScore: { type: 'number' },
                  technicalAdvice: { type: 'array', items: { type: 'string' } }
                },
                required: ['quality', 'qualityReason', 'people', 'shotType', 'tags', 'compositionScore', 'technicalAdvice']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'analyze_frame' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices[0].message.tool_calls?.[0];
    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
