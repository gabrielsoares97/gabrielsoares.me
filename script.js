(() => {
  const d = DADOS;
  const $ = (id) => document.getElementById(id);
  const esc = (s = "") =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const nomeCompleto = `${d.nome} ${d.sobrenome}`.trim();
  const semMovimento = matchMedia("(prefers-reduced-motion: reduce)");

  const MOEDA = [
    "..OOOO..",
    ".OYYYYO.",
    "OYWYYYDO",
    "OYWYDYDO",
    "OYWYDYDO",
    "OYYYYYDO",
    ".ODDDDO.",
    "..OOOO..",
  ];
  const CORES_MOEDA = { O: "m-o", Y: "m-y", W: "m-w", D: "m-d" };
  const moedaSvg = () => pixelSvg(MOEDA, CORES_MOEDA);

  const TROFEU = [
    "..XXXXXXXX..",
    "XXXXXXXXXXXX",
    "X.XXXXXXXX.X",
    "X.XXXXXXXX.X",
    ".XXXXXXXXXX.",
    "...XXXXXX...",
    "....XXXX....",
    ".....XX.....",
    ".....XX.....",
    "....XXXX....",
    "...XXXXXX...",
    "...XXXXXX...",
  ];

  const CORACAO = [
    ".XX.XX.",
    "XXXXXXX",
    "XXXXXXX",
    ".XXXXX.",
    "..XXX..",
    "...X...",
  ];

  // Ícones de pixel das redes (decorativos: o nome da rede vai escrito no botão)
  const ICONES_REDE = {
    WhatsApp: [
      "...XXXXXXX...",
      ".XX.......XX.",
      "X...........X",
      "X...........X",
      "X..XX.XX.XX.X",
      "X..XX.XX.XX.X",
      "X...........X",
      "X...........X",
      ".XX.......XX.",
      "..X.XXXXXXX..",
      ".X.X.........",
      "XX...........",
    ],
    Instagram: [
      ".XXXXXXXXXXX.",
      "X...........X",
      "X........XX.X",
      "X........XX.X",
      "X...XXXXX...X",
      "X..X.....X..X",
      "X..X.....X..X",
      "X..X.....X..X",
      "X...XXXXX...X",
      "X...........X",
      "X...........X",
      ".XXXXXXXXXXX.",
    ],
    LinkedIn: [
      "XXXXXXXXXXXXX",
      "X...........X",
      "X.XX........X",
      "X.XX........X",
      "X...........X",
      "X.XX.XXXXX..X",
      "X.XX.XX..XX.X",
      "X.XX.XX..XX.X",
      "X.XX.XX..XX.X",
      "X.XX.XX..XX.X",
      "X...........X",
      "XXXXXXXXXXXXX",
    ],
    GitHub: [
      ".............",
      "...X.....X...",
      "..X.....X....",
      ".X.....X.....",
      "X.....X...X..",
      "X....X.....X.",
      ".X..X.......X",
      "..XX.......X.",
      "...X......X..",
      "..X......X...",
      ".............",
      ".............",
    ],
  };
  const iconeRede = (nome) => (ICONES_REDE[nome] ? pixelSvg(ICONES_REDE[nome]) : "");

  /* ---------- Sons 8-bit, gerados na hora pelo navegador (sem arquivos de áudio) ---------- */
  const botaoSom = $("som");
  const som = (() => {
    let ctx = null;
    let ligado = true;
    try {
      ligado = localStorage.getItem("gs-som") !== "desligado";
    } catch {
      // sem armazenamento: começa ligado
    }

    // Navegadores só liberam áudio depois de um clique, toque ou tecla
    function acordar() {
      if (!ctx) {
        const Contexto = window.AudioContext || window.webkitAudioContext;
        if (!Contexto) return;
        ctx = new Contexto();
      }
      if (ctx.state === "suspended") ctx.resume();
    }
    addEventListener("pointerdown", acordar, { capture: true, passive: true });
    addEventListener("keydown", acordar, { capture: true });

    // Uma nota: frequência inicial, quando começa, quanto dura, forma de onda, volume e frequência final
    function nota(freq, t0, duracao, { onda = "square", volume = 0.05, ate } = {}) {
      const osc = ctx.createOscillator();
      const ganho = ctx.createGain();
      osc.type = onda;
      osc.frequency.setValueAtTime(freq, t0);
      if (ate) osc.frequency.exponentialRampToValueAtTime(ate, t0 + duracao);
      ganho.gain.setValueAtTime(volume, t0);
      ganho.gain.exponentialRampToValueAtTime(0.0001, t0 + duracao);
      osc.connect(ganho).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + duracao + 0.02);
    }

    const EFEITOS = {
      blip: (t) => nota(660, t, 0.06, { ate: 990, volume: 0.04 }),
      moeda: (t) => {
        nota(988, t, 0.07);
        nota(1319, t + 0.07, 0.3);
      },
      conquista: (t) => [523, 659, 784, 1047].forEach((f, i) => nota(f, t + i * 0.08, i === 3 ? 0.4 : 0.1)),
      abrir: (t) => {
        nota(392, t, 0.07, { volume: 0.04 });
        nota(587, t + 0.07, 0.14, { volume: 0.04 });
      },
      fechar: (t) => {
        nota(587, t, 0.07, { volume: 0.04 });
        nota(392, t + 0.07, 0.14, { volume: 0.04 });
      },
      tema: (t) => nota(240, t, 0.18, { onda: "triangle", ate: 620, volume: 0.09 }),
      alerta: (t) => [880, 660, 880, 660].forEach((f, i) => nota(f, t + i * 0.14, 0.12, { volume: 0.04 })),
      explosao: (t) => nota(320, t, 0.12, { ate: 70, volume: 0.035 }),
      dano: (t) => nota(330, t, 0.35, { onda: "sawtooth", ate: 70, volume: 0.05 }),
      item: (t) => [784, 988, 1319].forEach((f, i) => nota(f, t + i * 0.05, 0.08, { volume: 0.04 })),
      fimDeJogo: (t) => [523, 415, 330, 262].forEach((f, i) => nota(f, t + i * 0.13, i === 3 ? 0.45 : 0.12, { onda: "triangle", volume: 0.09 })),
    };

    function mostrarBotao() {
      botaoSom.setAttribute("aria-pressed", String(ligado));
    }
    mostrarBotao();

    return {
      tocar(nome) {
        if (!ligado || !ctx || ctx.state !== "running") return;
        EFEITOS[nome](ctx.currentTime + 0.01);
      },
      alternar() {
        ligado = !ligado;
        try {
          localStorage.setItem("gs-som", ligado ? "ligado" : "desligado");
        } catch {
          // idem
        }
        mostrarBotao();
        this.tocar("blip");
      },
    };
  })();

  botaoSom.addEventListener("click", () => som.alternar());

  // Clique comum em link ou botão faz "blip"; os que têm som próprio ficam de fora.
  // Também é aqui que saem as conquistas de abrir o Instagram e de pedir orçamento.
  document.addEventListener("click", (e) => {
    const alvo = e.target.closest("a, button");
    if (!alvo) return;
    if (!alvo.matches("#som, #tema, #like, [data-projeto], .modal-fechar, #hud, #ver-conquistas, .moeda-escondida, [data-jogo], [data-opcao], #abrir-terminal")) {
      som.tocar("blip");
    }
    if (alvo.href?.includes("instagram.com")) desbloquear("instagram");
    if (alvo.href?.includes("wa.me")) desbloquear("missao");
  });

  /* ---------- Faíscas de pixel em cada clique ---------- */
  const CORES_FAISCA = ["var(--moeda)", "var(--cereja)", "var(--grama)", "var(--rara)"];
  addEventListener(
    "pointerdown",
    (e) => {
      if (semMovimento.matches) return;
      for (let i = 0; i < 8; i++) {
        const angulo = (i / 8) * Math.PI * 2;
        const distancia = 22 + Math.random() * 12;
        const f = document.createElement("span");
        f.className = "faisca";
        f.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;--cor:${CORES_FAISCA[i % 4]};--dx:${Math.round(Math.cos(angulo) * distancia)}px;--dy:${Math.round(Math.sin(angulo) * distancia)}px`;
        document.body.appendChild(f);
        setTimeout(() => f.remove(), 600);
      }
    },
    { passive: true }
  );

  /* ---------- Nível e XP pelos anos de carreira ---------- */
  const inicio = new Date(d.inicioCarreira);
  const hoje = new Date();
  let nivel = hoje.getFullYear() - inicio.getFullYear();
  let ultimoAniversario = new Date(inicio);
  ultimoAniversario.setFullYear(inicio.getFullYear() + nivel);
  if (ultimoAniversario > hoje) {
    nivel -= 1;
    ultimoAniversario.setFullYear(ultimoAniversario.getFullYear() - 1);
  }
  const proximo = new Date(ultimoAniversario);
  proximo.setFullYear(proximo.getFullYear() + 1);
  const xp = Math.round(((hoje - ultimoAniversario) / (proximo - ultimoAniversario)) * 100);
  const diasFaltando = Math.ceil((proximo - hoje) / 86400000);

  /* ---------- Hero e ficha ---------- */
  // Em telas bem estreitas o sobrenome some do topo para caber o troféu e os botões
  $("marca").innerHTML = `${esc(d.nome)}<span class="marca-sobrenome"> ${esc(d.sobrenome)}</span>`;
  $("hero-titulo").textContent = `Oi, eu sou ${d.nome}.`;
  $("hero-resumo").textContent = d.resumo;
  $("status").textContent = d.status || "";

  if (d.curriculoPdf) {
    $("hero-acoes").insertAdjacentHTML(
      "beforeend",
      `<a class="botao" href="${esc(d.curriculoPdf)}" download>Baixar currículo</a>`
    );
  }

  $("avatar").innerHTML = '<svg class="selo"><use href="#selo-gs" /></svg>';
  $("retrato").innerHTML = d.foto
    ? `<img src="${esc(d.foto)}" alt="Foto de ${esc(nomeCompleto)}" style="object-position: ${esc(d.fotoEnquadramento || "center")}">`
    : `<div class="retrato-vazio">
        <strong>Sua foto aqui</strong>
        <span>Coloque a imagem na pasta do site e preencha <code>foto</code> no dados.js</span>
      </div>`;
  $("ficha-nome").textContent = nomeCompleto;
  $("ficha-classe").textContent = `Classe: ${d.titulo}`;
  $("nivel-num").textContent = `Nível ${Math.max(nivel, 1)}`;
  $("nivel-dica").textContent = `${diasFaltando} ${diasFaltando === 1 ? "dia" : "dias"} para o nível ${Math.max(nivel, 1) + 1}`;
  $("xp").setAttribute("aria-valuenow", xp);
  $("xp").title = `1 nível = 1 ano programando profissionalmente. ${xp}% do caminho até o próximo.`;
  requestAnimationFrame(() => requestAnimationFrame(() => ($("xp-barra").style.width = `${xp}%`)));

  const desbloqueadasDados = d.conquistas.filter((c) => !c.emAndamento);
  const emAndamento = d.conquistas.filter((c) => c.emAndamento);
  $("stat-conquistas").textContent = desbloqueadasDados.length;
  $("stat-projetos").textContent = d.projetosEntregues || d.projetos.length;
  $("stat-base").textContent = d.cidade;

  /* ---------- Sobre ---------- */
  const italico = (t) => esc(t).replace(/\*(.+?)\*/g, "<em>$1</em>");
  $("sobre-texto").innerHTML = d.sobre.map((p) => `<p>${italico(p)}</p>`).join("");

  /* ---------- Serviços ---------- */
  const numeroWhats = d.links.find((l) => l.nome === "WhatsApp")?.url.match(/wa\.me\/(\d+)/)?.[1];
  const linkOrcamento = (s) =>
    numeroWhats
      ? `https://wa.me/${numeroWhats}?text=${encodeURIComponent(`Oi Gabriel! Vi seu site e quero um orçamento de ${s.nome.toLowerCase()}.`)}`
      : `mailto:${d.email}?subject=${encodeURIComponent(`Orçamento: ${s.nome}`)}`;

  $("lista-servicos").innerHTML = (d.servicos || [])
    .map(
      (s) => `
      <li class="servico">
        <div class="medalha" aria-hidden="true">${esc(s.icone)}</div>
        <h3>${esc(s.nome)}</h3>
        <p>${esc(s.descricao)}</p>
        ${s.inclui?.length ? `<ul class="servico-inclui">${s.inclui.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
        <div class="servico-rodape">
          ${s.preco ? `<p class="servico-preco">${esc(s.preco)}</p>` : ""}
          <a class="botao leve" href="${esc(linkOrcamento(s))}" target="_blank" rel="noopener">Pedir orçamento</a>
        </div>
      </li>`
    )
    .join("");

  /* ---------- Como funciona ---------- */
  $("lista-processo").innerHTML = (d.processo || [])
    .map(
      (p, i) => `
      <li class="etapa">
        <div class="etapa-topo">
          <div class="medalha" aria-hidden="true">${esc(p.icone)}</div>
          <span class="etapa-num">Etapa ${i + 1}</span>
        </div>
        <h3>${esc(p.titulo)}</h3>
        <p>${esc(p.descricao)}</p>
      </li>`
    )
    .join("");

  /* ---------- Conquistas (mais raras primeiro) ---------- */
  const peso = { lendária: 0, épica: 1, rara: 2, comum: 3 };
  const conquistas = [...desbloqueadasDados].sort((a, b) => (peso[a.raridade] ?? 4) - (peso[b.raridade] ?? 4));
  $("conquistas-contagem").textContent = `${desbloqueadasDados.length} desbloqueadas até agora, e contando.`;
  $("lista-conquistas").innerHTML =
    conquistas
      .map(
        (c) => `
      <li class="conquista" data-raridade="${esc(c.raridade)}">
        <div class="medalha" aria-hidden="true">${esc(c.icone)}</div>
        <div>
          <h3>${esc(c.titulo)}</h3>
          <p>${esc(c.descricao)}</p>
          <div class="conquista-meta">
            <span class="raridade">${esc(c.raridade[0].toUpperCase() + c.raridade.slice(1))}</span>
            ${c.data ? `<span class="conquista-data">${esc(c.data)}</span>` : ""}
          </div>
        </div>
      </li>`
      )
      .join("") +
    (emAndamento.length ? emAndamento : [{ icone: "🔒", titulo: "Próxima conquista", descricao: "Volte daqui a pouco." }])
      .map(
        (c) => `
      <li class="conquista bloqueada">
        <div class="medalha" aria-hidden="true">${esc(c.icone)}</div>
        <div>
          <h3>${esc(c.titulo)}</h3>
          <p>${esc(c.descricao)}</p>
          <div class="conquista-meta">
            <span class="em-andamento">Em andamento</span>
            ${c.data ? `<span class="conquista-data">${esc(c.data)}</span>` : ""}
          </div>
        </div>
      </li>`
      )
      .join("");

  /* ---------- Projetos ---------- */
  const tagsHtml = (lista = []) =>
    lista.length ? `<ul class="tags">${lista.map((t) => `<li class="tag">${esc(t)}</li>`).join("")}</ul>` : "";

  $("lista-projetos").innerHTML = d.projetos
    .map(
      (p, i) => `
      <article class="projeto${p.destaque ? " destaque" : ""}">
        ${p.imagens?.length ? `<img class="projeto-capa" src="${esc(p.imagens[0])}" alt="" loading="lazy">` : ""}
        ${p.destaque ? `<span class="selo-destaque">Projeto favorito</span>` : ""}
        <div>
          <h3>${esc(p.nome)}</h3>
          <p class="projeto-tipo">${esc(p.tipo)}</p>
        </div>
        <p>${esc(p.descricao)}</p>
        ${tagsHtml(p.tecnologias)}
        <div class="projeto-acoes">
          <button type="button" class="botao ${p.destaque ? "primario" : "leve"}" data-projeto="${i}">Saber mais</button>
        </div>
      </article>`
    )
    .join("");

  const modal = $("modal-projeto");
  function abrirProjeto(i) {
    const p = d.projetos[i];
    $("modal-titulo").textContent = p.nome;
    $("modal-tipo").textContent = p.tipo;
    // Sem prints, a galeria fica vazia e some (CSS :empty)
    $("modal-galeria").innerHTML = (p.imagens || [])
      .map((src, n) => `<img src="${esc(src)}" alt="Tela ${n + 1} do ${esc(p.nome)}">`)
      .join("");
    $("modal-texto").innerHTML = (p.detalhes || [p.descricao]).map((t) => `<p>${esc(t)}</p>`).join("");
    $("modal-tags").innerHTML = tagsHtml(p.tecnologias);
    $("modal-links").innerHTML = p.link
      ? `<a class="botao primario" href="${esc(p.link)}" target="_blank" rel="noopener">${esc(p.textoLink || "Ver projeto")}</a>`
      : "";
    // Uma das moedas escondidas mora na janela do último projeto
    modal.querySelector(".moeda-escondida")?.remove();
    if (i === d.projetos.length - 1) colocarMoeda("projeto", modal.querySelector(".modal-corpo"));
    modal.showModal();
    som.tocar("abrir");
    $("modal-galeria").scrollLeft = 0;

    projetosAbertos.add(i);
    if (projetosAbertos.size === d.projetos.length) desbloquear("projetos");
  }
  const projetosAbertos = new Set();

  $("lista-projetos").addEventListener("click", (e) => {
    const botao = e.target.closest("[data-projeto]");
    if (botao) abrirProjeto(Number(botao.dataset.projeto));
  });

  // Vale para as duas janelas (projeto e conquistas): X, Esc e clique fora fecham
  for (const janela of document.querySelectorAll("dialog.modal")) {
    janela.addEventListener("close", () => som.tocar("fechar"));
    janela.querySelector(".modal-fechar").addEventListener("click", () => janela.close());
    janela.addEventListener("click", (e) => {
      if (e.target === janela) janela.close();
    });
  }

  /* ---------- Jornada ---------- */
  $("lista-jornada").innerHTML = d.jornada
    .map((j, i) => ({ ...j, n: i + 1 }))
    .reverse()
    .map(
      (j, i) => `
      <li class="fase${i === 0 ? " atual" : ""}">
        <div class="fase-num">Fase ${j.n}</div>
        <div>
          <h3>${esc(j.cargo)}</h3>
          <p class="fase-onde">${j.lugar ? `${esc(j.lugar)}, ` : ""}${esc(j.periodo)}</p>
          <p class="fase-desc">${italico(j.descricao)}</p>
        </div>
      </li>`
    )
    .join("");

  /* ---------- Inventário ---------- */
  $("lista-inventario").innerHTML = d.inventario
    .map(
      (g) => `
      <div>
        <h3>${esc(g.grupo)}</h3>
        <ul class="tags">${g.itens.map((t) => `<li class="tag">${esc(t)}</li>`).join("")}</ul>
      </div>`
    )
    .join("");

  /* ---------- Sobre mim: abas (quem sou, conquistas, jornada, inventário) ---------- */
  // Setas ← → trocam de aba, como num menu de jogo. Só a aba aberta entra na ordem do Tab.
  const listaAbas = $("abas-sobre");
  const abas = [...listaAbas.querySelectorAll('[role="tab"]')];

  function abrirAba(aba, focar = false) {
    for (const a of abas) {
      const ativa = a === aba;
      a.setAttribute("aria-selected", String(ativa));
      a.tabIndex = ativa ? 0 : -1;
      $(a.getAttribute("aria-controls")).hidden = !ativa;
    }
    if (focar) aba.focus();
  }

  listaAbas.addEventListener("click", (e) => {
    const aba = e.target.closest('[role="tab"]');
    if (aba) abrirAba(aba);
  });
  listaAbas.addEventListener("keydown", (e) => {
    const i = abas.indexOf(document.activeElement);
    const destino = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: abas.length - 1 }[e.key];
    if (i < 0 || destino === undefined) return;
    e.preventDefault();
    abrirAba(abas[(destino + abas.length) % abas.length], true);
  });

  // Endereços antigos (#conquistas, #jornada, #inventario) abrem a aba certa
  function abaDoEndereco(rolar) {
    const aba = abas.find((a) => `#${a.getAttribute("aria-controls")}` === location.hash);
    if (!aba) return;
    abrirAba(aba);
    if (rolar) $("sobre").scrollIntoView({ behavior: semMovimento.matches ? "auto" : "smooth" });
  }
  addEventListener("hashchange", () => abaDoEndereco(true));
  abaDoEndereco(false); // ao abrir a página, o próprio navegador rola até a aba, que já está visível

  /* ---------- Perguntas frequentes ---------- */
  $("lista-perguntas").innerHTML = (d.perguntas || [])
    .map(
      (p) => `
      <details class="pergunta" name="perguntas">
        <summary>${esc(p.pergunta)}</summary>
        <div class="pergunta-resposta"><p>${italico(p.resposta)}</p></div>
      </details>`
    )
    .join("");

  // As mesmas perguntas em formato que o Google entende
  if (d.perguntas?.length) {
    const faq = document.createElement("script");
    faq.type = "application/ld+json";
    faq.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: d.perguntas.map((p) => ({
        "@type": "Question",
        name: p.pergunta,
        acceptedAnswer: { "@type": "Answer", text: p.resposta.replace(/\*/g, "") },
      })),
    });
    document.head.appendChild(faq);
  }

  /* ---------- Contato: "Monte sua missão" ---------- */
  // Uma pergunta por vez; cada clique escolhe e avança. No fim, o resumo vira uma mensagem
  // pronta no WhatsApp (ou no e-mail, se não houver WhatsApp nos links).
  const linkWhats = d.links.find((l) => l.nome === "WhatsApp");
  const PERGUNTAS_MISSAO = [
    {
      pergunta: "Qual é a missão?",
      rotulo: "Missão",
      opcoes: [...(d.servicos || []).map((s) => ({ icone: s.icone, texto: s.nome })), { icone: "🤔", texto: "Ainda não sei" }],
    },
    ...(d.missao || []),
  ];
  const caixaMissao = $("missao");
  const escolhas = [];
  let passoMissao = 0;
  let nomeMissao = "";

  function linkMissao() {
    const linhas = PERGUNTAS_MISSAO.map((p, i) => `• ${p.rotulo}: ${p.opcoes[escolhas[i]].texto}`);
    const texto = ["Oi Gabriel! Montei minha missão no seu site:", ...linhas, nomeMissao.trim() && `Meu nome é ${nomeMissao.trim()}.`]
      .filter(Boolean)
      .join("\n");
    return numeroWhats
      ? `https://wa.me/${numeroWhats}?text=${encodeURIComponent(texto)}`
      : `mailto:${d.email}?subject=${encodeURIComponent("Minha missão")}&body=${encodeURIComponent(texto)}`;
  }

  function mostrarMissao(focar) {
    const total = PERGUNTAS_MISSAO.length;
    const pronta = passoMissao >= total;
    const pontos = PERGUNTAS_MISSAO.map((_, i) => `<span${i < passoMissao ? ' class="feito"' : ""}></span>`).join("");
    const topo = `
      <div class="missao-topo">
        <p class="olho">Monte sua missão</p>
        <div class="missao-passos" aria-hidden="true">${pontos}</div>
      </div>`;

    if (!pronta) {
      const p = PERGUNTAS_MISSAO[passoMissao];
      caixaMissao.innerHTML = `${topo}
        <div class="missao-passo">
          <p class="missao-contagem">Pergunta ${passoMissao + 1} de ${total}</p>
          <h3 tabindex="-1">${esc(p.pergunta)}</h3>
          <div class="missao-opcoes">
            ${p.opcoes
              .map(
                (o, i) => `<button type="button" class="missao-opcao" data-opcao="${i}" aria-pressed="${escolhas[passoMissao] === i}">
                  <span class="missao-opcao-icone" aria-hidden="true">${esc(o.icone)}</span>${esc(o.texto)}</button>`
              )
              .join("")}
          </div>
          <div class="missao-rodape">
            ${
              passoMissao > 0
                ? `<button type="button" class="botao-link" data-missao="voltar">← Voltar</button>`
                : linkWhats
                  ? `<span>Prefere ir direto?</span><a class="botao-link" href="${esc(linkWhats.url)}" target="_blank" rel="noopener">Chamar no WhatsApp</a>`
                  : ""
            }
          </div>
        </div>`;
    } else {
      caixaMissao.innerHTML = `${topo}
        <div class="missao-passo">
          <p class="missao-contagem">Tudo pronto</p>
          <h3 tabindex="-1">Missão montada!</h3>
          <ul class="missao-resumo">
            ${PERGUNTAS_MISSAO.map(
              (p, i) => `<li><span>${esc(p.rotulo)}</span><strong>${esc(p.opcoes[escolhas[i]].icone)} ${esc(p.opcoes[escolhas[i]].texto)}</strong></li>`
            ).join("")}
          </ul>
          <label class="missao-campo">
            <span>Seu nome <small>(opcional)</small></span>
            <input id="missao-nome" autocomplete="name" maxlength="60" value="${esc(nomeMissao)}">
          </label>
          <div class="acoes">
            <a class="botao primario grande" id="missao-enviar" href="${esc(linkMissao())}" target="_blank" rel="noopener">
              ${iconeRede(numeroWhats ? "WhatsApp" : "")} Enviar missão${numeroWhats ? " no WhatsApp" : ""}</a>
            <button type="button" class="botao" data-missao="recomecar">Recomeçar</button>
          </div>
        </div>`;
    }
    if (focar) caixaMissao.querySelector("h3").focus({ preventScroll: true });
  }

  caixaMissao.addEventListener("click", (e) => {
    const opcao = e.target.closest("[data-opcao]");
    const acao = e.target.closest("[data-missao]")?.dataset.missao;
    if (opcao) {
      escolhas[passoMissao] = Number(opcao.dataset.opcao);
      passoMissao++;
      som.tocar(passoMissao >= PERGUNTAS_MISSAO.length ? "item" : "blip");
    } else if (acao === "voltar") {
      passoMissao--;
    } else if (acao === "recomecar") {
      passoMissao = 0;
      escolhas.length = 0;
    } else {
      return;
    }
    mostrarMissao(true);
  });
  caixaMissao.addEventListener("input", (e) => {
    if (e.target.id !== "missao-nome") return;
    nomeMissao = e.target.value;
    $("missao-enviar").href = linkMissao();
  });
  mostrarMissao(false);

  $("email-link").textContent = d.email;
  $("email-link").href = `mailto:${d.email}`;
  $("lista-redes").innerHTML = d.links
    .map((l) => `<li><a class="botao leve" href="${esc(l.url)}" target="_blank" rel="noopener">${iconeRede(l.nome)}${esc(l.nome)}</a></li>`)
    .join("");
  $("rodape-texto").textContent = `© ${hoje.getFullYear()} ${nomeCompleto}. Feito à mão, sem template.`;

  /* ---------- Barra de progresso: enche da esquerda para a direita conforme a rolagem ---------- */
  const raiz = document.documentElement;
  const barra = $("progresso");
  const topo = document.querySelector(".topo");

  function atualizarProgresso() {
    topo.classList.toggle("rolado", scrollY > 8); // linha embaixo do topo quando o conteúdo passa por trás
    const max = raiz.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 1;
    barra.style.width = `${(p * 100).toFixed(2)}%`;
    barra.style.backgroundPosition = `${(scrollY * 0.25).toFixed(1)}px 0`; // listras "girando" com a rolagem
  }

  let progressoAgendado = false;
  addEventListener(
    "scroll",
    () => {
      if (progressoAgendado) return;
      progressoAgendado = true;
      requestAnimationFrame(() => {
        atualizarProgresso();
        progressoAgendado = false;
      });
    },
    { passive: true }
  );
  addEventListener("resize", atualizarProgresso);
  addEventListener("load", atualizarProgresso);

  /* ---------- Menu: marca a seção que está no meio da tela ---------- */
  const linksMenu = [...document.querySelectorAll('.topo nav a[href^="#"]')]; // "Blog" é outra página
  const secoesMenu = linksMenu.map((a) => document.querySelector(a.getAttribute("href")));
  const espiao = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        const link = linksMenu[secoesMenu.indexOf(e.target)];
        if (e.isIntersecting) {
          linksMenu.forEach((a) => a.removeAttribute("aria-current"));
          link.setAttribute("aria-current", "true");
        } else if (link.hasAttribute("aria-current")) {
          link.removeAttribute("aria-current");
        }
      }
    },
    { rootMargin: "-45% 0px -50% 0px" } // uma faixa fina no meio da tela
  );
  secoesMenu.forEach((s) => s && espiao.observe(s));

  /* ---------- Conquistas secretas do visitante ---------- */
  // Ficam salvas no navegador do visitante: o contador continua de onde parou na próxima visita.
  // A ordem aqui é a ordem do painel de conquistas; a dica aparece enquanto ela está trancada.
  const SECRETAS = [
    { id: "visita", icone: "👋", titulo: "Visitante curioso", dica: "Comece a explorar o site." },
    { id: "fim", icone: "🏁", titulo: "Leu até o fim", dica: "Chegue ao fim da página." },
    { id: "leitor", icone: "📖", titulo: "Leitor de bordo", dica: "Leia um post do blog até o fim." }, // desbloqueada pelo blog.js
    { id: "ida-e-volta", icone: "🚀", titulo: "Ida e volta", dica: "Vá até o fim da página e volte ao topo." },
    { id: "projetos", icone: "🔍", titulo: "Inspetor de projetos", dica: "Abra todos os projetos." },
    { id: "moedas", icone: "🪙", titulo: "Caçador de moedas", dica: "Ache as 5 moedas escondidas pelo site." },
    { id: "jogou", icone: "🕹️", titulo: "Primeira partida", dica: "Jogue a fase bônus." },
    { id: "recorde", icone: "🐞", titulo: "Zero bugs em produção", dica: "Faça 500 pontos na fase bônus." },
    { id: "chefe", icone: "👾", titulo: "Sobreviveu ao deploy de sexta", dica: "Derrote o chefão da fase bônus." },
    { id: "networking", icone: "🤝", titulo: "Networking em dia", dica: "Copie o meu e-mail ou salve o meu contato." },
    { id: "instagram", icone: "📸", titulo: "De olho no Insta", dica: "Visite o meu Instagram." },
    { id: "missao", icone: "📜", titulo: "Missão aceita", dica: "Monte a sua missão e envie, ou peça um orçamento." },
    { id: "terminal", icone: "💻", titulo: "Hacker do bem", dica: "Ache o terminal escondido no rodapé." },
    { id: "tema", icone: "🌗", titulo: "Ciclo dia e noite", dica: "Troque o dia pela noite (ou o contrário)." },
    { id: "like-1", icone: "👍", titulo: "Deixou seu like", dica: "Curta o site." },
    { id: "like-100", icone: "💯", titulo: "100 likes: fã de carteirinha", dica: "Curta o site 100 vezes." },
    { id: "like-500", icone: "🫠", titulo: "Dedo incansável", dica: "Curta o site 500 vezes. Sim, 500." },
    { id: "coruja", icone: "🦉", titulo: "Coruja da madrugada", dica: "Visite o site de madrugada." },
    { id: "volta", icone: "🔁", titulo: "De volta à fase", dica: "Volte outro dia." },
    { id: "konami", icone: "🎮", titulo: "Jogador das antigas", dica: "O código mais famoso dos videogames. No celular, deslize." },
  ];
  const TOTAL_MOEDAS = 5;
  const CHAVE_SECRETAS = "gs-conquistas";
  let salvo = {};
  try {
    salvo = JSON.parse(localStorage.getItem(CHAVE_SECRETAS)) || {};
  } catch {
    // sem armazenamento (aba anônima, bloqueio de cookies): conta só nesta visita
  }
  const desbloqueadas = new Set(Array.isArray(salvo.ids) ? salvo.ids : []);
  const moedasPegas = new Set(Array.isArray(salvo.moedas) ? salvo.moedas : []);
  const primeiraVisita = salvo.primeiraVisita || Date.now();
  let recorde = Number(salvo.recorde) || 0;

  function salvarSecretas() {
    try {
      localStorage.setItem(
        CHAVE_SECRETAS,
        JSON.stringify({ ids: [...desbloqueadas], moedas: [...moedasPegas], recorde, primeiraVisita })
      );
    } catch {
      // idem
    }
  }

  const hud = $("hud");
  $("hud-icone").innerHTML = pixelSvg(TROFEU);
  const contarSecretas = () => SECRETAS.filter((s) => desbloqueadas.has(s.id)).length;

  function atualizarContador() {
    const n = contarSecretas();
    const total = SECRETAS.length;
    $("hud-num").textContent = `${n}/${total}`;
    hud.setAttribute("aria-label", `Suas conquistas: ${n} de ${total}`);
    $("rodape-dica").innerHTML =
      n === 0
        ? "Tem conquista escondida por aqui."
        : n === total
          ? `Você achou <strong>todas as ${total}</strong> conquistas escondidas. Zerou o site.`
          : `Você achou <strong>${n} de ${total}</strong> conquistas escondidas.`;
  }
  salvarSecretas();
  atualizarContador();

  // A caixa dos avisos é um popover: reaberta a cada aviso, fica por cima até das janelas abertas
  const caixaAvisos = $("toasts");
  function avisar(icone, legenda, titulo) {
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `<div class="toast-icone" aria-hidden="true">${icone}</div>
      <div><small>${esc(legenda)}</small><strong>${esc(titulo)}</strong></div>`;
    caixaAvisos.appendChild(t);
    if (caixaAvisos.showPopover) {
      try {
        if (caixaAvisos.matches(":popover-open")) caixaAvisos.hidePopover();
        caixaAvisos.showPopover();
      } catch {
        // navegador sem popover: a caixa continua como um elemento fixo comum
      }
    }
    setTimeout(() => {
      t.classList.add("saindo");
      t.addEventListener("animationend", () => t.remove(), { once: true });
      setTimeout(() => t.remove(), 600); // garante a remoção mesmo se a animação não rodar
    }, 4500);
  }

  function desbloquear(id) {
    const s = SECRETAS.find((x) => x.id === id);
    if (!s || desbloqueadas.has(id)) return;
    desbloqueadas.add(id);
    salvarSecretas();
    atualizarContador();
    avisar(s.icone, "Conquista desbloqueada", s.titulo);
    som.tocar("conquista");

    hud.classList.remove("ganhou");
    void hud.offsetWidth; // reinicia a animação
    hud.classList.add("ganhou");

    if (contarSecretas() === SECRETAS.length) {
      setTimeout(() => {
        avisar("👑", "Você zerou o site", "Todas as conquistas!");
        chuvaDeMoedas();
      }, 900);
    }
  }

  // Aparece na primeira rolagem: não mexe na tela enquanto a página carrega
  addEventListener(
    "scroll",
    () => {
      desbloquear("visita");
      // Voltou outro dia (mais de 12 horas depois da primeira visita)
      if (Date.now() - primeiraVisita > 12 * 3600000) desbloquear("volta");
      const hora = new Date().getHours();
      if (hora < 5) desbloquear("coruja");
    },
    { once: true, passive: true }
  );

  /* ---------- Painel de conquistas do visitante ---------- */
  const modalTrofeus = $("modal-trofeus");
  function abrirTrofeus() {
    const n = contarSecretas();
    const total = SECRETAS.length;
    $("trofeus-resumo").innerHTML =
      `<strong>${n} de ${total}</strong> desbloqueadas · Moedas: <strong>${moedasPegas.size}/${TOTAL_MOEDAS}</strong>` +
      ` · Recorde na fase bônus: <strong>${recorde.toLocaleString("pt-BR")}</strong>`;
    $("trofeus-barra").style.width = `${Math.round((n / total) * 100)}%`;
    $("lista-trofeus").innerHTML = SECRETAS.map((s) => {
      const tem = desbloqueadas.has(s.id);
      return `
      <li class="trofeu${tem ? "" : " trancado"}">
        <div class="trofeu-icone" aria-hidden="true">${tem ? s.icone : "🔒"}</div>
        <div>
          <strong>${esc(s.titulo)}</strong>
          <small>${tem ? "Desbloqueada" : esc(s.dica)}</small>
        </div>
      </li>`;
    }).join("");
    $("compartilhar").textContent = n === total ? "Contar para um amigo" : "Desafiar um amigo";
    modalTrofeus.showModal();
    som.tocar("abrir");
  }
  hud.addEventListener("click", abrirTrofeus);
  $("ver-conquistas").addEventListener("click", abrirTrofeus);

  $("compartilhar").addEventListener("click", async (e) => {
    const botao = e.currentTarget;
    const url = document.querySelector('link[rel="canonical"]')?.href || location.href;
    const texto = `Achei ${contarSecretas()} de ${SECRETAS.length} conquistas escondidas no site do ${nomeCompleto}. Duvido você achar todas:`;
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, text: texto, url });
      } catch {
        // cancelou o compartilhamento: nada a fazer
      }
      return;
    }
    try {
      await copiarTexto(`${texto} ${url}`);
      botao.textContent = "Convite copiado. Agora é só colar!";
    } catch {
      botao.textContent = url;
    }
  });

  /* ---------- Moedas escondidas ---------- */
  // Cinco moedas espalhadas pela página (uma delas só aparece dentro da janela de um projeto).
  const LUGARES_MOEDA = [
    { id: "ficha", onde: ".ficha" },
    { id: "sobre", onde: "#sobre" },
    { id: "jornada", onde: "#jornada" },
    { id: "rodape", onde: ".rodape" },
  ];

  function colocarMoeda(id, pai) {
    if (!pai || moedasPegas.has(id)) return;
    pai.insertAdjacentHTML(
      "beforeend",
      `<button type="button" class="moeda-escondida" data-moeda="${id}" aria-label="Pegar moeda escondida">${moedaSvg()}</button>`
    );
  }
  LUGARES_MOEDA.forEach((m) => colocarMoeda(m.id, document.querySelector(m.onde)));

  // pai: a janela aberta, quando a moeda está dentro de uma (senão o texto ficaria escondido atrás dela)
  function textoFlutuante(texto, x, y, pai = document.body) {
    const t = document.createElement("span");
    t.className = "texto-flutuante";
    t.textContent = texto;
    t.style.cssText = `left:${x}px;top:${y}px`;
    t.addEventListener("animationend", () => t.remove(), { once: true });
    setTimeout(() => t.remove(), 1500);
    pai.appendChild(t);
  }

  document.addEventListener("click", (e) => {
    const moeda = e.target.closest(".moeda-escondida");
    if (!moeda) return;
    moedasPegas.add(moeda.dataset.moeda);
    salvarSecretas();
    som.tocar("moeda");
    const r = moeda.getBoundingClientRect();
    textoFlutuante(`Moeda ${moedasPegas.size}/${TOTAL_MOEDAS}`, r.left + r.width / 2, r.top, moeda.closest("dialog") || undefined);
    moeda.classList.add("pegou");
    moeda.disabled = true;
    setTimeout(() => moeda.remove(), 400);
    if (moedasPegas.size >= TOTAL_MOEDAS) desbloquear("moedas");
  });

  // Chuva de moedas: recompensa do código secreto e de quem zera o site
  function chuvaDeMoedas() {
    if (semMovimento.matches) return;
    for (let i = 0; i < 36; i++) {
      const m = document.createElement("span");
      m.className = "chuva";
      m.innerHTML = moedaSvg();
      m.style.cssText = `left:${Math.random() * 100}vw;--atraso:${(Math.random() * 1.2).toFixed(2)}s;--dur:${(1.6 + Math.random() * 1.4).toFixed(2)}s;--giro:${Math.round(Math.random() * 720 - 360)}deg`;
      m.addEventListener("animationend", () => m.remove(), { once: true });
      document.body.appendChild(m);
    }
    som.tocar("item");
  }

  async function copiarTexto(texto) {
    try {
      await navigator.clipboard.writeText(texto);
      return;
    } catch {
      // segue para o plano B
    }
    // Plano B para navegadores sem a API de área de transferência ou que negam a permissão
    const campo = document.createElement("textarea");
    campo.value = texto;
    campo.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(campo);
    campo.select();
    const ok = document.execCommand("copy");
    campo.remove();
    if (!ok) throw new Error("cópia bloqueada");
  }

  const botaoCopiar = $("copiar-email");
  botaoCopiar.addEventListener("click", async () => {
    try {
      await copiarTexto(d.email);
      botaoCopiar.textContent = "E-mail copiado";
      desbloquear("networking");
    } catch {
      botaoCopiar.textContent = "Não deu para copiar. Use o link ao lado.";
    }
  });

  // Cartão de visita (.vcf): no celular, abre direto o "adicionar aos contatos"
  const textoVcf = (s = "") => String(s).replace(/([\\,;])/g, "\\$1");
  $("salvar-contato").addEventListener("click", () => {
    const vcf = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${textoVcf(d.sobrenome)};${textoVcf(d.nome)};;;`,
      `FN:${textoVcf(nomeCompleto)}`,
      `TITLE:${textoVcf(d.titulo)}`,
      numeroWhats && `TEL;TYPE=CELL:+${numeroWhats}`,
      `EMAIL:${d.email}`,
      `URL:${document.querySelector('link[rel="canonical"]')?.href || location.href}`,
      `NOTE:${textoVcf(d.resumo)}`,
      "END:VCARD",
    ]
      .filter(Boolean)
      .join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([vcf], { type: "text/vcard;charset=utf-8" }));
    a.download = `${nomeCompleto.toLowerCase().replace(/\s+/g, "-")}.vcf`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    $("salvar-contato").textContent = "Contato salvo";
    desbloquear("networking");
  });

  const fim = new IntersectionObserver((entradas) => {
    if (entradas.some((x) => x.isIntersecting)) {
      desbloquear("fim");
      fim.disconnect();
    }
  });
  fim.observe(document.querySelector(".rodape"));

  const konami = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let pos = 0;
  function passoKonami(tecla) {
    if (tecla.toLowerCase() === konami[pos].toLowerCase()) pos++;
    else if (tecla === "ArrowUp") pos = pos === 2 ? 2 : 1; // "↑ ↑ ↑ ↓..." ainda vale
    else pos = 0;
    if (pos === konami.length) {
      pos = 0;
      desbloquear("konami");
      chuvaDeMoedas();
    }
  }
  const digitando = (e) => e.target.matches?.("input, textarea, select, [contenteditable]");
  document.addEventListener("keydown", (e) => digitando(e) || passoKonami(e.key));

  // No celular: deslizar o dedo vale como as setas, e dois toques no fim valem como B e A
  let toque = null;
  addEventListener(
    "touchstart",
    (e) => {
      const t = e.changedTouches[0];
      toque = e.target.closest?.(".jogo") ? null : { x: t.clientX, y: t.clientY };
    },
    { passive: true }
  );
  addEventListener(
    "touchend",
    (e) => {
      if (!toque) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - toque.x;
      const dy = t.clientY - toque.y;
      toque = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) {
        if (pos >= 8) passoKonami(konami[pos]);
        else pos = 0;
        return;
      }
      passoKonami(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "ArrowRight" : "ArrowLeft") : dy > 0 ? "ArrowDown" : "ArrowUp");
    },
    { passive: true }
  );

  /* ---------- Likes compartilhados (api/likes.php) ---------- */
  // Os cliques ficam "pendentes" e são enviados em lote; o total é buscado de tempos em tempos
  // para mostrar os likes de todo mundo quase ao vivo.
  const API_LIKES = "api/likes.php";
  const botaoLike = $("like");
  const numeroLike = $("like-num");
  let totalServidor = null;
  let pendentes = 0;
  let meusCliques = 0;
  let enviando = false;

  function mostrarLikes() {
    if (totalServidor === null && pendentes === 0) return;
    numeroLike.textContent = ((totalServidor ?? 0) + pendentes).toLocaleString("pt-BR");
  }

  async function buscarLikes() {
    if (document.hidden || enviando) return;
    try {
      const r = await fetch(API_LIKES, { cache: "no-store" });
      if (!r.ok) throw new Error(r.status);
      totalServidor = (await r.json()).total;
      mostrarLikes();
    } catch {
      if (totalServidor === null) numeroLike.textContent = pendentes.toLocaleString("pt-BR");
    }
  }

  async function enviarLikes() {
    if (!pendentes || enviando) return;
    enviando = true;
    const n = Math.min(pendentes, 50);
    try {
      const r = await fetch(API_LIKES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ n }),
      });
      if (!r.ok) throw new Error(r.status);
      totalServidor = (await r.json()).total;
      pendentes -= n;
    } catch {
      // Sem servidor (ex.: rodando local sem PHP): os cliques continuam contando só aqui.
    } finally {
      enviando = false;
      mostrarLikes();
    }
  }

  botaoLike.addEventListener("click", () => {
    pendentes++;
    meusCliques++;
    mostrarLikes();

    botaoLike.classList.remove("batida");
    void botaoLike.offsetWidth; // reinicia a animação a cada clique
    botaoLike.classList.add("batida");
    som.tocar("moeda");

    const mais = document.createElement("span");
    mais.className = "like-mais";
    mais.textContent = "+1";
    mais.style.setProperty("--desvio", `${Math.round(Math.random() * 30 - 15)}px`);
    mais.addEventListener("animationend", () => mais.remove(), { once: true });
    botaoLike.appendChild(mais);

    if (meusCliques === 1) desbloquear("like-1");
    if (meusCliques === 100) desbloquear("like-100");
    if (meusCliques === 500) desbloquear("like-500");
  });

  setInterval(enviarLikes, 700);
  setInterval(buscarLikes, 4000);
  document.addEventListener("visibilitychange", buscarLikes);
  buscarLikes();

  // Conquista: foi até o fim da página e voltou para o topo
  let chegouAoFim = false;
  addEventListener(
    "scroll",
    () => {
      const max = raiz.scrollHeight - innerHeight;
      if (scrollY >= max - 40) chegouAoFim = true;
      if (chegouAoFim && scrollY < 80) desbloquear("ida-e-volta");
    },
    { passive: true }
  );

  // O botão dia/noite mora no ceu.js; aqui ele ganha som e conquista
  addEventListener("gs:tema", () => {
    som.tocar("tema");
    desbloquear("tema");
  });

  /* ---------- Cards surgem ao entrar na tela ---------- */
  // Só com JavaScript e movimento liberado: sem isso, tudo já aparece de cara.
  if ("IntersectionObserver" in window && !semMovimento.matches) {
    const revelaveis = document.querySelectorAll(".servico, .etapa, .conquista, .projeto, .fase, .inventario > div, .pergunta, .jogo, .missao, .post-card");
    const revelador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("visivel");
          revelador.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    revelaveis.forEach((el) => {
      const ordem = [...el.parentElement.children].indexOf(el);
      el.style.setProperty("--atraso", `${Math.min(ordem, 4) * 80}ms`);
      el.classList.add("revelar");
      revelador.observe(el);
    });
  }

  /* ---------- Fase bônus: "Bug em produção" ---------- */
  // O canvas trabalha em "pixels lógicos" (cada um vira 2 ou 3 pixels na tela) para manter o visual
  // de 8 bits. A nave atira sozinha; o jogador só mira e desvia. Bug que passa da linha vermelha
  // chegou à produção e custa uma vida.
  const areaJogo = $("jogo-area");
  const telaJogo = $("jogo-tela");
  const gj = telaJogo.getContext("2d");
  const painel = $("jogo-painel");

  // Nave GS: O = contorno, Y = casco, C = cabine, R = ponta das asas, F/G = fogo do propulsor
  const NAVE = [
    "......O......",
    ".....OYO.....",
    ".....OYO.....",
    "....OYCYO....",
    "....OYCYO....",
    "...OOYYYOO...",
    "..OYOYYYOYO..",
    ".OYYOYYYOYYO.",
    "OYYYYYYYYYYYO",
    "ORRYYYYYYYRRO",
    "OOOOOYYYOOOOO",
    "....OOOOO....",
    ".....FGF.....",
    "......F......",
  ];
  // Joaninha de pixel: A = antena, H = cabeça, E = olho, B = casco, M = divisão das asas, S = pinta, L = perna
  const BUG = [
    "A.......A",
    ".A.....A.",
    "..HHHHH..",
    ".HEHHHEH.",
    "LBBBMBBBL",
    ".BSBMBSB.",
    "LBBBMBBBL",
    ".BBSMSBB.",
    "L.BBMBB.L",
    "...BBB...",
  ];
  // Xícara de café com fumaça: O = louça, B = café, W = fumaça
  const CAFE = [
    "..W.W...",
    ".W.W....",
    "OOOOOO..",
    "OBBBBOOO",
    "OBBBBO.O",
    "OBBBBOOO",
    ".OOOO...",
  ];

  function sprite(desenho, cores) {
    const c = document.createElement("canvas");
    c.width = desenho[0].length;
    c.height = desenho.length;
    const s = c.getContext("2d");
    desenho.forEach((linha, y) =>
      [...linha].forEach((p, x) => {
        if (p === ".") return;
        s.fillStyle = cores[p];
        s.fillRect(x, y, 1, 1);
      })
    );
    return c;
  }

  const corDoBug = { A: "#b5b0de", H: "#b5b0de", L: "#b5b0de", E: "#120e2b", M: "#120e2b", S: "#120e2b" };
  const SPRITES = {
    nave: sprite(NAVE, { O: "#6a5cf0", Y: "#ffc531", C: "#2f6fff", R: "#ff5a6e", F: "#ff5a6e", G: "#ffc531" }),
    bug: sprite(BUG, { ...corDoBug, B: "#ff5a6e" }),
    critico: sprite(BUG, { ...corDoBug, B: "#b48aff" }),
    chefe: sprite(BUG, { ...corDoBug, A: "#efedff", H: "#efedff", L: "#efedff", E: "#ff5a6e", B: "#ff8a3d", S: "#ffc531" }),
    ferido: sprite(BUG, { ...corDoBug, B: "#ffffff" }),
    moeda: sprite(MOEDA, { O: "#8a5a00", Y: "#ffc531", W: "#ffffff", D: "#c98a00" }),
    cafe: sprite(CAFE, { O: "#efedff", B: "#8b5a2b", W: "#b5b0de" }),
  };

  let escala = 3;
  let L = 0; // largura do jogo em pixels lógicos
  let A = 0; // altura
  let estado = "inicio"; // inicio | jogando | pausado | fim
  let pontos, vidas, sprint, tempo, naveX, alvoX, recarga, proximoBug, proximoItem, cafe, invencivel, tremor, combo, chefe;
  let tiros, bugs, itens, particulas, textos;
  const teclas = new Set();
  const estrelasJogo = Array.from({ length: 60 }, () => ({ x: Math.random(), y: Math.random(), vel: 6 + Math.random() * 20 }));

  function medirJogo() {
    const l = telaJogo.clientWidth;
    const a = telaJogo.clientHeight;
    if (!l || !a) return;
    escala = l < 600 ? 2 : 3;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    telaJogo.width = Math.round(l * dpr);
    telaJogo.height = Math.round(a * dpr);
    gj.setTransform(escala * dpr, 0, 0, escala * dpr, 0, 0);
    gj.imageSmoothingEnabled = false;
    L = Math.floor(l / escala);
    A = Math.floor(a / escala);
    if (naveX !== undefined) naveX = Math.min(Math.max(naveX, 7), L - 7);
  }

  function novoJogo() {
    pontos = 0;
    vidas = 3;
    sprint = 1;
    tempo = 0;
    naveX = L / 2;
    alvoX = null;
    recarga = 0;
    proximoBug = 1;
    proximoItem = 6 + Math.random() * 4;
    cafe = 0;
    invencivel = 0;
    tremor = 0;
    combo = 0;
    chefe = null;
    tiros = [];
    bugs = [];
    itens = [];
    particulas = [];
    textos = [];
    teclas.clear();
    atualizarHudJogo();
  }

  // Combo: a cada 8 bugs seguidos sem levar dano, os pontos multiplicam (até x4)
  const multiplicador = () => Math.min(4, 1 + Math.floor(combo / 8));

  function atualizarHudJogo() {
    $("jogo-pontos").textContent = pontos.toLocaleString("pt-BR");
    $("jogo-combo").textContent = multiplicador() > 1 ? `x${multiplicador()}` : "";
    $("jogo-sprint").textContent = `Sprint ${sprint}`;
    $("jogo-vidas").innerHTML = [0, 1, 2]
      .map((i) => `<span${i < vidas ? "" : ' class="perdida"'}>${pixelSvg(CORACAO)}</span>`)
      .join("");
  }

  function mostrarPainel(tipo, novoRecorde = false) {
    painel.hidden = !tipo;
    if (!tipo) return;
    const recordeTxt = `Seu recorde: <strong>${recorde.toLocaleString("pt-BR")}</strong>`;
    const linkSemBugs = numeroWhats
      ? `https://wa.me/${numeroWhats}?text=${encodeURIComponent("Oi Gabriel! Joguei a fase bônus do seu site e quero um projeto sem bugs.")}`
      : `mailto:${d.email}`;
    painel.innerHTML = {
      inicio: `
        <h3>Bug em produção</h3>
        <p>A nave atira sozinha. Mire com o mouse, com as setas ← → ou arrastando o dedo. Acerte em sequência para fazer combo e prepare-se para o chefão.</p>
        <p class="jogo-recorde">${recordeTxt}</p>
        <button type="button" class="botao primario" data-jogo="jogar">Jogar</button>`,
      pausado: `
        <h3>Pausado</h3>
        <p>Respira. Os bugs esperam.</p>
        <button type="button" class="botao primario" data-jogo="continuar">Continuar</button>`,
      fim: `
        <h3>Fim de jogo</h3>
        <p class="jogo-placar">${pontos.toLocaleString("pt-BR")} pontos</p>
        <p class="jogo-recorde">${novoRecorde ? "Novo recorde!" : recordeTxt}</p>
        <div class="acoes">
          <button type="button" class="botao primario" data-jogo="jogar">Jogar de novo</button>
          <a class="botao" href="${esc(linkSemBugs)}" target="_blank" rel="noopener">Quero um projeto sem bugs</a>
        </div>`,
    }[tipo];
  }

  function comecar() {
    medirJogo();
    novoJogo();
    estado = "jogando";
    areaJogo.classList.add("jogando");
    mostrarPainel(null);
    desbloquear("jogou");
    som.tocar("abrir");
    rodar();
  }

  function pausar() {
    if (estado !== "jogando") return;
    estado = "pausado";
    areaJogo.classList.remove("jogando");
    teclas.clear();
    mostrarPainel("pausado");
  }

  function continuar() {
    if (estado !== "pausado") return;
    estado = "jogando";
    areaJogo.classList.add("jogando");
    mostrarPainel(null);
    rodar();
  }

  function fimDeJogo() {
    estado = "fim";
    areaJogo.classList.remove("jogando");
    explodir(naveX, A - 12, "#ffc531");
    const novoRecorde = pontos > recorde;
    if (novoRecorde) {
      recorde = pontos;
      salvarSecretas();
    }
    som.tocar("fimDeJogo");
    mostrarPainel("fim", novoRecorde);
  }

  const encostou = (a, b) => a.x < b.x + b.l && a.x + a.l > b.x && a.y < b.y + b.a && a.y + a.a > b.y;

  function ganhar(valor, x, y, comCombo = false) {
    const antes = pontos;
    if (comCombo) {
      const antigo = multiplicador();
      combo++;
      valor *= multiplicador();
      if (multiplicador() > antigo) {
        textos.push({ x: L / 2, y: A / 2 - 16, texto: `Combo x${multiplicador()}!`, vida: 1.2, cor: "#b48aff", grande: true });
        som.tocar("item");
      }
    }
    pontos += valor;
    textos.push({ x, y, texto: `+${valor}`, vida: 0.7, cor: "#ffffff" });
    if (antes < 500 && pontos >= 500) desbloquear("recorde");
    atualizarHudJogo();
  }

  function levarDano(motivo) {
    if (estado !== "jogando") return;
    vidas--;
    combo = 0;
    tremor = 0.3;
    invencivel = 1.2;
    textos.push({ x: L / 2, y: A - 30, texto: motivo, vida: 1.2, cor: "#ff5a6e", grande: true });
    som.tocar("dano");
    atualizarHudJogo();
    if (vidas <= 0) fimDeJogo();
  }

  function explodir(x, y, cor) {
    for (let i = 0; i < 12; i++) {
      const angulo = Math.random() * Math.PI * 2;
      const v = 20 + Math.random() * 40;
      particulas.push({
        x,
        y,
        vx: Math.cos(angulo) * v,
        vy: Math.sin(angulo) * v - 10,
        vida: 0.35 + Math.random() * 0.3,
        cor: Math.random() < 0.3 ? "#ffc531" : cor,
      });
    }
  }

  function atualizarJogo(dt) {
    tempo += dt;
    const naveY = A - 18;

    // Sprint: a cada 20 segundos tudo fica mais rápido
    const novoSprint = 1 + Math.floor(tempo / 20);
    if (novoSprint !== sprint) {
      sprint = novoSprint;
      textos.push({ x: L / 2, y: A / 2, texto: `Sprint ${sprint}`, vida: 1.6, cor: "#ffc531", grande: true });
      som.tocar("abrir");
      atualizarHudJogo();
      // A cada 3 sprints chega o chefão
      if (sprint % 3 === 0 && !chefe) {
        chefe = { x: L / 2, y: -32, vida: 24 + sprint * 4, max: 24 + sprint * 4, ferido: 0, proximoFilhote: 2 };
        textos.push({ x: L / 2, y: A / 2 + 16, texto: "Chefão: deploy de sexta!", vida: 2, cor: "#ff8a3d", grande: true });
        som.tocar("alerta");
      }
    }

    for (const e of estrelasJogo) e.y = (e.y + (e.vel * dt) / A) % 1;

    // Nave: teclado move direto; mouse e dedo marcam um alvo que ela persegue
    const dir = (teclas.has("dir") ? 1 : 0) - (teclas.has("esq") ? 1 : 0);
    if (dir) {
      naveX += dir * 150 * dt;
      alvoX = null;
    } else if (alvoX !== null) {
      naveX += (alvoX - naveX) * Math.min(1, dt * 14);
    }
    naveX = Math.min(Math.max(naveX, 7), L - 7);
    invencivel -= dt;
    cafe -= dt;
    tremor -= dt;

    // Tiro automático (triplo enquanto dura o café)
    recarga -= dt;
    if (recarga <= 0) {
      recarga = 0.24;
      const x = Math.round(naveX);
      tiros.push({ x, y: naveY - 2, vx: 0 });
      if (cafe > 0) tiros.push({ x, y: naveY, vx: -45 }, { x, y: naveY, vx: 45 });
    }
    for (const t of tiros) {
      t.y -= 180 * dt;
      t.x += t.vx * dt;
    }

    // Bugs nascem cada vez mais rápido; a partir do sprint 2 aparecem os críticos (3 tiros).
    // Com o chefão na tela, só ele solta bugs.
    proximoBug -= dt;
    if (proximoBug <= 0 && !chefe) {
      proximoBug = Math.max(0.32, 1.15 - sprint * 0.12) * (0.6 + Math.random() * 0.8);
      const critico = sprint >= 2 && Math.random() < Math.min(0.35, 0.08 * sprint);
      bugs.push({
        x: 6 + Math.random() * (L - 12),
        y: -10,
        vel: 13 + sprint * 4 + Math.random() * 7,
        fase: Math.random() * 6,
        vida: critico ? 3 : 1,
        critico,
        ferido: 0,
      });
    }
    for (const b of bugs) {
      b.y += b.vel * dt;
      b.x = Math.min(Math.max(b.x + Math.sin(tempo * 2.2 + b.fase) * 10 * dt, 5), L - 5);
      b.ferido -= dt;
    }

    // Itens: moeda vale 25 pontos, café dá tiro triplo
    proximoItem -= dt;
    if (proximoItem <= 0) {
      proximoItem = 5 + Math.random() * 5;
      itens.push({ x: 6 + Math.random() * (L - 12), y: -8, tipo: Math.random() < 0.25 ? "cafe" : "moeda" });
    }
    for (const it of itens) it.y += 22 * dt;

    const caixaNave = { x: naveX - 5, y: naveY + 3, l: 10, a: 9 };
    for (const b of bugs) {
      const caixaBug = { x: b.x - 4.5, y: b.y, l: 9, a: 10 };
      for (const t of tiros) {
        if (t.usado || !encostou({ x: t.x, y: t.y, l: 1, a: 3 }, caixaBug)) continue;
        t.usado = true;
        b.vida--;
        b.ferido = 0.08;
        if (b.vida <= 0) {
          b.morto = true;
          ganhar(b.critico ? 30 : 10, b.x, b.y, true);
          explodir(b.x, b.y + 5, b.critico ? "#b48aff" : "#ff5a6e");
          som.tocar("explosao");
          break;
        }
      }
      if (b.morto) continue;
      if (invencivel <= 0 && encostou(caixaBug, caixaNave)) {
        b.morto = true;
        explodir(b.x, b.y + 5, "#ff5a6e");
        levarDano("Bateu num bug!");
      } else if (b.y > A) {
        b.morto = true;
        levarDano("Bug em produção!");
      }
    }
    // Chefão: entra rápido, depois balança de um lado para o outro descendo devagar e soltando bugs.
    // Se chegar perto da nave, derruba a produção (perde uma vida) e volta para o alto.
    if (chefe) {
      const c = chefe;
      c.ferido -= dt;
      c.y += (c.y < 30 ? 24 : 1.6 + sprint * 0.25) * dt;
      c.x = L / 2 + Math.sin(tempo * 0.6) * (L / 2 - 18);
      c.proximoFilhote -= dt;
      if (c.proximoFilhote <= 0 && c.y > 0) {
        c.proximoFilhote = Math.max(0.9, 2 - sprint * 0.08);
        bugs.push({ x: c.x, y: c.y + 24, vel: 18 + sprint * 3, fase: Math.random() * 6, vida: 1, critico: false, ferido: 0 });
      }
      const caixaChefe = { x: c.x - 13.5, y: c.y, l: 27, a: 30 };
      for (const t of tiros) {
        if (t.usado || c.vida <= 0 || !encostou({ x: t.x, y: t.y, l: 1, a: 3 }, caixaChefe)) continue;
        t.usado = true;
        c.vida--;
        c.ferido = 0.06;
      }
      if (c.vida <= 0) {
        for (let i = 0; i < 5; i++) explodir(c.x + Math.random() * 24 - 12, c.y + Math.random() * 26, i % 2 ? "#ff8a3d" : "#ffc531");
        chefe = null;
        tremor = 0.4;
        textos.push({ x: L / 2, y: A / 2, texto: "Deploy salvo!", vida: 1.8, cor: "#ffc531", grande: true });
        som.tocar("explosao");
        ganhar(250, c.x, c.y);
        desbloquear("chefe");
      } else if (c.y + 30 > A - 22) {
        c.y = -32;
        levarDano("O deploy de sexta caiu!");
      }
    }

    for (const it of itens) {
      if (encostou({ x: it.x - 4, y: it.y, l: 8, a: 8 }, caixaNave)) {
        it.usado = true;
        if (it.tipo === "moeda") {
          ganhar(25, it.x, it.y);
          som.tocar("moeda");
        } else {
          cafe = 7;
          textos.push({ x: it.x, y: it.y, texto: "Café! Tiro triplo", vida: 1.2, cor: "#ffc531" });
          som.tocar("item");
        }
      } else if (it.y > A) {
        it.usado = true;
      }
    }

    for (const p of particulas) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 60 * dt;
      p.vida -= dt;
    }
    for (const t of textos) {
      t.y -= (t.grande ? 4 : 14) * dt;
      t.vida -= dt;
    }

    tiros = tiros.filter((t) => !t.usado && t.y > -4 && t.x > -2 && t.x < L + 2);
    bugs = bugs.filter((b) => !b.morto);
    itens = itens.filter((it) => !it.usado);
    particulas = particulas.filter((p) => p.vida > 0);
    textos = textos.filter((t) => t.vida > 0);
  }

  function desenharJogo() {
    if (!L) return;
    gj.save();
    if (tremor > 0) gj.translate(Math.round(Math.random() * 4 - 2), Math.round(Math.random() * 4 - 2));
    gj.fillStyle = "#120e2b";
    gj.fillRect(-4, -4, L + 8, A + 8);

    for (const e of estrelasJogo) {
      gj.fillStyle = e.vel > 18 ? "#efedff" : "#4b4775";
      gj.fillRect(Math.round(e.x * L), Math.round(e.y * A), 1, 1);
    }

    // Linha de produção
    gj.globalAlpha = 0.6;
    gj.fillStyle = "#ff5a6e";
    for (let x = 0; x < L; x += 4) gj.fillRect(x, A - 2, 2, 1);
    gj.globalAlpha = 1;

    for (const it of itens) gj.drawImage(SPRITES[it.tipo], Math.round(it.x - 4), Math.round(it.y));
    for (const b of bugs) {
      const s = b.ferido > 0 ? SPRITES.ferido : b.critico ? SPRITES.critico : SPRITES.bug;
      gj.drawImage(s, Math.round(b.x - 4.5), Math.round(b.y));
    }
    if (chefe) {
      gj.drawImage(chefe.ferido > 0 ? SPRITES.ferido : SPRITES.chefe, Math.round(chefe.x - 13.5), Math.round(chefe.y), 27, 30);
      // Barra de vida do chefão, logo abaixo do placar
      const largura = Math.min(L - 40, 120);
      const x0 = Math.round((L - largura) / 2);
      gj.fillStyle = "#efedff";
      gj.font = `800 6px "Bricolage Grotesque", system-ui, sans-serif`;
      gj.textAlign = "center";
      gj.fillText("DEPLOY DE SEXTA", L / 2, 22);
      gj.fillStyle = "#4b4775";
      gj.fillRect(x0, 24, largura, 3);
      gj.fillStyle = "#ff8a3d";
      gj.fillRect(x0, 24, Math.round((largura * chefe.vida) / chefe.max), 3);
    }

    gj.fillStyle = "#ffc531";
    for (const t of tiros) gj.fillRect(Math.round(t.x), Math.round(t.y), 1, 3);

    const piscando = invencivel > 0 && Math.floor(invencivel * 10) % 2 === 0;
    if (!piscando && estado !== "fim") gj.drawImage(SPRITES.nave, Math.round(naveX) - 6, A - 18);

    for (const p of particulas) {
      gj.fillStyle = p.cor;
      gj.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
    }

    gj.textAlign = "center";
    for (const t of textos) {
      gj.globalAlpha = Math.min(1, t.vida * 3);
      gj.fillStyle = t.cor;
      gj.font = `800 ${t.grande ? 10 : 6}px "Bricolage Grotesque", system-ui, sans-serif`;
      gj.fillText(t.texto, t.x, t.y);
    }
    gj.globalAlpha = 1;
    gj.restore();
  }

  let rodando = false;
  let ultimoT = 0;
  function rodar() {
    if (rodando) return;
    rodando = true;
    ultimoT = performance.now();
    requestAnimationFrame(passo);
  }
  function passo(agora) {
    if (estado !== "jogando") {
      rodando = false;
      desenharJogo();
      return;
    }
    const dt = Math.min(0.05, Math.max(0, (agora - ultimoT) / 1000));
    ultimoT = agora;
    atualizarJogo(dt);
    desenharJogo();
    requestAnimationFrame(passo);
  }

  painel.addEventListener("click", (e) => {
    const b = e.target.closest("[data-jogo]");
    if (b?.dataset.jogo === "jogar") comecar();
    else if (b?.dataset.jogo === "continuar") continuar();
  });

  const TECLAS_JOGO = { ArrowLeft: "esq", a: "esq", A: "esq", ArrowRight: "dir", d: "dir", D: "dir" };
  document.addEventListener("keydown", (e) => {
    if (digitando(e)) return; // "p" digitado no terminal ou num campo não pode despausar o jogo
    if (estado === "jogando" && TECLAS_JOGO[e.key]) {
      teclas.add(TECLAS_JOGO[e.key]);
      e.preventDefault();
    }
    if (e.key === "Escape" || e.key === "p" || e.key === "P") {
      if (estado === "jogando") pausar();
      else if (e.key !== "Escape") continuar();
    }
  });
  document.addEventListener("keyup", (e) => teclas.delete(TECLAS_JOGO[e.key]));

  const mirar = (e) => {
    if (estado === "jogando") alvoX = e.offsetX / escala;
  };
  telaJogo.addEventListener("pointermove", mirar);
  telaJogo.addEventListener("pointerdown", mirar);

  // Pausa sozinho quando o visitante sai da aba, rola para longe ou abre o painel de conquistas
  document.addEventListener("visibilitychange", () => document.hidden && pausar());
  new IntersectionObserver((entradas) => entradas[0].intersectionRatio < 0.5 && pausar(), { threshold: 0.5 }).observe(areaJogo);
  hud.addEventListener("click", pausar);
  $("ver-conquistas").addEventListener("click", pausar);

  addEventListener("resize", () => {
    medirJogo();
    desenharJogo();
  });

  // Cena parada atrás do painel inicial
  medirJogo();
  novoJogo();
  bugs = [
    { x: L * 0.22, y: A * 0.18, ferido: 0 },
    { x: L * 0.55, y: A * 0.08, ferido: 0, critico: true },
    { x: L * 0.8, y: A * 0.32, ferido: 0 },
  ];
  itens = [{ x: L * 0.38, y: A * 0.45, tipo: "moeda" }];
  mostrarPainel("inicio");
  desenharJogo();
  document.fonts?.ready.then(desenharJogo);

  /* ---------- Terminal secreto (botão no rodapé ou Ctrl + K) ---------- */
  const modalTerminal = $("modal-terminal");
  const saida = $("terminal-saida");
  const entrada = $("terminal-entrada");
  const historico = [];
  let posHistorico = 0;
  const linkContratar = linkWhats?.url || `mailto:${d.email}`;
  const enderecoCurto = (url) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\?.*$/, "").replace(/\/$/, "");
  const ok = (t) => `<span class="t-ok">${t}</span>`;

  const BANNER = [
    " █████    █████ ",
    "██       ██     ",
    "██  ███   █████ ",
    "██   ██       ██",
    " █████    █████ ",
  ].join("\n");

  const PISTAS_MOEDA = {
    ficha: "uma brilha na ficha de jogador, lá no topo.",
    sobre: "outra descansa no fim do “Sobre mim”.",
    jornada: "tem uma no caminho da jornada.",
    rodape: "uma caiu lá no rodapé.",
    projeto: "a última está guardada dentro do último projeto.",
  };

  // Comandos com "desc" aparecem na ajuda; os outros ficam para quem gosta de fuçar
  const COMANDOS = {
    ajuda: {
      desc: "lista os comandos",
      fn: () =>
        Object.entries(COMANDOS)
          .filter(([, c]) => c.desc)
          .map(([nome, c]) => `${ok(nome.padEnd(11))}${c.desc}`)
          .join("\n"),
    },
    sobre: { desc: "quem sou eu", fn: () => d.sobre.map((p) => esc(p.replace(/\*/g, ""))).join("\n\n") },
    servicos: {
      desc: "o que eu faço",
      fn: () => d.servicos.map((s) => `${esc(s.icone)} <strong>${esc(s.nome)}</strong>: ${esc(s.descricao)}`).join("\n"),
    },
    projetos: {
      desc: "o que já construí",
      fn: () =>
        d.projetos
          .map(
            (p) =>
              `▸ <strong>${esc(p.nome)}</strong> (${esc(p.tipo)})` +
              (p.link ? ` <a href="${esc(p.link)}" target="_blank" rel="noopener">${esc(enderecoCurto(p.link))}</a>` : "")
          )
          .join("\n"),
    },
    contato: {
      desc: "onde me encontrar",
      fn: () =>
        [
          `E-mail: <a href="mailto:${esc(d.email)}">${esc(d.email)}</a>`,
          ...d.links.map((l) => `${esc(l.nome)}: <a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(enderecoCurto(l.url))}</a>`),
        ].join("\n"),
    },
    contratar: {
      desc: "abre o WhatsApp com uma mensagem pronta",
      fn: () => {
        window.open(linkContratar, "_blank", "noopener");
        desbloquear("missao");
        return "Abrindo o WhatsApp... 🚀";
      },
    },
    conquistas: {
      desc: "abre o painel de conquistas",
      fn: () => {
        modalTerminal.close();
        abrirTrofeus();
      },
    },
    moedas: {
      desc: "dá uma pista de moeda escondida",
      fn: () => {
        const falta = Object.keys(PISTAS_MOEDA).find((id) => !moedasPegas.has(id));
        return `Moedas: ${moedasPegas.size}/${TOTAL_MOEDAS}. ` + (falta ? `Pista: ${PISTAS_MOEDA[falta]}` : "Você já achou todas! 🪙");
      },
    },
    jogar: {
      desc: "vai para a fase bônus",
      fn: () => {
        modalTerminal.close();
        $("jogo").scrollIntoView({ behavior: semMovimento.matches ? "auto" : "smooth" });
        painel.querySelector("button")?.focus({ preventScroll: true });
      },
    },
    blog: {
      desc: "abre o diário de bordo (blog)",
      fn: () => {
        location.href = "blog/";
        return "Abrindo o diário de bordo... 📖";
      },
    },
    tema: {
      desc: "troca o dia pela noite",
      fn: () => {
        $("tema").click();
        return raiz.dataset.tema === "escuro" ? "Boa noite. 🌙" : "Bom dia! ☀️";
      },
    },
    som: {
      desc: "liga ou desliga os sons",
      fn: () => {
        som.alternar();
        return botaoSom.getAttribute("aria-pressed") === "true" ? "Som ligado. 🔊" : "Som desligado. 🔇";
      },
    },
    limpar: {
      desc: "limpa a tela",
      fn: () => {
        saida.innerHTML = "";
      },
    },
    sair: { desc: "fecha o terminal", fn: () => modalTerminal.close() },
    oi: { fn: () => `Oi! 👋 Digite ${ok("ajuda")} para ver o que dá para fazer aqui.` },
    whoami: { fn: () => `visitante. Mas pode virar cliente: digite ${ok("contratar")}.` },
    sudo: { fn: () => "Permissão negada. Root aqui só o Gabriel. 😎" },
    rm: { fn: () => "Opa, calma! Este site foi feito à mão, peça por peça. 😅" },
    ls: { fn: () => Object.keys(COMANDOS).filter((n) => COMANDOS[n].desc).join("  ") },
    cafe: { fn: () => "☕ Recarregando... energia em 100%." },
    data: { fn: () => new Date().toLocaleString("pt-BR") },
    konami: { fn: () => "↑ ↑ ↓ ↓ ← → ← → B A. Mas fora do terminal. 😉" },
  };
  const APELIDOS = {
    help: "ajuda", "?": "ajuda", comandos: "ajuda", clear: "limpar", cls: "limpar", exit: "sair", quit: "sair",
    about: "sobre", whatsapp: "contratar", orcamento: "contratar", hire: "contratar", trofeus: "conquistas",
    jogo: "jogar", play: "jogar", theme: "tema", diario: "blog", posts: "blog", ola: "oi", hello: "oi", hi: "oi", coffee: "cafe", date: "data", dir: "ls",
  };

  function escrever(html, classe = "") {
    const linha = document.createElement("div");
    if (classe) linha.className = classe;
    linha.innerHTML = html;
    saida.appendChild(linha);
    saida.scrollTop = saida.scrollHeight;
  }

  function executar(texto) {
    const limpo = texto.trim();
    escrever(`<span class="t-prompt">~$</span> ${esc(limpo)}`, "t-cmd");
    if (!limpo) return;
    historico.push(limpo);
    posHistorico = historico.length;
    // Sem acento e sem maiúscula: "Serviços" e "servicos" dão no mesmo
    const nome = limpo.split(/\s+/)[0].toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const comando = COMANDOS[nome] || COMANDOS[APELIDOS[nome]];
    if (!comando) {
      escrever(`Comando não encontrado: ${esc(nome)}. Digite ${ok("ajuda")}.`, "t-erro");
      return;
    }
    const resposta = comando.fn();
    if (resposta) escrever(resposta);
  }

  function abrirTerminal() {
    pausar();
    if (!saida.childElementCount) {
      escrever(`<pre class="t-banner" aria-hidden="true">${BANNER}</pre>`);
      escrever(`Terminal do ${esc(nomeCompleto)}, versão 1.0. Digite ${ok("ajuda")} para ver os comandos.`);
    }
    if (!modalTerminal.open) modalTerminal.showModal();
    entrada.focus();
    som.tocar("abrir");
    desbloquear("terminal");
  }

  $("abrir-terminal").addEventListener("click", abrirTerminal);
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      abrirTerminal();
    }
  });

  $("terminal-form").addEventListener("submit", (e) => {
    e.preventDefault();
    executar(entrada.value);
    entrada.value = "";
  });

  // ↑ e ↓ navegam no histórico; Tab completa o comando
  entrada.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      posHistorico = Math.min(historico.length, Math.max(0, posHistorico + (e.key === "ArrowUp" ? -1 : 1)));
      entrada.value = historico[posHistorico] || "";
    } else if (e.key === "Tab" && entrada.value.trim()) {
      e.preventDefault();
      const inicio = entrada.value.trim().toLowerCase();
      const opcoes = Object.keys(COMANDOS).filter((n) => COMANDOS[n].desc && n.startsWith(inicio));
      if (opcoes.length === 1) entrada.value = opcoes[0];
      else if (opcoes.length > 1) escrever(opcoes.join("  "), "t-dica");
    }
  });

  // Clicar na tela do terminal volta o cursor para a linha de comando (sem atrapalhar quem seleciona texto)
  saida.addEventListener("click", (e) => {
    if (!e.target.closest("a") && !getSelection().toString()) entrada.focus();
  });

  /* ---------- Recado para quem abre o console ---------- */
  console.log("%cGS", "font: 800 44px 'Bricolage Grotesque', sans-serif; color: #ffc531; text-shadow: 3px 3px 0 #1a1446");
  console.log("Olá, dev curioso! 👋 Este site foi feito à mão, sem template.\nAperte Ctrl + K para abrir o terminal, ou digite gabriel.contratar() aqui mesmo.");
  window.gabriel = {
    contratar() {
      window.open(linkContratar, "_blank", "noopener");
      desbloquear("missao");
      return "Abrindo o WhatsApp... 🚀";
    },
    terminal() {
      abrirTerminal();
      return "Terminal aberto.";
    },
  };
})();
