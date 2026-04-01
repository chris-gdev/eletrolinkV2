
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
}

interface QuoteData {
  name: string
  email: string
  phone: string
  street: string
  number: string
  neighborhood: string
  city: string
  cep: string
  serviceType: string
  projectType: string
  description: string
  urgency: string
}

async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (req.method === 'POST') {
      const quoteData: QuoteData = await req.json()

      // SECURITY: API key from environment - NEVER hardcode
      const resendApiKey = Deno.env.get('RESEND_API_KEY')

      if (!resendApiKey) {
        return jsonResponse({
          error: 'Service configuration error: Missing email API credentials'
        }, 500)
      }

      // Montar endereço completo
      const fullAddress = `${quoteData.street}, ${quoteData.number} - ${quoteData.neighborhood} - ${quoteData.city} - CEP: ${quoteData.cep}`
      
      // Criar conteúdo do email em HTML
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: linear-gradient(135deg, #2563eb, #eab308); color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .section { margin-bottom: 20px; }
            .section h3 { color: #2563eb; border-bottom: 2px solid #eab308; padding-bottom: 5px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .info-item { background: #f8f9fa; padding: 10px; border-radius: 5px; }
            .description { background: #e3f2fd; padding: 15px; border-radius: 5px; border-left: 4px solid #2563eb; }
            .footer { background: #f1f5f9; padding: 15px; text-align: center; color: #666; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>⚡ Nova Solicitação de Orçamento</h1>
            <p>ElétricaPro - Soluções Elétricas</p>
          </div>
          
          <div class="content">
            <div class="section">
              <h3>📋 Dados do Cliente</h3>
              <div class="info-grid">
                <div class="info-item">
                  <strong>Nome:</strong><br>${quoteData.name}
                </div>
                <div class="info-item">
                  <strong>Email:</strong><br>${quoteData.email}
                </div>
                <div class="info-item">
                  <strong>Telefone:</strong><br>${quoteData.phone}
                </div>
                <div class="info-item">
                  <strong>Endereço:</strong><br>${fullAddress}
                </div>
              </div>
            </div>

            <div class="section">
              <h3>🔧 Detalhes do Projeto</h3>
              <div class="info-grid">
                <div class="info-item">
                  <strong>Tipo de Serviço:</strong><br>${quoteData.serviceType}
                </div>
                <div class="info-item">
                  <strong>Tipo de Projeto:</strong><br>${quoteData.projectType}
                </div>
                <div class="info-item" style="grid-column: 1 / -1;">
                  <strong>Urgência:</strong><br>${quoteData.urgency}
                </div>
              </div>
            </div>

            <div class="section">
              <h3>📝 Descrição do Projeto</h3>
              <div class="description">
                ${quoteData.description.replace(/\n/g, '<br>')}
              </div>
            </div>
          </div>

          <div class="footer">
            <p>Solicitação enviada através do site ElétricaPro em ${new Date().toLocaleString('pt-BR')}</p>
            <p>⚡ ElétricaPro - Energia que Move o Futuro</p>
          </div>
        </body>
        </html>
      `

      // Enviar email usando Resend API
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'ElétricaPro <noreply@eletricapro.com>',
          to: ['eletrolink220@gmail.com'],
          reply_to: quoteData.email,
          subject: `Novo Orçamento: ${quoteData.serviceType} - ${quoteData.name}`,
          html: emailHtml,
        }),
      })

      if (emailResponse.status === 401 || emailResponse.status === 403) {
        return jsonResponse({
          error: 'Email API authentication failed: confirm RESEND_API_KEY is valid'
        }, 502)
      }

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json().catch(() => ({}))
        throw new Error(`Email API error: ${emailResponse.statusText} - ${JSON.stringify(errorData)}`)
      }

      const emailResult = await emailResponse.json()

      return jsonResponse({
        success: true,
        message: 'Orçamento enviado com sucesso!',
        emailId: emailResult.id
      })
    }

    return jsonResponse({ error: 'Method not allowed' }, 405)
  }
  catch (error) {
    console.error('Error sending quote email:', error)
    return jsonResponse({
      error: error.message || 'Internal server error',
    }, 500)
  }
}

function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

await Deno.serve(handler)
