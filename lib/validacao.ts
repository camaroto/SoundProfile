export type CamposCadastro = {
  username: string;
  email: string;
  password: string;
};

export type ErrosCadastro = Partial<Record<keyof CamposCadastro, string>>;

// Nomes que conflitam com rotas do site.
const RESERVADOS = ["editar", "exemplo", "admin", "api", "login", "cadastro", "sair", "perfil"];

const USERNAME = /^[a-zA-Z0-9_.]{3,20}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarCadastro({ username, email, password }: CamposCadastro): ErrosCadastro {
  const erros: ErrosCadastro = {};

  if (!USERNAME.test(username)) {
    erros.username = "Use de 3 a 20 caracteres: letras, números, _ ou ponto.";
  } else if (RESERVADOS.includes(username.toLowerCase())) {
    erros.username = "Este nome de usuário não está disponível.";
  }

  if (email.length > 254 || !EMAIL.test(email)) {
    erros.email = "Digite um e-mail válido.";
  }

  if (password.length < 8) {
    erros.password = "A senha deve ter pelo menos 8 caracteres.";
  } else if (Buffer.byteLength(password) > 72) {
    // Limite do BCrypt.
    erros.password = "A senha pode ter no máximo 72 caracteres.";
  }

  return erros;
}

export type CamposPerfil = {
  nomeExibicao: string;
  localizacao: string;
  biografia: string;
};

export type ErrosPerfil = Partial<Record<keyof CamposPerfil, string>>;

export function validarPerfil({ nomeExibicao, localizacao, biografia }: CamposPerfil): ErrosPerfil {
  const erros: ErrosPerfil = {};
  if (nomeExibicao.length > 40) erros.nomeExibicao = "O nome pode ter no máximo 40 caracteres.";
  if (localizacao.length > 60) erros.localizacao = "A localização pode ter no máximo 60 caracteres.";
  if (biografia.length > 300) erros.biografia = "A biografia pode ter no máximo 300 caracteres.";
  return erros;
}
