# SoundProfile API (Spring Boot)

Backend do SoundProfile em **Java 21 + Spring Boot 4.1**, com PostgreSQL (Neon), Spring Security (token de sessão), Spring JDBC (`JdbcClient`) e Flyway.

## Como rodar

1. Instale o **JDK 21** (por exemplo, Temurin) e o **Maven 3.9+**. O IntelliJ IDEA e a extensão *Extension Pack for Java* do VS Code já trazem o Maven.
2. Defina a conexão com o banco (a mesma `DATABASE_URL` do site):

   ```powershell
   cd backend
   $env:DATABASE_URL = "postgresql://USUARIO:SENHA@servidor.neon.tech/neondb?sslmode=require"
   mvn spring-boot:run
   ```

3. Teste: abra `http://localhost:8080/api/saude` (deve mostrar `{"status":"ok"}`).

No primeiro início, o Flyway aplica `db/migration/V1__esquema_inicial.sql`. Ele é todo `IF NOT EXISTS`, então um banco que o site já criou não muda.

Testes: `mvn test`.

## Variáveis de ambiente

| Variável | Para quê | Padrão |
|---|---|---|
| `DATABASE_URL` | Conexão com o PostgreSQL (obrigatória) | — |
| `PORT` | Porta da API | `8080` |
| `CORS_ORIGENS` | Endereços do site autorizados, separados por vírgula | `http://localhost:3000` |
| `BREVO_API_KEY` + `EMAIL_FROM` (+ `EMAIL_FROM_NOME`) | Envio do código por e-mail (Brevo) | — |
| `RESEND_API_KEY` + `EMAIL_FROM` | Alternativa ao Brevo | — |
| `EMAIL_MODO_DEV` | `true`: sem serviço de e-mail, o código aparece no log | `true` |

Em produção, coloque `EMAIL_MODO_DEV=false` para o cadastro falhar (em vez de só logar) quando o e-mail não estiver configurado.

## Como a autenticação funciona

- `POST /api/auth/login` devolve um **token**. O cliente manda `Authorization: Bearer <token>` nas próximas chamadas.
- O banco guarda só o **SHA-256** do token (tabela `Sessao`), igual ao site, então as sessões já existentes continuam válidas.
- A API não usa cookie de sessão, por isso não há CSRF a proteger; o CSRF fica desligado de propósito.
- Senhas: BCrypt (custo 12), compatível com os hashes que o site já gravou.
- Contas criadas por cadastro só entram depois de confirmar o código de 6 dígitos enviado ao e-mail.

## Estrutura

```
src/main/java/br/edu/ifms/soundprofile/
  config/        conexão com o banco (DATABASE_URL -> JDBC) e propriedades
  security/      filtro de sessão, SecurityConfig (rotas públicas/privadas, CORS)
  comum/         erros padronizados, validações, /api/saude
  auth/          cadastro, código por e-mail, login, logout
  perfil/        perfil público e edição (dados e personalização)
  seguidor/      seguir, seguidores, seguindo, busca de pessoas
  notificacao/   avisos (por ora, só "novo seguidor")
  imagem/        entrega das imagens guardadas no banco
```

Cada módulo segue o padrão Controller (HTTP) -> Service (regras de negócio) -> Repository (SQL).

## Exemplos (PowerShell)

```powershell
# Cadastro (o código chega por e-mail; sem e-mail configurado, aparece no log da API)
Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/auth/cadastro -ContentType application/json `
  -Body '{"username":"teste","email":"teste@exemplo.com","password":"senhaSegura1"}'

# Confirmar o código e já receber a sessão
$s = Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/auth/verificar-email -ContentType application/json `
  -Body '{"email":"teste@exemplo.com","codigo":"123456"}'

# Usar o token
Invoke-RestMethod -Uri http://localhost:8080/api/auth/me -Headers @{ Authorization = "Bearer $($s.token)" }
```

## Hospedagem

A Vercel não executa Java. Use o `Dockerfile` desta pasta em um serviço como Render ou Railway e configure as variáveis acima. O site (Vercel) passa a chamar essa API.
