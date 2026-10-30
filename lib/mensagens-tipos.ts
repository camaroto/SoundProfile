// Tipos compartilhados entre servidor e navegador. Sem imports de servidor
// aqui: componentes de cliente podem importar este arquivo com segurança.

export const MAX_TEXTO_MENSAGEM = 2000;

export type MensagemDto = {
  idMensagem: number;
  idAutor: number;
  texto: string;
  enviadaEm: string; // ISO 8601
};

export type ResultadoEnvio = { ok: true; mensagem: MensagemDto } | { ok: false; erro: string };
