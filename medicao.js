// Medição de visitas com o Google Analytics, só depois do "sim" do visitante no aviso de cookies.
// Usado na página inicial e nas páginas do blog: carregue antes do script.js ou do blog.js.

// ID da propriedade do Google Analytics, ex.: "G-ABC123XYZ".
// Vazio desliga tudo: o aviso de cookies não aparece e nada é medido.
const ID_ANALYTICS = "G-3P15X3HS1M";

// Manda um evento para o Analytics. Sem o "sim" do visitante (ou sem ID), não faz nada.
// Ex.: medir("clique_whatsapp", { origem: "terminal" })
function medir(evento, parametros = {}) {
  window.gtag?.("event", evento, parametros);
}

(() => {
  if (!ID_ANALYTICS) return;

  const CHAVE = "gs-cookies"; // "sim" ou "nao"
  const desligado = `ga-disable-${ID_ANALYTICS}`; // chave oficial do gtag para parar de enviar
  // A pasta do site, tirada do endereço deste arquivo: o link da política funciona também dentro do blog
  const raiz = new URL(".", document.currentScript.src).href;

  function lerEscolha() {
    try {
      return localStorage.getItem(CHAVE);
    } catch {
      return null; // sem armazenamento: o aviso aparece a cada visita
    }
  }

  function salvarEscolha(valor) {
    try {
      localStorage.setItem(CHAVE, valor);
    } catch {
      // sem armazenamento: vale só nesta visita
    }
  }

  /* ---------- Google Analytics ---------- */
  // O gtag.js só é baixado depois do "sim": antes disso, nenhum dado sai do navegador.
  let carregado = false;
  function ligarAnalytics() {
    window[desligado] = false;
    if (carregado) return;
    carregado = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      dataLayer.push(arguments); // o gtag.js espera o objeto arguments, não uma lista
    };
    // Só estatística de visitas: nada de anúncio, remarketing ou Google Signals
    gtag("consent", "default", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    gtag("js", new Date());
    gtag("config", ID_ANALYTICS, { allow_google_signals: false, allow_ad_personalization_signals: false });
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ID_ANALYTICS)}`;
    document.head.appendChild(s);
  }

  // Quem muda de ideia: o gtag para de enviar e os cookies do Analytics (_ga, _ga_XXXX) são apagados
  function desligarAnalytics() {
    window[desligado] = true;
    const nomes = document.cookie
      .split(";")
      .map((c) => c.split("=")[0].trim())
      .filter((n) => n.startsWith("_ga"));
    // O Analytics grava o cookie no domínio principal (.gabrielsoares.me): apaga nos dois jeitos
    const dominios = ["", `; domain=.${location.hostname.replace(/^www\./, "")}`];
    for (const nome of nomes) for (const dominio of dominios) document.cookie = `${nome}=; Max-Age=0; path=/${dominio}`;
  }

  /* ---------- Aviso de cookies ---------- */
  // Uma caixa no canto, no estilo do site: não bloqueia a página. Recusar é tão fácil quanto aceitar.
  const aviso = document.createElement("div");
  aviso.className = "aviso-cookies";
  aviso.setAttribute("role", "region");
  aviso.setAttribute("aria-labelledby", "aviso-cookies-titulo");
  aviso.hidden = true;
  aviso.innerHTML = `
    <p class="aviso-cookies-titulo" id="aviso-cookies-titulo"><span aria-hidden="true">🍪</span> Posso contar a sua visita?</p>
    <p>Com o seu sim, uso o Google Analytics para saber quais páginas ajudam mais gente. Nada de anúncio.
      <a class="botao-link" href="${raiz}privacidade/">Saiba mais</a></p>
    <p class="aviso-cookies-estado" id="aviso-cookies-estado" hidden></p>
    <div class="aviso-cookies-acoes">
      <button type="button" class="botao primario" data-cookies="sim">Aceitar</button>
      <button type="button" class="botao" data-cookies="nao">Recusar</button>
    </div>`;
  document.body.appendChild(aviso);
  const estado = aviso.querySelector("#aviso-cookies-estado");

  function mostrarAviso(focar) {
    const escolha = lerEscolha();
    estado.hidden = !escolha;
    estado.textContent = escolha === "sim" ? "Hoje: você aceitou." : "Hoje: você recusou.";
    aviso.hidden = false;
    if (focar) aviso.querySelector("button").focus();
  }

  aviso.addEventListener("click", (e) => {
    const botao = e.target.closest("[data-cookies]");
    if (!botao) return;
    const sim = botao.dataset.cookies === "sim";
    salvarEscolha(sim ? "sim" : "nao");
    aviso.hidden = true;
    if (sim) ligarAnalytics();
    else desligarAnalytics();
  });

  // Esc fecha o aviso reaberto, sem mudar a escolha (na primeira visita, ele espera a resposta)
  aviso.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lerEscolha()) aviso.hidden = true;
  });

  // Qualquer link para "#cookies" reabre o aviso, como o da página de privacidade
  document.addEventListener("click", (e) => {
    if (!e.target.closest('a[href="#cookies"]')) return;
    e.preventDefault();
    mostrarAviso(true);
  });

  const escolha = lerEscolha();
  if (escolha === "sim") ligarAnalytics();
  else if (escolha !== "nao") mostrarAviso(false);

  /* ---------- Cliques no WhatsApp ---------- */
  // Só os links para o WhatsApp do Gabriel (wa.me/número). O "Mande para alguém" do blog
  // (wa.me/?text=) é para compartilhar o post, não para falar comigo, e fica de fora.
  // origem diz de qual parte do site veio o clique; a primeira área da lista que contém o link vence.
  const ORIGENS = {
    missao: "monte_sua_missao",
    servicos: "servicos",
    jogo: "fase_bonus",
    "fim-do-post": "fim_do_post",
    contato: "contato",
  };
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href*="wa.me/"]');
    if (!link || !/wa\.me\/\d/.test(link.href)) return;
    const area = Object.keys(ORIGENS).find((id) => link.closest(`#${id}`));
    const parametros = { origem: area ? ORIGENS[area] : "outro" };
    const servico = link.closest(".servico")?.querySelector("h3")?.textContent;
    if (servico) parametros.servico = servico;
    medir("clique_whatsapp", parametros);
  });
})();
