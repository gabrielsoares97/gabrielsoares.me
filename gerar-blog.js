// Gera o blog ("Diário de bordo") a partir dos textos da pasta posts/.
//
//   node gerar-blog.js              versão para publicar: rascunhos ficam de fora
//   node gerar-blog.js --rascunhos  prévia com os rascunhos, para revisar no navegador (não suba assim)
//
// Cria blog/ (lista de posts, uma página por post e feed.xml), refaz o sitemap.xml e atualiza
// a seção "Diário de bordo" do index.html. Não precisa instalar nada: só o Node.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const SITE = "https://gabrielsoares.me";
const PASTA = __dirname;
const PASTA_POSTS = path.join(PASTA, "posts");
const PASTA_BLOG = path.join(PASTA, "blog");
const COM_RASCUNHOS = process.argv.includes("--rascunhos");
const GERADO = "<!-- Gerado pelo gerar-blog.js a partir da pasta posts/. Edite o post lá, não aqui. -->";

const NOME_BLOG = "Diário de bordo";
const INTRO_BLOG = "Dicas práticas para colocar a sua empresa na internet: sites, Google e Instagram, explicados sem complicação.";

const D = vm.runInNewContext(`${fs.readFileSync(path.join(PASTA, "dados.js"), "utf8")}\nDADOS;`);
const NOME = `${D.nome} ${D.sobrenome}`.trim();
const indexHtml = fs.readFileSync(path.join(PASTA, "index.html"), "utf8");
// Mesma versão dos arquivos da página inicial, para o cache do navegador andar junto
const VERSAO = (indexHtml.match(/style\.css\?v=([^"]+)"/) || [])[1] || "1";
// O selo GS mora no index.html; as páginas do blog usam o mesmo desenho
const SIMBOLO_SELO = (indexHtml.match(/<svg width="0"[\s\S]*?<\/svg>/) || [""])[0];

const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const jsonLd = (obj) => JSON.stringify(obj, null, 2).replace(/</g, "\\u003c");

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const partesData = (data) => data.split("-").map(Number);
function dataLonga(data) {
  const [a, m, d] = partesData(data);
  return `${d} de ${MESES[m - 1]} de ${a}`;
}
function dataCurta(data) {
  const [a, m, d] = partesData(data);
  return `${d} ${MESES[m - 1].slice(0, 3)} ${a}`;
}
const dataRss = (data) => new Date(`${data}T12:00:00Z`).toUTCString();
const hojeIso = () => new Date().toISOString().slice(0, 10);

function linkWhatsApp(texto) {
  const wa = D.links.find((l) => l.nome === "WhatsApp");
  if (!wa) return `mailto:${D.email}`;
  const url = new URL(wa.url);
  return `${url.origin}${url.pathname}?text=${encodeURIComponent(texto)}`;
}

/* ---------- Markdown (o básico que um post precisa) ---------- */
// ## e ### títulos, parágrafos, listas com - ou 1., > destaque, **negrito**, *itálico*, `código`,
// [link](endereço) e ![imagem](endereço). Links para outros posts: [texto](../outro-post/).

const semAcento = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");
const paraSlug = (s) => semAcento(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function inline(texto, links) {
  const codigos = [];
  const semCodigo = texto.replace(/`([^`]+)`/g, (_, c) => `\u0000${codigos.push(c) - 1}\u0000`);
  // Aspas retas viram curvas: "assim" -> “assim”
  return esc(semCodigo.replace(/"([^"]+)"/g, "“$1”"))
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" loading="lazy">')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, url) => {
      links.push(url);
      return /^https?:/.test(url) ? `<a href="${url}" target="_blank" rel="noopener">${t}</a>` : `<a href="${url}">${t}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codigos[i])}</code>`);
}

const RE_ITEM_UL = /^\s*[-*]\s+/;
const RE_ITEM_OL = /^\s*\d+[.)]\s+/;
const inicioDeBloco = (l) => /^#{1,6}\s/.test(l) || RE_ITEM_UL.test(l) || RE_ITEM_OL.test(l) || /^>/.test(l) || /^-{3,}\s*$/.test(l);

function markdown(md, arquivo, ids = new Set()) {
  const linhas = md.split("\n");
  const html = [];
  const indice = [];
  const links = [];
  let i = 0;

  while (i < linhas.length) {
    const l = linhas[i];
    let m;
    if (!l.trim()) {
      i++;
    } else if ((m = l.match(/^(#{1,6})\s+(.*)$/))) {
      // # fica reservado para o título do post (no cabeçalho): no texto, o maior é ##
      if (m[1].length === 1) aviso(arquivo, `"# ${m[2]}" virou ##: o título do post já é o maior da página.`);
      const nivel = Math.min(4, Math.max(2, m[1].length));
      let id = paraSlug(m[2]) || "secao";
      for (let n = 2; ids.has(id); n++) id = `${paraSlug(m[2])}-${n}`;
      ids.add(id);
      html.push(`<h${nivel} id="${id}">${inline(m[2], links)}</h${nivel}>`);
      if (nivel === 2) indice.push({ id, texto: m[2] });
      i++;
    } else if (RE_ITEM_UL.test(l) || RE_ITEM_OL.test(l)) {
      const re = RE_ITEM_UL.test(l) ? RE_ITEM_UL : RE_ITEM_OL;
      const tag = re === RE_ITEM_UL ? "ul" : "ol";
      const itens = [];
      while (i < linhas.length && (re.test(linhas[i]) || (/^\s{2,}\S/.test(linhas[i]) && itens.length))) {
        if (re.test(linhas[i])) itens.push(linhas[i].replace(re, ""));
        else itens[itens.length - 1] += ` ${linhas[i].trim()}`; // continuação do item, indentada
        i++;
      }
      html.push(`<${tag}>${itens.map((t) => `<li>${inline(t, links)}</li>`).join("")}</${tag}>`);
    } else if (l.startsWith(">")) {
      const dentro = [];
      while (i < linhas.length && linhas[i].startsWith(">")) dentro.push(linhas[i++].replace(/^>\s?/, ""));
      const r = markdown(dentro.join("\n"), arquivo, ids);
      links.push(...r.links);
      html.push(`<blockquote>${r.html}</blockquote>`);
    } else if (/^-{3,}\s*$/.test(l)) {
      html.push("<hr>");
      i++;
    } else {
      const partes = [];
      while (i < linhas.length && linhas[i].trim() && !inicioDeBloco(linhas[i])) partes.push(linhas[i++].trim());
      html.push(`<p>${inline(partes.join(" "), links)}</p>`);
    }
  }
  return { html: html.join("\n"), indice, links };
}

