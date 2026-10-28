// Páginas do blog: linha do topo e barra de leitura, conquistas e "Copiar link".
// O céu e o botão dia/noite vêm do ceu.js.
(() => {
  const $ = (id) => document.getElementById(id);
  const raiz = document.documentElement;

  /* ---------- Topo e barra de leitura (só nos posts) ---------- */
  const topo = document.querySelector(".topo");
  const barra = $("progresso");
  let agendado = false;

  function atualizar() {
    agendado = false;
    topo.classList.toggle("rolado", scrollY > 8);
    if (!barra) return;
    const max = raiz.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 1;
    barra.style.width = `${(p * 100).toFixed(2)}%`;
    barra.style.backgroundPosition = `${(scrollY * 0.25).toFixed(1)}px 0`;
  }
  addEventListener(
    "scroll",
    () => {
      if (agendado) return;
      agendado = true;
      requestAnimationFrame(atualizar);
    },
    { passive: true }
  );
  addEventListener("resize", atualizar);
  atualizar();

  /* ---------- Conquistas: as mesmas da página inicial, salvas no mesmo lugar ---------- */
  // Mesmos ids e títulos do SECRETAS no script.js
  const CONQUISTAS = {
    leitor: { icone: "📖", titulo: "Leitor de bordo" },
    tema: { icone: "🌗", titulo: "Ciclo dia e noite" },
  };
  const CHAVE = "gs-conquistas";
  const caixaAvisos = $("toasts");

  function avisar({ icone, titulo }) {
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `<div class="toast-icone" aria-hidden="true">${icone}</div>
      <div><small>Conquista desbloqueada</small><strong>${titulo}</strong></div>`;
    caixaAvisos.appendChild(t);
    try {
      if (caixaAvisos.matches(":popover-open")) caixaAvisos.hidePopover();
      caixaAvisos.showPopover();
    } catch {
      // navegador sem popover: a caixa continua como um elemento fixo comum
    }
    setTimeout(() => {
      t.classList.add("saindo");
      setTimeout(() => t.remove(), 600);
    }, 4500);
  }

  function desbloquear(id) {
    let salvo = {};
    try {
      salvo = JSON.parse(localStorage.getItem(CHAVE)) || {};
    } catch {
      // sem armazenamento: o aviso aparece, mas não fica salvo
    }
    const ids = Array.isArray(salvo.ids) ? salvo.ids : [];
    if (ids.includes(id)) return;
    salvo.ids = [...ids, id];
    salvo.primeiraVisita ||= Date.now();
    try {
      localStorage.setItem(CHAVE, JSON.stringify(salvo));
    } catch {
      // idem
    }
    avisar(CONQUISTAS[id]);
  }

  addEventListener("gs:tema", () => desbloquear("tema"));

  // "Leitor de bordo": chegou ao convite do fim do post
  const fimDoPost = $("fim-do-post");
  if (fimDoPost && "IntersectionObserver" in window) {
    const observador = new IntersectionObserver((entradas) => {
      if (!entradas.some((e) => e.isIntersecting)) return;
      observador.disconnect();
      desbloquear("leitor");
    });
    observador.observe(fimDoPost);
  }

  /* ---------- Copiar o link do post ---------- */
  const copiar = $("copiar-link");
  if (copiar) {
    const texto = copiar.textContent;
    copiar.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(location.href.split("#")[0]);
        copiar.textContent = "Link copiado!";
      } catch {
        copiar.textContent = "Não deu para copiar";
      }
      setTimeout(() => (copiar.textContent = texto), 2000);
    });
  }
})();
