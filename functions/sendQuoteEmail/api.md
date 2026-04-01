
# API Information
## sendQuoteEmail
### Function URL

https://api.lumi.new/v1/functions/p361960948221538304/sendQuoteEmail

Make POST requests to this endpoint to send quote emails directly to eletrolink220@gmail.com.

### Headers

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <your-api-key>"
}
```

- **Content-Type**: Always required for JSON payloads
- **Authorization**: Required for authenticated requests

### Request Body
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "(11) 99999-9999",
  "street": "Rua das Flores",
  "number": "123",
  "neighborhood": "Centro",
  "city": "São Paulo",
  "cep": "01234-567",
  "serviceType": "Instalações Residenciais",
  "projectType": "Obra Nova",
  "description": "Preciso de instalação elétrica completa para casa nova",
  "urgency": "Moderado (até 15 dias)"
}
```

### Response
```json
{
  "success": true,
  "message": "Orçamento enviado com sucesso!",
  "emailId": "email-id-from-resend"
}
```

### Usage Example (cURL)

```bash
curl -X POST "https://api.lumi.new/v1/functions/p361960948221538304/sendQuoteEmail" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-api-key>" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "phone": "(11) 99999-9999",
    "street": "Rua das Flores",
    "number": "123",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "cep": "01234-567",
    "serviceType": "Instalações Residenciais",
    "projectType": "Obra Nova",
    "description": "Preciso de instalação elétrica completa para casa nova",
    "urgency": "Moderado (até 15 dias)"
  }'