const minutosDeLeitura = (md) => Math.max(1, Math.round(md.split(/\s+/).filter((p) => /\w/.test(p)).length / 200));

/* ---------- Leitura dos posts ---------- */

const avisos = [];
function aviso(arquivo, texto) {
  avisos.push(`${arquivo}: ${texto}`);
}
function falhar(arquivo, texto) {
  console.error(`\n✗ posts/${arquivo}: ${texto}\n`);
  process.exit(1);
}

function lerPosts() {
  if (!fs.existsSync(PASTA_POSTS)) return [];
  return fs
    .readdirSync(PASTA_POSTS)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_")) // _modelo.md e afins não viram post
    .map((arquivo) => {
      const bruto = fs.readFileSync(path.join(PASTA_POSTS, arquivo), "utf8").replace(/^﻿/, "").replace(/\r\n?/g, "\n");
      const m = bruto.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
      if (!m) falhar(arquivo, "o post precisa começar com o cabeçalho entre duas linhas ---.");

      const meta = {};
      for (const linha of m[1].split("\n")) {
        if (!linha.trim() || linha.trim().startsWith("#")) continue;
        const i = linha.indexOf(":");
        if (i < 0) falhar(arquivo, `linha do cabeçalho sem "chave: valor": ${linha}`);
        const valor = linha.slice(i + 1).trim().replace(/^(["'])(.*)\1$/, "$2");
        meta[linha.slice(0, i).trim()] = valor === "true" ? true : valor === "false" ? false : valor;
      }
      for (const c of ["titulo", "descricao", "data"]) if (!meta[c]) falhar(arquivo, `falta "${c}:" no cabeçalho.`);
      for (const c of ["data", "atualizado"]) {
        if (meta[c] && !/^\d{4}-\d{2}-\d{2}$/.test(meta[c])) falhar(arquivo, `"${c}" precisa ser no formato ano-mês-dia, ex.: 2026-10-28.`);
      }

      const slug = arquivo.replace(/\.md$/, "");
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
        falhar(arquivo, "o nome do arquivo vira o endereço do post: use só letras minúsculas sem acento, números e hífens.");
      }
      // O Google corta títulos e descrições compridos nos resultados
      if (meta.titulo.length > 70) aviso(arquivo, `título com ${meta.titulo.length} caracteres: o Google costuma cortar depois de uns 60.`);
      if (meta.descricao.length > 160) aviso(arquivo, `descrição com ${meta.descricao.length} caracteres: o Google costuma cortar depois de uns 155.`);

      const { html, indice, links } = markdown(m[2], arquivo);
      return { ...meta, slug, rascunho: meta.rascunho === true, html, indice, links, minutos: minutosDeLeitura(m[2]) };
    })
    .sort((a, b) => b.data.localeCompare(a.data) || a.titulo.localeCompare(b.titulo));
}

/* ---------- Pedaços de HTML ---------- */

function cartao(p, prefixo, nivel) {
  return `<li class="post-card">
        <span class="medalha" aria-hidden="true">${esc(p.icone || "📝")}</span>
        <div class="post-card-texto">
          <p class="post-card-meta"><time datetime="${p.data}">${dataCurta(p.data)}</time> · ${p.minutos} min de leitura</p>
          <h${nivel}><a href="${prefixo}${p.slug}/">${esc(p.titulo)}</a></h${nivel}>
          <p>${esc(p.descricao)}</p>${p.rascunho ? `\n          <span class="selo-rascunho">Rascunho</span>` : ""}
        </div>
      </li>`;
}

function pagina({ titulo, descricao, caminho, raiz, tipo, robots, dados, extraHead = "", corpo }) {
  const url = `${SITE}/${caminho}`;
  return `<!doctype html>
${GERADO}
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(titulo)}</title>
  <meta name="description" content="${esc(descricao)}">
  <link rel="canonical" href="${url}">
  <meta name="robots" content="${robots}">
  <meta name="author" content="${esc(NOME)}">
  <meta name="theme-color" content="#ffc531">
  <meta name="color-scheme" content="light dark">

  <meta property="og:type" content="${tipo}">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:site_name" content="${esc(NOME)}">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${esc(titulo)}">
  <meta property="og:description" content="${esc(descricao)}">
  <meta property="og:image" content="${SITE}/logo/gabriel-soares-lockup.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="500">
  <meta property="og:image:alt" content="Logo ${esc(NOME)}">
  <meta name="twitter:card" content="summary_large_image">${extraHead}
  <link rel="alternate" type="application/rss+xml" title="${NOME_BLOG} | ${esc(NOME)}" href="${SITE}/blog/feed.xml">

  <script type="application/ld+json">
${jsonLd(dados)}
  </script>
  <link rel="icon" type="image/png" sizes="48x48" href="${raiz}logo/favicon.png">
  <link rel="apple-touch-icon" href="${raiz}logo/favicon.png">
  <link rel="preload" href="${raiz}fontes/bricolage-grotesque.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="${raiz}fontes/figtree.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${raiz}style.css?v=${VERSAO}">
  <script>try { var t = localStorage.getItem("gs-tema"); if (t) document.documentElement.dataset.tema = t; } catch (e) {}</script>
</head>
<body class="pagina-blog">
  <a class="pular" href="#conteudo">Pular para o conteúdo</a>
  <canvas class="fundo" id="fundo" aria-hidden="true"></canvas>

  ${SIMBOLO_SELO}

  <header class="topo">
    <a class="marca" href="${raiz}">
      <svg class="selo" aria-hidden="true"><use href="#selo-gs" /></svg>
      <span>${esc(D.nome)}<span class="marca-sobrenome"> ${esc(D.sobrenome)}</span></span>
    </a>
    <nav aria-label="Site">
      <a href="${raiz}#servicos">Serviços</a>
      <a href="${raiz}#projetos">Projetos</a>
      <a href="${raiz}#sobre">Sobre</a>
      <a href="${raiz}#jogo" class="so-largo">Jogar</a>
      <a href="${raiz}blog/" aria-current="page">Blog</a>
      <a href="${raiz}#contato">Contato</a>
    </nav>
    <button type="button" class="som tema" id="tema" aria-pressed="false" aria-label="Modo noite" title="Trocar entre dia e noite"></button>
  </header>

  <main id="conteudo">
${corpo}
  </main>

  <footer class="rodape">
    <p>© ${new Date().getFullYear()} ${esc(NOME)}. Feito à mão, sem template.</p>
    <p><a class="botao-link" href="${raiz}">Voltar para o site</a> <a class="botao-link" href="${raiz}blog/feed.xml">RSS</a></p>
  </footer>

  ${tipo === "article" ? `<div class="progresso" id="progresso" aria-hidden="true"></div>\n  ` : ""}<div class="toasts" id="toasts" aria-live="polite" popover="manual"></div>

  <script src="${raiz}ceu.js?v=${VERSAO}"></script>
  <script src="${raiz}blog.js?v=${VERSAO}"></script>
</body>
</html>
`;
}

const PESSOA = { "@type": "Person", "@id": `${SITE}/#gabriel`, name: NOME, url: `${SITE}/` };
const BLOG = { "@type": "Blog", "@id": `${SITE}/blog/#blog`, name: NOME_BLOG, url: `${SITE}/blog/` };

function migalhas(itens) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: itens.map(([nome, item], i) => ({ "@type": "ListItem", position: i + 1, name: nome, item })),
  };
}

