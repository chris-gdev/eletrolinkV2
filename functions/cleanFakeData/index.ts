import { createClient } from "jsr:@lumi.new/sdk@0.1.60"

Deno.serve(async (req) => {
  // CORS headers
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
  }

  try {
    const authorization = req.headers.get("Authorization")
    
    const lumi = createClient({
      projectId: Deno.env.get("PROJECT_ID")!,
      apiBaseUrl: Deno.env.get("API_BASE_URL")!,
      authOrigin: "",
      authorization,
    })

    // Refresh user to check if admin
    const user = await lumi.auth.refreshUser()
    
    if (!user || user.userRole !== "ADMIN") {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Apenas administradores podem executar esta ação" 
        }),
        {
          status: 403,
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          },
        }
      )
    }

    // IDs dos dados de exemplo para deletar
    const fakeDataIds = [
      "69048e6c4bf40d73d7bb4a43", // Pedro Ferreira
      "69048e6c4bf40d73d7bb4a42", // Ana Costa
      "69048e6c4bf40d73d7bb4a41", // Carlos Oliveira
      "69048e6c4bf40d73d7bb4a40", // Maria Santos
      "69048e6c4bf40d73d7bb4a3f"  // João Silva
    ]

    // Deletar dados de exemplo
    await lumi.entities.quote_requests.deleteMany(fakeDataIds)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Dados de exemplo removidos com sucesso",
        deletedCount: fakeDataIds.length
      }),
      {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
      }
    )
  } catch (error) {
    console.error("Erro ao limpar dados:", error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
      }
    )
  }
})
