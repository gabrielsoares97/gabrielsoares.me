// Céu de fundo (nuvens de pixel de dia, estrelas à noite) e botão dia/noite.
// Usado na página inicial e nas páginas do blog: carregue antes do script.js ou do blog.js.

// Desenho de pixel em texto -> SVG. Cada letra vira uma classe de cor; "." é transparente.
// Pixels vizinhos da mesma cor viram um retângulo só, para o SVG ficar leve.
function pixelSvg(desenho, classes = {}) {
  const rects = [];
  desenho.forEach((linha, y) => {
    for (let x = 0; x < linha.length; ) {
      const p = linha[x];
      let fim = x + 1;
      while (linha[fim] === p) fim++;
      if (p !== ".") {
        rects.push(`<rect${classes[p] ? ` class="${classes[p]}"` : ""} x="${x}" y="${y}" width="${fim - x}" height="1"/>`);
      }
      x = fim;
    }
  });
  return `<svg viewBox="0 0 ${desenho[0].length} ${desenho.length}" shape-rendering="crispEdges" aria-hidden="true">${rects.join("")}</svg>`;
}

(() => {
  const $ = (id) => document.getElementById(id);
  const raiz = document.documentElement;
  const semMovimento = matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- Céu de fundo: nuvens de pixel de dia, estrelas à noite (modo escuro) ---------- */
  // Canvas fixo atrás de tudo. As nuvens ficam em 3 camadas de profundidade: as do fundo são
  // menores, mais lentas e quase não acompanham a rolagem (paralaxe), como num jogo de plataforma.
  const tela = $("fundo");
  const ctx = tela.getContext("2d");
  const modoEscuro = matchMedia("(prefers-color-scheme: dark)");

  // X = corpo da nuvem, S = sombra embaixo
  const FORMAS = [
    [
      ".......XXXX.........",
      "....XXXXXXXXX.......",
      "..XXXXXXXXXXXXXXX...",
      ".XXXXXXXXXXXXXXXXXX.",
      "XXXXXXXXXXXXXXXXXXXX",
      ".SSSSSSSSSSSSSSSSSS.",
    ],
    [
      "...XXX....",
      ".XXXXXXXX.",
      "XXXXXXXXXX",
      ".SSSSSSSS.",
    ],
    [
      "....XXX....XXXX.....",
      "..XXXXXXX.XXXXXXX...",
      ".XXXXXXXXXXXXXXXXXX.",
      "XXXXXXXXXXXXXXXXXXXX",
      "XXXXXXXXXXXXXXXXXXXX",
      ".SSSSSSSSSSSSSSSSSS.",
    ],
  ];
  const CAMADAS = [
    { pixel: 3, velocidade: 3, paralaxe: 0.04, alfa: 0.55 },
    { pixel: 5, velocidade: 6, paralaxe: 0.1, alfa: 0.75 },
    { pixel: 7, velocidade: 11, paralaxe: 0.2, alfa: 0.95 },
  ];
  const PALETAS = {
    claro: { nuvem: "#ffffff", sombra: "#c9d6fb" },
    escuro: { nuvem: "#2a2263", sombra: "#1f1950", estrela: "#efedff", dourada: "#ffc531" },
  };

  // Posições em fração da tela (0 a 1): sobrevivem a qualquer redimensionamento
  const nuvens = Array.from({ length: 14 }, (_, i) => ({
    forma: i % FORMAS.length,
    camada: i % CAMADAS.length,
    x: Math.random(),
    y: Math.random(),
  }));
  const estrelas = Array.from({ length: 160 }, () => ({
    x: Math.random(),
    y: Math.random(),
    grande: Math.random() < 0.15,
    dourada: Math.random() < 0.08,
    fase: Math.random() * Math.PI * 2,
    ritmo: 0.6 + Math.random(),
    paralaxe: 0.02 + Math.random() * 0.06,
  }));

  let largura = 0;
  let altura = 0;
  let paleta;
  let sprites = [];

  // Sem escolha do visitante (data-tema vazio), segue o tema do sistema
  const temaEscuro = () => (raiz.dataset.tema ? raiz.dataset.tema === "escuro" : modoEscuro.matches);

  // Cada forma vira uma imagem pequena (1 px por "pixel"), ampliada sem suavização na hora de desenhar
  function criarSprites() {
    paleta = temaEscuro() ? PALETAS.escuro : PALETAS.claro;
    sprites = FORMAS.map((forma) => {
      const c = document.createElement("canvas");
      c.width = forma[0].length;
      c.height = forma.length;
      const g = c.getContext("2d");
      forma.forEach((linha, y) =>
        [...linha].forEach((p, x) => {
          if (p === ".") return;
          g.fillStyle = p === "X" ? paleta.nuvem : paleta.sombra;
          g.fillRect(x, y, 1, 1);
        })
      );
      return c;
    });
  }

  function medirTela() {
    const l = tela.clientWidth;
    const a = tela.clientHeight;
    if (l === largura && a === altura) return false;
    largura = l;
    altura = a;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    tela.width = Math.round(l * dpr);
    tela.height = Math.round(a * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    return true;
  }

  const resto = (n, m) => ((n % m) + m) % m;

  function desenharCeu(t, rolagem) {
    ctx.clearRect(0, 0, largura, altura);
    const area = largura * altura;

    if (paleta.estrela) {
      const quantas = Math.min(estrelas.length, Math.max(40, Math.round(area / 7000)));
      for (let i = 0; i < quantas; i++) {
        const e = estrelas[i];
        const x = Math.round(e.x * largura);
        const y = Math.round(resto(e.y * altura - rolagem * e.paralaxe, altura));
        ctx.globalAlpha = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * e.ritmo + e.fase));
        ctx.fillStyle = e.dourada ? paleta.dourada : paleta.estrela;
        if (e.grande) {
          // "+" de pixel, o mesmo brilho do selo GS
          ctx.fillRect(x - 1, y - 3, 2, 6);
          ctx.fillRect(x - 3, y - 1, 6, 2);
        } else {
          ctx.fillRect(x, y, 2, 2);
        }
      }
    }

    const quantas = Math.min(nuvens.length, Math.max(3, Math.round(area / 100000)));
    for (let i = 0; i < quantas; i++) {
      const n = nuvens[i];
      const c = CAMADAS[n.camada];
      const s = sprites[n.forma];
      const l = s.width * c.pixel;
      const a = s.height * c.pixel;
      const faixaX = largura + l;
      const faixaY = altura + a * 2;
      const x = Math.round(resto(n.x * faixaX + t * c.velocidade, faixaX) - l);
      const y = Math.round(resto(n.y * faixaY - rolagem * c.paralaxe, faixaY) - a);
      ctx.globalAlpha = c.alfa;
      ctx.drawImage(s, x, y, l, a);
    }
    ctx.globalAlpha = 1;
  }

  // Com "reduzir movimento" ligado, o céu é desenhado uma vez e fica parado
  let animando = false;
  let ultimoQuadro = 0;
  function quadro(agora) {
    if (semMovimento.matches) {
      animando = false;
      return;
    }
    if (agora - ultimoQuadro >= 33) {
      // ~30 quadros por segundo bastam para um movimento tão lento
      ultimoQuadro = agora;
      desenharCeu(agora / 1000, scrollY);
    }
    requestAnimationFrame(quadro);
  }

  function iniciarCeu() {
    medirTela();
    desenharCeu(performance.now() / 1000, semMovimento.matches ? 0 : scrollY);
    if (!semMovimento.matches && !animando) {
      animando = true;
      requestAnimationFrame(quadro);
    }
  }

  criarSprites();
  iniciarCeu();
  addEventListener("resize", () => medirTela() && iniciarCeu());
  semMovimento.addEventListener("change", iniciarCeu);

  /* ---------- Botão dia/noite ---------- */
  // Sol de dia, lua à noite. A escolha fica salva; o script no <head> aplica antes de a página aparecer.
  const SOL = [
    ".....X.....",
    ".X.......X.",
    "....XXX....",
    "...XXXXX...",
    "..XXXXXXX..",
    "X.XXXXXXX.X",
    "..XXXXXXX..",
    "...XXXXX...",
    "....XXX....",
    ".X.......X.",
    ".....X.....",
  ];
  const LUA = [
    "..XXXX.....",
    ".XXX.......",
    "XXX........",
    "XX.........",
    "XX.........",
    "XX.........",
    "XX........X",
    "XXX......XX",
    ".XXXX..XXX.",
    "..XXXXXXX..",
    "....XXX....",
  ];
  const botaoTema = $("tema");

  function mostrarTema() {
    const escuro = temaEscuro();
    botaoTema.innerHTML = pixelSvg(escuro ? LUA : SOL);
    botaoTema.setAttribute("aria-pressed", String(escuro));
    criarSprites();
    iniciarCeu();
  }

  function alternarTema() {
    raiz.dataset.tema = temaEscuro() ? "claro" : "escuro";
    try {
      localStorage.setItem("gs-tema", raiz.dataset.tema);
    } catch {
      // sem armazenamento: vale só nesta visita
    }
    mostrarTema();
    // Som e conquista ficam com a página (script.js ou blog.js)
    dispatchEvent(new CustomEvent("gs:tema"));
  }

  botaoTema.addEventListener("click", alternarTema);
  modoEscuro.addEventListener("change", mostrarTema);
  mostrarTema();
})();