function paginaPost(p, todos) {
  const url = `${SITE}/blog/${p.slug}/`;
  const outros = todos.filter((o) => o !== p).slice(0, 3);
  // "Neste post" entra depois da introdução, logo antes do primeiro título
  const indice =
    p.indice.length >= 3
      ? `<nav class="post-indice" aria-labelledby="t-indice">
<p id="t-indice">Neste post</p>
<ol>${p.indice.map((t) => `<li><a href="#${t.id}">${inline(t.texto, [])}</a></li>`).join("")}</ol>
</nav>
`
      : "";
  const primeiroTitulo = p.html.indexOf("<h2");
  const texto = primeiroTitulo < 0 ? indice + p.html : p.html.slice(0, primeiroTitulo) + indice + p.html.slice(primeiroTitulo);
  const zap = linkWhatsApp(`Oi Gabriel! Li o post “${p.titulo}” no seu site e quero conversar.`);
  const compartilhar = `https://wa.me/?text=${encodeURIComponent(`${p.titulo} ${url}`)}`;

  const corpo = `    <article class="post">
      ${p.rascunho ? `<p class="aviso-rascunho"><strong>Rascunho.</strong> Esta página ainda não foi publicada e está escondida do Google.</p>\n      ` : ""}<header class="post-cabeca">
        <nav class="migalhas" aria-label="Você está aqui"><a href="../../">Início</a> <span aria-hidden="true">›</span> <a href="../">Blog</a></nav>
        <p class="olho">${NOME_BLOG}</p>
        <h1>${esc(p.titulo)}</h1>
        <p class="post-resumo">${esc(p.descricao)}</p>
        <p class="post-meta">${
          D.foto
            ? `\n          <img class="post-autor" src="../../${esc(D.foto)}" alt="" width="40" height="40" style="object-position: ${esc(D.fotoEnquadramento)}">`
            : ""
        }
          <span>Por <strong>${esc(NOME)}</strong></span>
          <time datetime="${p.data}">${dataLonga(p.data)}</time>
          <span>${p.minutos} min de leitura</span>
        </p>
      </header>

      <div class="post-corpo">
${texto}
      </div>

      <aside class="post-fim" id="fim-do-post" aria-labelledby="t-fim">
        <p class="olho">Fase concluída</p>
        <h2 id="t-fim">Quer colocar isso em prática?</h2>
        <p>Me conte a sua ideia no WhatsApp. Você fala direto comigo, do primeiro orçamento até o projeto no ar.</p>
        <div class="acoes">
          <a class="botao primario" href="${esc(zap)}" target="_blank" rel="noopener">Chamar no WhatsApp</a>
          <a class="botao" href="../../#contato">Monte sua missão</a>
        </div>
      </aside>

      <p class="post-compartilhar">
        Gostou? Mande para alguém:
        <a class="botao-link" href="${esc(compartilhar)}" target="_blank" rel="noopener">WhatsApp</a>
        <button type="button" class="botao-link" id="copiar-link">Copiar link</button>
      </p>
    </article>
${
  outros.length
    ? `
    <section class="secao" aria-labelledby="t-mais">
      <div class="secao-cabeca">
        <div>
          <p class="olho">Próximas fases</p>
          <h2 id="t-mais">Continue lendo</h2>
        </div>
        <p><a class="botao-link" href="../">Todos os posts</a></p>
      </div>
      <ul class="posts">
      ${outros.map((o) => cartao(o, "../", 3)).join("\n      ")}
      </ul>
    </section>`
    : ""
}`;

  return pagina({
    titulo: `${p.titulo} | ${NOME}`,
    descricao: p.descricao,
    caminho: `blog/${p.slug}/`,
    raiz: "../../",
    tipo: "article",
    robots: p.rascunho ? "noindex, nofollow" : "index, follow",
    extraHead: `\n  <meta property="article:published_time" content="${p.data}">${p.atualizado ? `\n  <meta property="article:modified_time" content="${p.atualizado}">` : ""}\n  <meta property="article:author" content="${esc(NOME)}">`,
    dados: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BlogPosting",
          "@id": `${url}#post`,
          headline: p.titulo,
          description: p.descricao,
          datePublished: p.data,
          dateModified: p.atualizado || p.data,
          inLanguage: "pt-BR",
          url,
          mainEntityOfPage: url,
          image: `${SITE}/logo/gabriel-soares-lockup.png`,
          author: PESSOA,
          publisher: PESSOA,
          isPartOf: BLOG,
        },
        migalhas([["Início", `${SITE}/`], ["Blog", `${SITE}/blog/`], [p.titulo, url]]),
      ],
    },
    corpo,
  });
}

