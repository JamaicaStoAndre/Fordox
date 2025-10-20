import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const mockGrupos = [
      { id: 1, nome: 'Biopark', localizacao: 1 },
      { id: 2, nome: 'Grupo A', localizacao: 2 },
      { id: 3, nome: 'Grupo B', localizacao: 3 }
    ]

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          grupos: mockGrupos,
          total: mockGrupos.length,
          last_updated: new Date().toISOString()
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
