// Formata a nota no padrão brasileiro (vírgula decimal).
export function formatarNota(nota: number, casas = 1) {
  return nota.toFixed(casas).replace(".", ",");
}