function paginaLista(posts) {
  const lista = posts.length
    ? `<ul class="posts">
      ${posts.map((p) => cartao(p, "", 2)).join("\n      ")}
      </ul>`
    : `<p class="posts-vazio">Os primeiros posts estão a caminho. Enquanto isso, que tal <a class="botao-link" href="../#jogo">uma partida na fase bônus</a>?</p>`;

  const corpo = `    <section class="secao blog-topo" aria-labelledby="t-blog">
      <nav class="migalhas" aria-label="Você está aqui"><a href="../">Início</a> <span aria-hidden="true">›</span> Blog</nav>
      <p class="olho">Blog</p>
      <h1 id="t-blog">${NOME_BLOG}</h1>
      <p class="blog-intro">${INTRO_BLOG}</p>
    </section>

    <section class="secao blog-lista" aria-label="Posts">
      ${lista}
    </section>`;

  return pagina({
    titulo: `Blog: dicas de sites e Google para empresas | ${NOME}`,
    descricao: `${INTRO_BLOG} Por ${NOME}, desenvolvedor em ${D.cidade}.`,
    caminho: "blog/",
    raiz: "../",
    tipo: "website",
    robots: "index, follow",
    dados: {
      "@context": "https://schema.org",
      "@graph": [
        {
          ...BLOG,
          description: INTRO_BLOG,
          inLanguage: "pt-BR",
          author: PESSOA,
          blogPost: posts
            .filter((p) => !p.rascunho)
            .map((p) => ({ "@type": "BlogPosting", headline: p.titulo, url: `${SITE}/blog/${p.slug}/`, datePublished: p.data })),
        },
        migalhas([["Início", `${SITE}/`], ["Blog", `${SITE}/blog/`]]),
      ],
    },
    corpo,
  });
}

