# SoundProfile

Rede social para avaliar e compartilhar música. Next.js 16, React 19, TypeScript, Tailwind 4 e PostgreSQL.

## Como rodar

1. Instale o [Node.js](https://nodejs.org) (versão LTS) e o [PostgreSQL](https://www.postgresql.org/download/).
2. Crie um banco vazio chamado `soundprofile` (pelo pgAdmin ou com `CREATE DATABASE soundprofile;`).
3. Copie `.env.example` para `.env.local` e ajuste o usuário e a senha em `DATABASE_URL`.
4. Instale e rode:

```bash
npm install
npm run dev
```

Abra http://localhost:3000. As tabelas (`Usuario`, `Perfil`, `Sessao`, `Imagem`) são criadas automaticamente na primeira vez que o banco é usado. Se você já tinha um banco da versão anterior, ele é atualizado sozinho, sem perder dados.

## Funcionalidades prontas

- **Cadastro** (`/cadastro`) e **login** (`/login`, aceita username ou e-mail), com senha em BCrypt e sessão por cookie.
- **Catálogo**: artistas, álbuns e músicas, com busca (`/buscar`), listagem (`/musica`) e **gêneros** (`/generos`, `/generos/rock`...). Álbuns e músicas herdam os gêneros do artista.
- **Avaliações** de artistas, álbuns e músicas: nota de 0,5 a 5 e comentário opcional. Uma avaliação por usuário e por item (avaliar de novo edita). A **média da comunidade** só aparece com 3 ou mais avaliações; a nota do próprio usuário é mostrada separada.
- **Curtidas** em avaliações, **favoritos** e moderação (o administrador remove qualquer avaliação).
- **Perfil** (`/perfil/username`) com abas: visão geral, avaliações, estatísticas (gráficos por período: 7 dias, 30 dias, histórico) e rankings e favoritos. Edição de foto, banner, nome, localização e biografia em `/perfil/editar`. Foto e banner aceitam JPG, PNG, WebP e **GIF animado** (até 2 MB, no máximo 150 quadros).
- `/perfil/exemplo`: perfil de demonstração com dados fictícios (marcado como tal).
- **Social** (`/social`, só para quem está logado):
  - **Seguir**: pesquisar membros e seguir ou deixar de seguir, sem precisar de aprovação. O botão aparece em cada perfil (Seguir, Seguir de volta, Seguindo) e há abas Seguindo, Seguidores e Descobrir.
  - **Mensagens privadas** (`/social/mensagens`): conversas salvas no banco, lista lateral com busca e não lidas, emojis, estado de envio, "carregar anteriores" e "apagar conversa" só da sua lista. Ao abrir o perfil de quem você conversa, o painel mostra bio, favoritos, gêneros e avaliações recentes.
  - **Notificações** (`/social/notificacoes`): novos seguidores e mensagens não lidas. O menu tem o ícone de chat (mensagens não lidas) e um sino que abre a lista das últimas notificações.
  - A atualização do chat é por consulta a cada 4 s (funciona na Vercel). Não há WebSocket.

## Primeiro acesso: criar o administrador

O catálogo começa vazio. Quem cadastra o conteúdo é o administrador (`/admin`).

1. Crie uma conta normalmente em `/cadastro`.
2. No banco (Editor SQL do Neon, pgAdmin ou extensão do VS Code), rode, trocando pelo seu username:
   ```sql
   UPDATE Usuario SET role = 'admin' WHERE username = 'seu_usuario';
   ```
3. Entre de novo. O link **Admin** aparece no menu. Cadastre primeiro o artista, depois os álbuns e as músicas.

## Banco de dados

As tabelas são criadas e atualizadas sozinhas na primeira vez que o banco é usado (`CREATE TABLE IF NOT EXISTS` e `ALTER TABLE ... IF NOT EXISTS` em `lib/db.ts`). Não há migração manual. Novidades desta versão: `Seguidor`, `Conversa`, `ParticipanteConversa`, `Mensagem`, `Notificacao` (todas só acrescentam tabelas; nada existente é alterado) e as anteriores: `Genero`, `Artista`, `Album`, `Musica`, `ArtistaGenero`, `Avaliacao`, `CurtidaAvaliacao` e `Favorito`.

As colunas `spotifyId` já existem em `Artista`, `Album` e `Musica` para a futura integração com o Spotify preencher as mesmas tabelas.

## Ainda não implementado

- Integração com o Spotify (login, catálogo e "mais ouvidos"). Veja as restrições da API em 2026: app em modo de desenvolvimento exige Premium na conta dona e limita a 5 usuários.
- Listas musicais, denúncias, temas, loja, SoundCoins e inventário (próximas etapas da expansão).

## Estrutura

- `app/`: páginas e componentes (Next.js App Router)
- `lib/db.ts`: conexão com o PostgreSQL e criação das tabelas
- `lib/usuarios.ts`, `lib/perfis.ts`, `lib/imagens.ts`, `lib/sessao.ts`: acesso aos dados (todo SQL fica em `lib/`)
- `lib/validacao.ts`: regras de validação dos formulários

## Acesso de outras máquinas

Os usuários acessam o site, não o banco. Na mesma rede: `npm run dev -- -H 0.0.0.0` e abrir `http://IP-DO-SEU-PC:3000`.
Não exponha a porta 5432 do PostgreSQL na internet.
