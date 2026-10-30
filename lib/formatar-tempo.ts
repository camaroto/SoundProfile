const FUSO = "America/Sao_Paulo";

const dia = (d: Date) => new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, day: "2-digit", month: "2-digit", year: "numeric" }).format(d);

// "14:32" se for hoje, "28/10" nos outros dias. Usado na lista de conversas.
export function formatarCurto(data: Date): string {
  if (dia(data) === dia(new Date())) {
    return new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, hour: "2-digit", minute: "2-digit" }).format(data);
  }
  return new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, day: "2-digit", month: "2-digit" }).format(data);
}

export function formatarDataHora(data: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(data);
}