function secaoInicio(posts) {
  if (!posts.length) return "";
  // Fica dentro da faixa do Mundo 3, logo depois das perguntas frequentes
  return `
      <section class="secao" id="blog" aria-labelledby="t-blog">
        <div class="secao-cabeca">
          <div>
            <p class="olho">Mundo 3-2</p>
            <h2 id="t-blog">${NOME_BLOG}</h2>
          </div>
          <p>${INTRO_BLOG} <a class="botao-link" href="blog/">Ver todos os posts</a></p>
        </div>
        <ul class="posts">
        ${posts.slice(0, 3).map((p) => cartao(p, "blog/", 3)).join("\n        ")}
        </ul>
      </section>
      `;
}

function feed(posts) {
  const itens = posts
    .map(
      (p) => `    <item>
      <title>${esc(p.titulo)}</title>
      <link>${SITE}/blog/${p.slug}/</link>
      <guid>${SITE}/blog/${p.slug}/</guid>
      <pubDate>${dataRss(p.data)}</pubDate>
      <description>${esc(p.descricao)}</description>
    </item>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${NOME_BLOG} | ${esc(NOME)}</title>
    <link>${SITE}/blog/</link>
    <atom:link href="${SITE}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    <description>${esc(INTRO_BLOG)}</description>
    <language>pt-BR</language>
${itens}
  </channel>
</rss>
`;
}

function sitemap(publicados, dataDoSite) {
  const urls = [[`${SITE}/`, dataDoSite]];
  if (publicados.length) {
    urls.push([`${SITE}/blog/`, publicados.map((p) => p.atualizado || p.data).sort().pop()]);
    for (const p of publicados) urls.push([`${SITE}/blog/${p.slug}/`, p.atualizado || p.data]);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([loc, lastmod]) => `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`).join("\n")}
</urlset>
`;
}

/* ---------- Gravação ---------- */

const gravados = [];
// Só regrava o que mudou: a data do arquivo continua dizendo quando ele mudou de verdade
function gravar(relativo, conteudo) {
  const destino = path.join(PASTA, relativo);
  if (fs.existsSync(destino) && fs.readFileSync(destino, "utf8") === conteudo) return;
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, conteudo);
  gravados.push(relativo);
}

const todos = lerPosts();
const publicados = todos.filter((p) => !p.rascunho);
const visiveis = COM_RASCUNHOS ? todos : publicados;
const slugsVisiveis = new Set(visiveis.map((p) => p.slug));

// Link para um post que não vai estar no ar vira página quebrada
for (const p of visiveis) {
  for (const url of p.links) {
    const alvo = url.match(/^\.\.\/([a-z0-9-]+)\/?(#.*)?$/);
    if (alvo && !slugsVisiveis.has(alvo[1])) aviso(`${p.slug}.md`, `o link "${url}" aponta para um post que não está publicado.`);
  }
}

// Data da página inicial no sitemap: a última vez que algum arquivo dela mudou (antes de este script mexer)
const dataDoSite = ["index.html", "dados.js", "script.js", "style.css"]
  .map((f) => fs.statSync(path.join(PASTA, f)).mtime)
  .sort((a, b) => b - a)[0]
  .toISOString()
  .slice(0, 10);

for (const p of visiveis) gravar(`blog/${p.slug}/index.html`, paginaPost(p, visiveis));
gravar("blog/index.html", paginaLista(visiveis));
gravar("blog/feed.xml", feed(publicados));
gravar("sitemap.xml", sitemap(publicados, dataDoSite));

// Seção na página inicial, entre os marcadores
const INICIO = "<!-- blog:inicio -->";
const FIM = "<!-- blog:fim -->";
const a = indexHtml.indexOf(INICIO);
const b = indexHtml.indexOf(FIM);
if (a < 0 || b < a) {
  aviso("index.html", `não achei os marcadores ${INICIO} e ${FIM}: a seção do blog na página inicial não foi atualizada.`);
} else {
  gravar("index.html", indexHtml.slice(0, a + INICIO.length) + secaoInicio(visiveis) + indexHtml.slice(b));
}

// Apaga a página de post que saiu (renomeado, apagado ou voltou a ser rascunho). Só mexe no que este script gerou.
for (const pasta of fs.existsSync(PASTA_BLOG) ? fs.readdirSync(PASTA_BLOG, { withFileTypes: true }) : []) {
  if (!pasta.isDirectory() || slugsVisiveis.has(pasta.name)) continue;
  const dir = path.join(PASTA_BLOG, pasta.name);
  const arquivos = fs.readdirSync(dir);
  const gerado = arquivos.length === 1 && arquivos[0] === "index.html" && fs.readFileSync(path.join(dir, "index.html"), "utf8").includes(GERADO);
  if (gerado) {
    fs.rmSync(dir, { recursive: true });
    gravados.push(`blog/${pasta.name}/ (removido)`);
  }
}

/* ---------- Resumo ---------- */

const rascunhos = todos.length - publicados.length;
console.log(`\nDiário de bordo: ${publicados.length} post(s) publicado(s), ${rascunhos} rascunho(s).`);
for (const p of visiveis) console.log(`  ${p.rascunho ? "[rascunho] " : ""}blog/${p.slug}/  (${p.minutos} min)`);
console.log(gravados.length ? `\nArquivos atualizados:\n${gravados.map((g) => `  ${g}`).join("\n")}` : "\nNada mudou.");
if (avisos.length) console.log(`\nAvisos:\n${avisos.map((t) => `  ⚠ ${t}`).join("\n")}`);
if (COM_RASCUNHOS && rascunhos) {
  console.log("\n⚠ PRÉVIA: os rascunhos estão no blog e na página inicial. Antes de subir o site, rode de novo sem --rascunhos.");
}
console.log("");
