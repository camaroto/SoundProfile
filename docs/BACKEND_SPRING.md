# Migração do backend para Spring Boot

Hoje o site (Next.js) fala direto com o banco. A meta é o Next.js ser **só a interface** e toda regra de negócio ficar na API Spring Boot (`backend/`). A migração é feita por módulos; o site continua funcionando enquanto cada módulo é trocado.

## Endpoints

### Etapa 1 — pronta (escrita, ainda não executada contra o banco)

| Método e caminho | O que faz | Acesso |
|---|---|---|
| `POST /api/auth/cadastro` | Cria conta não verificada e envia o código por e-mail | público |
| `POST /api/auth/verificar-email` | Confirma o código e devolve a sessão | público |
| `POST /api/auth/reenviar-codigo` | Novo código (60 s de intervalo, 5 por hora) | público |
| `POST /api/auth/login` | Usuário ou e-mail + senha; devolve o token | público |
| `POST /api/auth/logout` | Encerra a sessão | login |
| `GET /api/auth/me` | Usuário da sessão | login |
| `GET /api/perfis/{username}` | Perfil, seguidores/seguindo e relação com quem vê | público |
| `PUT /api/perfil/dados` | Nome, localização e bio | login (dono) |
| `PUT /api/perfil/personalizacao` | Moldura e balão (lista permitida) | login (dono) |
| `POST /api/usuarios/{username}/seguir` | Seguir | login |
| `DELETE /api/usuarios/{username}/seguir` | Deixar de seguir | login |
| `GET /api/seguindo`, `GET /api/seguidores` | Listas (com `?q=`) | login |
| `GET /api/usuarios/busca?q=` | Pesquisar pessoas | login |
| `GET /api/imagens/{id}` | Imagem guardada no banco | público |
| `GET /api/saude` | Saúde da API | público |

### Próximas etapas (equivalente atual no site)

| Etapa | Módulo | Código atual no site |
|---|---|---|
| 2 | Upload de foto e banner (multipart + redimensionar) | `lib/imagens.ts`, `lib/perfis.ts` |
| 2 | Notificações (listar, contar, marcar lidas) | `lib/notificacoes.ts` |
| 2 | Login com Google | `lib/google.ts`, `app/api/auth/google/*` |
| 3 | Catálogo: artistas, álbuns, músicas, gêneros, busca | `lib/catalogo.ts`, `lib/pagina-item.ts` |
| 3 | Avaliações, favoritos e comentários | `lib/avaliacoes.ts` |
| 3 | Comunidade, rankings e estatísticas | `lib/comunidade.ts`, `lib/estatisticas.ts` |
| 4 | Mensagens privadas e conversas | `lib/mensagens.ts` |
| 5 | Integração com o Spotify | `lib/spotify.ts`, `lib/spotify-importar.ts` |
| 5 | Administração (catálogo, moderação, denúncias) | `lib/catalogo-admin.ts`, `app/admin` |
| 6 | Trocar o site para consumir a API e remover o acesso direto ao banco | `lib/db.ts` e `app/**/actions.ts` |

## Decisões técnicas

- **Spring JDBC (`JdbcClient`) em vez de JPA.** O banco já existe, com nomes sem aspas (em minúsculas no PostgreSQL), e as consultas do site já são SQL. Portar o SQL direto evita erros de mapeamento. Se a disciplina exigir JPA/Hibernate, os repositórios podem ser trocados sem mexer nos serviços.
- **Token opaco guardado como hash** (e não JWT): permite revogar a sessão no logout e reaproveita a tabela `Sessao` do site.
- **Erros padronizados**: toda falha volta como `{ "codigo", "mensagem", "campos": { campo: mensagem } }`, que casa com os erros por campo dos formulários.
- **Validação no servidor**: as regras de `lib/validacao.ts` foram portadas para `comum/Validacao.java`.
- **Flyway**: o esquema deixa de ser criado pelo site e passa a ser versionado em `db/migration` (V1 já inclui tudo o que existe hoje).

## Estado da verificação

- Verificado aqui: sintaxe de todo o Java e a lógica pura (conversão de `DATABASE_URL`, hash do token, validações), com 21 checagens executadas.
- **Ainda não verificado**: compilação com o Spring (o ambiente não tinha Maven nem acesso à internet), consultas SQL contra o PostgreSQL e o fluxo HTTP completo. Rode `mvn test` e `mvn spring-boot:run` e teste os exemplos do `backend/README.md`.
