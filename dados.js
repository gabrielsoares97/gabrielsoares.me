// Todo o conteúdo do site mora aqui. Edite à vontade — o resto se ajusta sozinho.

const DADOS = {
  nome: "Gabriel",
  sobrenome: "Soares",
  titulo: "Dev full-stack", // aparece como "classe" na ficha
  cidade: "Balneário Piçarras, SC",
  status: "Agenda aberta para novos projetos", // selo com luz verde no topo do hero; vazio esconde
  foto: "foto.jpg", // vazio mostra o espaço reservado
  fotoEnquadramento: "70% 25%", // qual parte da foto aparece: horizontal e vertical (0% = esquerda/topo)
  inicioCarreira: "2021-01-01", // ajuste o mês se quiser — define o nível e a barra de XP
  projetosEntregues: "+20", // total de projetos entregues, mostrado na ficha do hero

  resumo:
    "Crio sites, sistemas e apps que funcionam de verdade, do banco de dados ao último pixel. Aqui estão as coisas que construí e as conquistas que desbloqueei pelo caminho.",

  // Use *assim* para deixar uma palavra em itálico.
  sobre: [
    "Sou o Gabriel, desenvolvedor full-stack em Balneário Piçarras. Desde 2021, coloquei no ar mais de 20 sites, um sistema de gestão para a JBL Transportes e dois aplicativos próprios.",
    "Antes de *codar*, trabalhei com tráfego pago e design. Por isso não penso só no código: penso em quem vai visitar o seu site, no que faz essa pessoa confiar em você e no que a leva a chamar no WhatsApp.",
    "Você fala direto comigo, do primeiro orçamento até o projeto no ar. Quase tudo o que sei aprendi na prática, resolvendo problemas de verdade. Nas horas vagas, estou aprendendo a criar jogos, o que explica as conquistas (e a fase bônus) espalhadas por aqui.",
  ],

  email: "contato@gabrielsoares.me",
  curriculoPdf: "", // ex.: "curriculo.pdf" — vazio esconde o botão
  // nome define o ícone de pixel: WhatsApp, Instagram, LinkedIn ou GitHub
  links: [
    { nome: "WhatsApp", url: "https://wa.me/5547992201382?text=Oi%20Gabriel!%20Vi%20seu%20site%20e%20quero%20conversar." },
    { nome: "Instagram", url: "https://www.instagram.com/ogabrielsoares.dev/" },
    { nome: "LinkedIn", url: "https://www.linkedin.com/in/gabriel-gracie/" },
    { nome: "GitHub", url: "https://github.com/gabrielsoares97" },
  ],

  // preco é opcional: ex.: "a partir de R$ 1.500". Vazio esconde a linha de preço.
  // O botão abre o WhatsApp (o primeiro link chamado "WhatsApp") já com o nome do serviço na mensagem.
  servicos: [
    {
      icone: "🌐",
      nome: "Site institucional",
      descricao: "O endereço da sua empresa na internet: mostra quem você é, o que oferece e como falar com você.",
      inclui: ["Até 5 páginas", "Funciona bem no celular", "Botão de WhatsApp", "Pronto para aparecer no Google"],
      preco: "",
    },
    {
      icone: "🎯",
      nome: "Landing page",
      descricao: "Uma página feita para vender um produto, serviço ou evento. Ideal para quem anuncia no Google ou no Instagram.",
      inclui: ["Texto pensado para converter", "Formulário ou WhatsApp", "Carregamento rápido", "Pronta para tráfego pago"],
      preco: "",
    },
    {
      icone: "⚙️",
      nome: "Sistema web sob medida",
      descricao: "Troque planilhas e gambiarras por um painel feito do jeito que a sua empresa trabalha.",
      inclui: ["Cadastros e controles", "Acesso de qualquer lugar", "Usuários e permissões", "Banco de dados seguro"],
      preco: "",
    },
    {
      icone: "📱",
      nome: "Aplicativo",
      descricao: "App para Android ou para computador, do protótipo até a publicação.",
      inclui: ["Design das telas", "Android, Windows ou Mac", "Publicação", "Atualizações depois do lançamento"],
      preco: "",
    },
  ],

  // "Monte sua missão", no contato: o visitante responde com um clique por pergunta e o pedido
  // chega pronto no WhatsApp. A primeira pergunta ("Qual é a missão?") usa os serviços acima.
  // rotulo é como a resposta aparece no resumo e na mensagem.
  missao: [
    {
      pergunta: "Em que ponto você está?",
      rotulo: "Ponto de partida",
      opcoes: [
        { icone: "🌱", texto: "Começando do zero" },
        { icone: "♻️", texto: "Quero refazer o que já tenho" },
        { icone: "🔧", texto: "Quero melhorar o que já existe" },
      ],
    },
    {
      pergunta: "Para quando você precisa?",
      rotulo: "Prazo",
      opcoes: [
        { icone: "🐢", texto: "Sem pressa" },
        { icone: "📅", texto: "Nas próximas semanas" },
        { icone: "🔥", texto: "Para ontem" },
      ],
    },
  ],

  // "Como funciona": as etapas de um projeto, na ordem.
  processo: [
    {
      icone: "💬",
      titulo: "Conversa",
      descricao: "Você me conta a ideia pelo WhatsApp: o que a sua empresa faz e o que o projeto precisa resolver.",
    },
    {
      icone: "🗺️",
      titulo: "Proposta",
      descricao: "Você recebe o plano do projeto, com o que vai ser feito, o prazo e o valor.",
    },
    {
      icone: "🛠️",
      titulo: "Construção",
      descricao: "Eu desenvolvo e você acompanha de perto, com prévias para aprovar antes de tudo ir ao ar.",
    },
    {
      icone: "🚀",
      titulo: "No ar",
      descricao: "Publico, deixo tudo pronto para o Google e continuo por perto depois do lançamento.",
    },
  ],

  // raridade: "comum" | "rara" | "épica" | "lendária"
  // data é opcional. emAndamento: true mostra a conquista como "bloqueada" no fim da lista.
  conquistas: [
    {
      icone: "🌐",
      titulo: "+20 sites institucionais entregues",
      descricao: "Mais de vinte sites no ar para empresas e profissionais, do layout à publicação. E a lista continua crescendo.",
      data: "2021 até hoje",
      raridade: "lendária",
    },
    {
      icone: "📱",
      titulo: "Apliki no ar",
      descricao: "Lancei meu app para Android, que ajuda pessoas a acompanhar a jornada de emagrecimento.",
      data: "2026",
      raridade: "épica",
    },
    {
      icone: "📜",
      titulo: "5 certificados Origamid",
      descricao: "HTML, CSS, JavaScript, Next.js e UI Design.",
      data: "2021 a 2023",
      raridade: "épica",
    },
    {
      icone: "⚙️",
      titulo: "Back-end com Node.js",
      descricao: "Passei a construir também o lado do servidor: APIs em Node.js, a base de sistemas como o da JBL Transportes.",
      data: "2024",
      raridade: "rara",
    },
    {
      icone: "🎓",
      titulo: "Análise e Desenvolvimento de Sistemas",
      descricao: "Graduação na Uniasselvi.",
      data: "Desde 2026",
      emAndamento: true,
    },
  ],

  // Cada projeto abre uma janela no botão "Saber mais".
  // imagens: lista de prints, ex.: ["prints/jbl-1.png", "prints/jbl-2.png"]. A primeira vira a capa do card.
  projetos: [
    {
      nome: "JBL Transportes",
      tipo: "Sistema web de gestão empresarial",
      descricao:
        "Sistema de gestão feito sob medida para a JBL Transportes, que reúne a operação da empresa num painel web.",
      detalhes: [
        "A JBL Transportes precisava de uma ferramenta própria para organizar o dia a dia da empresa, em vez de depender de planilhas e sistemas genéricos. Desenvolvi um sistema de gestão empresarial que centraliza cadastros, controles e informações da operação num só lugar, acessível de qualquer navegador.",
        "Cuidei do projeto de ponta a ponta: API em Node.js, interface em React e banco de dados MySQL. O sistema está no ar em painel.jbltransporte.com.br.",
      ],
      tecnologias: ["Node.js", "React", "MySQL"],
      link: "https://painel.jbltransporte.com.br/",
      textoLink: "Acessar o painel",
      imagens: [],
      destaque: true,
    },
    {
      nome: "Apliki",
      tipo: "Aplicativo para Android",
      descricao: "App que ajuda pessoas a acompanhar e manter a rotina de emagrecimento, direto no celular.",
      detalhes: [
        "Emagrecer depende de constância, e constância depende de acompanhar o próprio progresso. O Apliki nasceu para deixar esse acompanhamento simples no dia a dia, na palma da mão.",
        "Feito com React, com Firebase e Cloudflare na infraestrutura.",
      ],
      tecnologias: ["React", "Firebase", "Cloudflare"],
      link: "",
      textoLink: "",
      imagens: [],
    },
    {
      nome: "CursoFlix",
      tipo: "Aplicativo para Windows e Mac",
      descricao: "Uma Netflix dos seus estudos: reúne os cursos que você faz pela internet numa biblioteca só, no computador.",
      detalhes: [
        "Quem estuda pela internet acaba com aulas espalhadas por várias plataformas e pastas. O CursoFlix reúne tudo numa biblioteca única no computador, para você organizar seus cursos e assistir às aulas sem se perder.",
        "Disponível para Windows e Mac.",
      ],
      tecnologias: [],
      link: "",
      textoLink: "",
      imagens: [],
    },
  ],

  // Da mais antiga para a mais recente. "lugar" é opcional.
  jornada: [
    {
      periodo: "2019 a 2020",
      cargo: "Gestor de tráfego",
      lugar: "",
      descricao:
        "Minha porta de entrada no trabalho remoto: campanhas de tráfego pago e o primeiro contato com o lado digital dos negócios.",
    },
    {
      periodo: "2020 a 2021",
      cargo: "Designer",
      lugar: "",
      descricao: "Do anúncio para o visual: passei a criar a identidade e as peças das marcas. Foi aqui que nasceu o meu olhar para o design.",
    },
    {
      periodo: "2021 até hoje",
      cargo: "Dev",
      lugar: "",
      descricao:
        "Comecei a *codar* e não parei mais: mais de 20 sites entregues, o sistema da JBL Transportes e os apps Apliki e CursoFlix.",
    },
  ],

  inventario: [
    { grupo: "Linguagens", itens: ["HTML", "CSS", "JavaScript", "Python"] },
    { grupo: "Front-end", itens: ["React", "Next.js", "UI Design"] },
    { grupo: "Back-end", itens: ["Node.js", "MySQL", "Firebase"] },
    { grupo: "Ferramentas", itens: ["Claude Code", "Cloudflare"] },
    { grupo: "Trazidos das fases 1 e 2", itens: ["Tráfego pago", "Design"] },
  ],

  // Perguntas frequentes, abertas uma de cada vez na seção antes do contato.
  perguntas: [
    {
      pergunta: "Quanto custa um site?",
      resposta: "Depende do tamanho e do que ele precisa fazer. Me conte a sua ideia no WhatsApp e eu te passo um orçamento sem compromisso.",
    },
    {
      pergunta: "Você atende só em Balneário Piçarras?",
      resposta: "Não. Atendo Piçarras e toda a região, como Itajaí, Navegantes, Penha e Balneário Camboriú, e também clientes de todo o Brasil, com tudo combinado pela internet.",
    },
    {
      pergunta: "O site vai funcionar no celular?",
      resposta: "Sim. Todo site que eu faço funciona bem no celular, no tablet e no computador. É pelo celular que a maioria dos seus clientes vai abrir o site.",
    },
    {
      pergunta: "Meu site vai aparecer no Google?",
      resposta: "Entrego o site pronto para o Google: rápido e com as informações que o buscador usa para entender o seu negócio. A posição nas buscas também depende da concorrência e do tempo, mas o seu site já começa do jeito certo.",
    },
    {
      pergunta: "E depois que o site estiver no ar?",
      resposta: "Você continua falando direto comigo. Se precisar de ajustes, novidades ou de uma página nova, é só chamar.",
    },
  ],
};
