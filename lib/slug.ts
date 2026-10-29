export function gerarSlug(texto: string, limite = 70): string {
  const base = texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, limite)
    .replace(/-+$/g, "");
  return base || "item";
}
