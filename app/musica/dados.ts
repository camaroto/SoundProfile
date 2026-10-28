// Dados de exemplo para testar a página de álbum.
// Quando existir backend, estes tipos viram a resposta da API
// (Musica / Avaliacao do modelo lógico do documento).

export type Faixa = {
  numero: number;
  titulo: string;
  nota: number; // média da faixa, 0 a 5
};

export type Avaliacao = {
  id: number;
  usuario: string;
  username: string;
  avatar: string;
  nota: number; // 0.5 a 5, em passos de 0.5
  texto: string;
  data: string;
  curtidas: number;
};

export type Album = {
  slug: string;
  titulo: string;
  artista: string;
  ano: number;
  gravadora: string;
  genero: string;
  capa: string;
  // Quantidade de avaliações por nota arredondada para cima: [1, 2, 3, 4, 5].
  // A média e o total são calculados a partir daqui.
  distribuicao: [number, number, number, number, number];
  faixas: Faixa[];
  avaliacoes: Avaliacao[];
  maisDoArtista: string[];
};

export const albuns: Album[] = [
  {
    slug: "diamond-eyes",
    titulo: "Diamond Eyes",
    artista: "Deftones",
    ano: 2010,
    gravadora: "Reprise Records",
    genero: "Alternative metal",
    capa: "/albums/diamond-eyes.avif",
    distribuicao: [12, 41, 163, 520, 548],
    faixas: [
      { numero: 1, titulo: "Diamond Eyes", nota: 4.6 },
      { numero: 2, titulo: "Royal", nota: 4.3 },
      { numero: 3, titulo: "CMND/CTRL", nota: 3.9 },
      { numero: 4, titulo: "You've Seen the Butcher", nota: 4.4 },
      { numero: 5, titulo: "Beauty School", nota: 4.5 },
      { numero: 6, titulo: "Prince", nota: 4.1 },
      { numero: 7, titulo: "Rocket Skates", nota: 3.8 },
      { numero: 8, titulo: "Sextape", nota: 4.7 },
      { numero: 9, titulo: "Risk", nota: 3.6 },
      { numero: 10, titulo: "976-EVIL", nota: 3.7 },
      { numero: 11, titulo: "This Place Is Death", nota: 4.2 },
    ],
    avaliacoes: [
      {
        id: 1,
        usuario: "Kuramoto",
        username: "kuramoto",
        avatar: "/gato.jpg",
        nota: 5,
        texto:
          "Peso e delicadeza no mesmo disco. Sextape e Beauty School me pegam toda vez, o Chino canta como se estivesse debaixo d'água. 🌊🖤",
        data: "há 2 dias",
        curtidas: 38,
      },
      {
        id: 2,
        usuario: "Luna",
        username: "luna",
        avatar: "/naruto.jpg",
        nota: 4.5,
        texto:
          "Voltar a ouvir depois de tudo que a banda passou deixa o disco ainda mais forte. Só acho que o meio do álbum cai um pouco.",
        data: "há 1 semana",
        curtidas: 17,
      },
      {
        id: 3,
        usuario: "Victor",
        username: "victor",
        avatar: "/sasuke.jpg",
        nota: 4,
        texto:
          "Porta de entrada perfeita pra quem quer conhecer Deftones sem começar pelos discos mais densos. 🎸",
        data: "há 3 semanas",
        curtidas: 9,
      },
    ],
    maisDoArtista: [
      "White Pony",
      "Around the Fur",
      "Koi No Yokan",
      "Saturday Night Wrist",
      "Ohms",
    ],
  },
];

export function resumoNotas(distribuicao: Album["distribuicao"]) {
  const total = distribuicao.reduce((soma, qtd) => soma + qtd, 0);
  const soma = distribuicao.reduce((acc, qtd, i) => acc + qtd * (i + 1), 0);
  return { total, media: total ? soma / total : 0 };
}
