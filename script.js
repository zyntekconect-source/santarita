/**
 * ================================================
 * SANTA RITA - CASA DOS COLCHÕES
 * script.js — Vanilla JS ES6+ Modular
 * ================================================
 *
 * ARQUITETURA:
 *  1. CONFIG & CONSTANTES
 *  2. MOCK DATA (substituir por fetch à API)
 *  3. STATE (estado global client-side)
 *  4. API MODULE (funções preparadas para back-end)
 *  5. UI HELPERS (toast, modal, badge)
 *  6. HEADER & NAV
 *  7. CATEGORIAS
 *  8. VITRINE (grid de produtos)
 *  9. DEPOIMENTOS
 * 10. MODAIS (login, cadastro, produto)
 * 11. FILTROS
 * 12. ANIMAÇÕES (IntersectionObserver)
 * 13. FOOTER
 * 14. INIT
 */

'use strict';

/* ================================================
   1. CONFIG & CONSTANTES
   ================================================ */
const CONFIG = {
  WHATSAPP_VENDAS:  '5599701-7188',
  WHATSAPP_SUPORTE: '5599860-8375',
  PRODUTOS_DESTAQUE: 8,
  DEP_VISIBLE_MOBILE:  1,
  DEP_VISIBLE_TABLET:  2,
  DEP_VISIBLE_DESKTOP: 3,
  DEP_BREAKPOINT_TABLET:  768,
  DEP_BREAKPOINT_DESKTOP: 1024,
  TOAST_DURACAO: 3400,
};

/* ================================================
   2. MOCK DATA
   Substitua as chamadas diretas por funções da
   seção "API MODULE" quando o back-end estiver pronto.
   ================================================ */

const CATEGORIAS_DATA = [
  { id: 'colchao',    nome: 'Colchões',    emoji: '🛏️' },
  { id: 'cama',       nome: 'Cama',        emoji: '🪵' },
  { id: 'sofa',       nome: 'Sofá',        emoji: '🛋️' },
  { id: 'cabeceira',  nome: 'Cabeceira',   emoji: '🔲' },
  { id: 'puff',       nome: 'Puff',        emoji: '🪑' },
  { id: 'travesseiro',nome: 'Travesseiro', emoji: '💤' },
  { id: 'almofada',   nome: 'Almofada',    emoji: '🫧' },
  { id: 'poltrona',   nome: 'Poltrona',    emoji: '🪑' },
];


const DEPOIMENTOS_DATA = [
  {
    id: 1,
    texto: 'Comprei um colchão de molas pocket e a diferença foi imediata. Durmo muito melhor, as dores nas costas desapareceram em semanas. Atendimento top, entregaram no dia combinado e ainda montaram tudo!',
    nome: 'Mariana Oliveira',
    cidade: 'São Luís, MA',
    estrelas: 5,
    inicial: 'M',
    foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&q=80',
  },
  {
    id: 2,
    texto: 'A Santa Rita tem os melhores preços da cidade e ainda parcelam em 10x sem juros. Comprei a cama box e a cabeceira. O vendedor foi super paciente e me ajudou a escolher o colchão certo para o meu peso.',
    nome: 'Carlos Eduardo',
    cidade: 'Imperatriz, MA',
    estrelas: 5,
    inicial: 'C',
    foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&q=80',
  },
  {
    id: 3,
    texto: 'Precisava de um colchão sob medida para um quarto com formato diferente. A equipe fez exatamente o que precisei, tamanho personalizado e ainda entregaram antes do prazo. Recomendo sem hesitar!',
    nome: 'Fernanda Costa',
    cidade: 'Timon, MA',
    estrelas: 5,
    inicial: 'F',
    foto: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=160&q=80',
  },
  {
    id: 4,
    texto: 'Comprei o sofá chaise e ficou incrível na sala. A qualidade do tecido e do acabamento é excelente. Passei dois anos pesquisando e a Santa Rita tinha o melhor custo-benefício com certeza.',
    nome: 'Roberto Almeida',
    cidade: 'São Luís, MA',
    estrelas: 5,
    inicial: 'R',
    foto: 'https://images.unsplash.com/photo-1500614782310-d5401b9e0d21?w=160&q=80',
  },
  {
    id: 5,
    texto: 'Atendimento via WhatsApp muito rápido. Mandei a foto do meu quarto e o vendedor me ajudou a escolher a cabeceira certa. Chegou embalado perfeitamente e a montagem foi super fácil. Nota 10!',
    nome: 'Patrícia Mendes',
    cidade: 'Caxias, MA',
    estrelas: 5,
    inicial: 'P',
    foto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&q=80',
  },
  {
    id: 6,
    texto: 'O travesseiro viscoelástico mudou minha vida! Tinha dores no pescoço há anos, e depois de duas semanas usando já percebi uma melhora enorme. Vale cada centavo. A loja é confiável e ágil na entrega.',
    nome: 'André Santos',
    cidade: 'Bacabal, MA',
    estrelas: 5,
    inicial: 'A',
    foto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&q=80',
  },
];

/* ================================================
   3. STATE — estado global client-side
   ================================================ */
const State = {
  carrinho:         [],  // { produto, quantidade }
  favoritos:        [],  // [id, id, ...]
  categoriaSelecionada: 'todos',
  filtroPrecoMax:   5000,
  filtroDensidade:  'todas',
  filtroOrdenacao:  'padrao',
  mostrandoTodos:   false,
  depoimentoAtual:  0,
  depTotal:         DEPOIMENTOS_DATA.length,
  usuario:          null, // { nome, email } após login
};

/* ================================================
   4. API MODULE
   Funções prontas para integração com back-end.
   Substituir o mock por fetch() real.
   ================================================ */
const API = {
  BASE_URL: '/api/v1', // ← configurar URL da API real

  /**
   * Autenticação — POST /api/v1/auth/login
   * @param {string} email
   * @param {string} senha
   * @returns {Promise<{token:string, usuario:Object}>}
   */
  async login(email, senha) {
    console.log('[API] POST /auth/login', { email, senha: '***' });
    // MOCK: simula resposta de sucesso após 600ms
    await delay(600);
    return { token: 'mock-jwt-token', usuario: { nome: 'Usuário Teste', email } };
    /*
    const res = await fetch(`${this.BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });
    if (!res.ok) throw new Error('Credenciais inválidas');
    return res.json();
    */
  },

  /**
   * Cadastro — POST /api/v1/auth/cadastro
   * @param {Object} dados — { nome, email, telefone, senha }
   * @returns {Promise<{token:string, usuario:Object}>}
   */
  async cadastro(dados) {
    console.log('[API] POST /auth/cadastro', { ...dados, senha: '***' });
    await delay(700);
    return { token: 'mock-jwt-token', usuario: { nome: dados.nome, email: dados.email } };
    /*
    const res = await fetch(`${this.BASE_URL}/auth/cadastro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    if (!res.ok) throw new Error('Erro ao criar conta');
    return res.json();
    */
  },

  /**
   * Produtos — GET /api/v1/produtos
   * @param {{ categoria?: string, precoMax?: number }} filtros
   * @returns {Promise<Array>}
   */
 async carregarProdutos(filtros = {}) {
  console.log('Buscando produtos no Supabase...');

  const { data, error } = await supabaseClient
    .from('produtos')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error('Erro Supabase:', error);
    return [];
  }

  console.log('Produtos recebidos:', data);

  let lista = (data || []).map(p => ({
    id: p.id,
    titulo: p.titulo,
    categoria: p.categoria,
    catNome:
      CATEGORIAS_DATA.find(c => c.id === p.categoria)?.nome
      || p.categoria
      || 'Produto',
    preco: Number(p.preco) || 0,
    destaque: Boolean(p.destaque),
    tag: p.tag || null,
    densidade: p.densidade || null,
    img: p.imagem || '',
    descricao: p.descricao || '',
    specs: {
      ...(p.especificacoes
        ? { Tecnologia: p.especificacoes }
        : {}),
      ...(p.densidade
        ? { Densidade: p.densidade }
        : {})
    },
    estoque: Number(p.estoque) || 0
  }));

  if (filtros.categoria && filtros.categoria !== 'todos') {
    lista = lista.filter(p =>
      p.categoria === filtros.categoria
    );
  }

  if (filtros.precoMax) {
    lista = lista.filter(p =>
      p.preco <= Number(filtros.precoMax)
    );
  }

  if (filtros.densidade && filtros.densidade !== 'todas') {
    lista = lista.filter(p =>
      p.densidade === filtros.densidade
    );
  }

  if (filtros.ordenacao === 'menor') {
    lista.sort((a, b) => a.preco - b.preco);
  }

  if (filtros.ordenacao === 'maior') {
    lista.sort((a, b) => b.preco - a.preco);
  }

  console.log('Produtos enviados para a vitrine:', lista);

  return lista;
},
  /**
   * Favoritos — POST /api/v1/favoritos
   * @param {number} produtoId
   * @param {string} acao — 'adicionar' | 'remover'
   * @returns {Promise<void>}
   */
  async toggleFavorito(produtoId, acao) {
    console.log(`[API] POST /favoritos { produtoId: ${produtoId}, acao: '${acao}' }`);
    await delay(300);
    return { ok: true };
    /*
    const token = localStorage.getItem('token'); // quando auth estiver pronto
    const res = await fetch(`${this.BASE_URL}/favoritos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ produtoId, acao }),
    });
    if (!res.ok) throw new Error('Erro ao atualizar favoritos');
    */
  },

  /**
   * Carrinho — POST /api/v1/carrinho
   * @param {number} produtoId
   * @param {number} quantidade
   * @returns {Promise<void>}
   */
  async adicionarAoCarrinho(produtoId, quantidade = 1) {
    console.log(`[API] POST /carrinho { produtoId: ${produtoId}, quantidade: ${quantidade} }`);
    await delay(300);
    return { ok: true };
  },
};

/* ================================================
   5. UI HELPERS
   ================================================ */

/** Delay utilitário (mock de latência) */
const delay = (ms) => new Promise(r => setTimeout(r, ms));

/** Formata número como moeda BRL */
const formatarPreco = (valor) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

/** Calcular parcela */
const calcularParcela = (preco, parcelas = 10) =>
  formatarPreco(preco / parcelas);

/** Exibir toast */
const mostrarToast = (mensagem, tipo = 'info') => {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast--${tipo}`;
  toast.setAttribute('role', 'status');
  toast.textContent = mensagem;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('sair');
    toast.addEventListener('animationend', () => toast.remove());
  }, CONFIG.TOAST_DURACAO);
};

/** Atualizar badge de contador */
const atualizarBadge = (idBadge, valor) => {
  const badge = document.getElementById(idBadge);
  if (!badge) return;
  badge.textContent = valor;
  badge.dataset.zero = valor === 0 ? 'true' : 'false';
};

/** Abrir modal */
const abrirModal = (idModal) => {
  const overlay = document.getElementById(idModal);
  if (!overlay) return;
  overlay.hidden = false;
  overlay.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
  // foco no primeiro elemento focável
  const focavel = overlay.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  focavel?.focus();
};

/** Fechar modal */
const fecharModal = (idModal) => {
  const overlay = document.getElementById(idModal);
  if (!overlay) return;
  overlay.hidden = true;
  document.body.style.overflow = '';
};

/* ================================================
   6. HEADER & NAV
   ================================================ */
const initHeader = () => {
  const header = document.getElementById('header');
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('main-nav');

  // Sticky sombra no scroll
  const handleScroll = () => {
    header?.classList.toggle('header--scrolled', window.scrollY > 10);
  };
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Hamburger toggle
  hamburger?.addEventListener('click', () => {
    const aberto = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!aberto));
    hamburger.classList.toggle('ativo', !aberto);
    nav?.classList.toggle('aberto', !aberto);
    hamburger.setAttribute('aria-label', aberto ? 'Abrir menu' : 'Fechar menu');
  });

  // Fechar nav ao clicar fora
  nav?.addEventListener('click', (e) => {
    if (e.target === nav) fecharNavMobile();
  });

  // Fechar ao clicar em link
  nav?.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', fecharNavMobile);
  });

  // ESC fecha
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      fecharNavMobile();
      fecharModal('modal-login');
      fecharModal('modal-produto');
    }
  });

  // Active link por scroll (IntersectionObserver)
  const secoes = document.querySelectorAll('section[id], footer[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  const ioNav = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('ativo'));
        const link = document.querySelector(`.nav__link[href="#${entry.target.id}"]`);
        link?.classList.add('ativo');
      }
    });
  }, { threshold: 0.3 });

  secoes.forEach(s => ioNav.observe(s));

  function fecharNavMobile() {
    hamburger?.setAttribute('aria-expanded', 'false');
    hamburger?.classList.remove('ativo');
    nav?.classList.remove('aberto');
    hamburger?.setAttribute('aria-label', 'Abrir menu');
  }

  // Botão carrinho → abre drawer
  document.getElementById('btn-carrinho')?.addEventListener('click', (e) => {
    e.stopImmediatePropagation();
    if (typeof abrirDrawer === 'function') abrirDrawer('carrinho');
  });

  // Botão favoritos → abre drawer
  document.getElementById('btn-favoritos')?.addEventListener('click', (e) => {
    e.stopImmediatePropagation();
    if (typeof abrirDrawer === 'function') abrirDrawer('favoritos');
  });
};

/* ================================================
   7. CATEGORIAS — grid estático (8 cards simultâneos)
   ================================================ */
const initCategorias = () => {
  const grid = document.getElementById('categorias-grid');
  if (!grid) return;

  CATEGORIAS_DATA.forEach(cat => {
    const card = document.createElement('div');
    card.className = 'cat-card reveal';
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-pressed', 'false');
    card.dataset.cat = cat.id;

    const imgUrl = CATEGORIAS_IMAGES[cat.id];
    if (imgUrl) {
      card.style.backgroundImage    = `url('${imgUrl}')`;
      card.style.backgroundSize     = 'cover';
      card.style.backgroundPosition = 'center';
    }

    card.innerHTML = `<span class="cat-card__nome">${cat.nome}</span>`;

    card.addEventListener('click', () => selecionarCategoria(cat.id, card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selecionarCategoria(cat.id, card);
      }
    });

    grid.appendChild(card);
  });

  observarReveal();
};

const selecionarCategoria = (catId, cardClicado) => {
  const todos = document.querySelectorAll('.cat-card');
  todos.forEach(c => {
    c.classList.remove('ativa');
    c.setAttribute('aria-pressed', 'false');
  });
  cardClicado.classList.add('ativa');
  cardClicado.setAttribute('aria-pressed', 'true');

  State.categoriaSelecionada = catId;

  // Mostrar todos ao filtrar por categoria
  if (!State.mostrandoTodos) {
    State.mostrandoTodos = true;
    document.getElementById('btn-ver-todos')?.classList.add('oculto');
  }

  // Rolar suave até a vitrine
  document.getElementById('vitrine')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Ativar filtros e re-renderizar
  atualizarFiltros();
  renderizarVitrine();
};

/* ================================================
   8. VITRINE — grid de produtos
   ================================================ */
const renderizarVitrine = async () => {
  const grid = document.getElementById('vitrine-grid');
  const subtitulo = document.getElementById('vitrine-subtitulo');
  if (!grid) return;

  // Skeleton loading
  grid.innerHTML = '';
  for (let i = 0; i < 4; i++) {
    const sk = document.createElement('div');
    sk.style.cssText = 'height:340px;border-radius:18px';
    sk.className = 'skeleton';
    grid.appendChild(sk);
  }

  // Preço: com o controle no máximo, não há limite (senão produtos mais caros que o
  // máximo do controle nunca apareceriam na vitrine).
  const sliderPreco = document.getElementById('filtro-preco');
  const maxSlider   = sliderPreco ? (Number(sliderPreco.max) || 5000) : 5000;
  const precoMaxAtivo = State.filtroPrecoMax < maxSlider ? State.filtroPrecoMax : undefined;

  // Buscar produtos (filtros)
  let produtos;
  try {
    produtos = await API.carregarProdutos({
      categoria: State.categoriaSelecionada !== 'todos' ? State.categoriaSelecionada : undefined,
      precoMax: precoMaxAtivo,
      densidade: State.filtroDensidade,
      ordenacao: State.filtroOrdenacao,
    });
    console.log('=== TESTE VITRINE ===');
console.log('Produtos recebidos:', produtos);
console.log('Quantidade:', produtos.length);
  } catch (err) {
    console.error('[Vitrine]', err);
    grid.innerHTML = '<p class="vitrine-vazia">Erro ao carregar produtos. Tente novamente.</p>';
    return;
  }

  // Página inicial (sem filtro e sem "Ver todos"): só os produtos em destaque.
  // Se nenhum produto estiver marcado como destaque, mostra todos para a vitrine não ficar vazia.
  const temFiltro =
    State.categoriaSelecionada !== 'todos' ||
    precoMaxAtivo !== undefined ||
    (State.filtroDensidade && State.filtroDensidade !== 'todas');
  const modoInicial = !State.mostrandoTodos && !temFiltro;

  let lista = produtos;
  let temMais = false;   // existem produtos além dos destaques?
  if (modoInicial) {
    const destaques = produtos.filter(p => p.destaque);
    if (destaques.length) {
      lista = destaques;
      temMais = produtos.length > destaques.length;
    }
    const tituloVitrine = document.getElementById('vitrine-titulo');
    if (tituloVitrine) tituloVitrine.textContent = destaques.length ? 'Produtos em Destaque' : 'Nossos Produtos';
  }

  // Limpar grid
  grid.innerHTML = '';

  if (lista.length === 0) {
    grid.innerHTML = `
      <div class="vitrine-vazia">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <h3>Nenhum produto encontrado</h3>
        <p>Tente mudar os filtros ou <a href="#" onclick="limparFiltros();return false;">limpar a busca</a>.</p>
      </div>`;
    return;
  }

  // Atualizar subtítulo
  if (subtitulo) {
    const catNome = State.categoriaSelecionada === 'todos' ? '' : ` em ${CATEGORIAS_DATA.find(c => c.id === State.categoriaSelecionada)?.nome}`;
    subtitulo.textContent = modoInicial && temMais
      ? `${lista.length} produto(s) em destaque.`
      : `${lista.length} produto(s) encontrado(s)${catNome}.`;
  }

  // Renderizar cards
  lista.forEach((produto, idx) => {
    const isFav = State.favoritos.includes(produto.id);
    const card = document.createElement('article');
    card.className = 'produto-card reveal';
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${produto.titulo} — ${formatarPreco(produto.preco)}`);
    card.dataset.id = produto.id;
    card.style.animationDelay = `${idx * 60}ms`;

    card.innerHTML = `
      <div class="produto-card__img-wrap">
        <img
          src="${produto.img}"
          alt="${produto.titulo}"
          loading="lazy"
          width="600"
          height="450"
        />
        ${produto.tag ? `<span class="produto-card__tag">${produto.tag}</span>` : ''}
        <button
          class="produto-card__fav${isFav ? ' ativo' : ''}"
          data-id="${produto.id}"
          aria-label="${isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}: ${produto.titulo}"
          aria-pressed="${isFav}"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
      <div class="produto-card__corpo">
        <p class="produto-card__cat">${produto.catNome}</p>
        <h3 class="produto-card__titulo">${produto.titulo}</h3>
        <div class="produto-card__precos">
          <div class="produto-card__avista">${formatarPreco(produto.preco)}</div>
          <div class="produto-card__parcelado">ou 10× de ${calcularParcela(produto.preco)} sem juros</div>
        </div>
        <div class="produto-card__ver" aria-hidden="true">
          Ver detalhes
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
    `;

    // Click no card → mesma aba produto.html
    card.addEventListener('click', (e) => {
      if (e.target.closest('.produto-card__fav')) return;
      window.location.href = `produto.html?id=${produto.id}`;
    });
    card.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('.produto-card__fav')) {
        e.preventDefault();
        window.location.href = `produto.html?id=${produto.id}`;
      }
    });

    // Click favorito — usa window.toggleFavorito para permitir override
    card.querySelector('.produto-card__fav').addEventListener('click', (e) => {
      e.stopPropagation();
      const fn = window.toggleFavorito || toggleFavorito;
      fn(produto.id, e.currentTarget);
    });

    grid.appendChild(card);
  });

  // Revelar cards com animação
  observarReveal();

  // Botão "Ver Todos"
  const btnVerTodos = document.getElementById('btn-ver-todos');
  if (btnVerTodos) {
    // só aparece se houver produtos além dos destaques
    btnVerTodos.style.display = (modoInicial && temMais) ? '' : 'none';
  }
};

/* ================================================
   9. DEPOIMENTOS — carrossel de fotos/vídeos com scroll nativo
   Usa scroll-snap do próprio navegador em vez de calcular
   translateX manualmente: elimina o bug em que os cards
   ficavam cortados/sumindo por causa do descompasso entre
   os breakpoints do JS e os do CSS.
   ================================================ */
const initDepoimentos = () => {
  const track = document.getElementById('dep-track');
  const dotsWrap = document.getElementById('dep-dots');
  if (!track) return;

  // Renderizar cards (aceita depoimentos só com foto ou com foto + vídeo)
  DEPOIMENTOS_DATA.forEach((dep, idx) => {
    const estrelas = Array(dep.estrelas).fill(
      `<svg class="dep-card__estrela" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
    ).join('');

    const temVideo = Boolean(dep.video);
    const midiaHtml = temVideo
      ? `<video src="${dep.video}" poster="${dep.foto || ''}" muted loop playsinline preload="metadata"></video>
         <div class="dep-card__play" aria-hidden="true">
           <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
         </div>`
      : `<img src="${dep.foto}" alt="Foto de ${dep.nome}" loading="lazy" />`;

    const card = document.createElement('div');
    card.className = 'dep-card';
    card.setAttribute('role', 'listitem');
    card.innerHTML = `
      <div class="dep-card__midia">
        ${midiaHtml}
        <span class="dep-card__nota"><svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>${dep.estrelas.toFixed(1)}</span>
      </div>
      <div class="dep-card__corpo">
        <div class="dep-card__estrelas" aria-label="${dep.estrelas} de 5 estrelas">${estrelas}</div>
        <p class="dep-card__texto">"${dep.texto}"</p>
        <div class="dep-card__autor">
          <div class="dep-card__avatar" aria-hidden="true">${dep.foto ? `<img src="${dep.foto}" alt="" loading="lazy" />` : dep.inicial}</div>
          <div>
            <div class="dep-card__nome">${dep.nome}</div>
            <div class="dep-card__cidade">${dep.cidade}</div>
          </div>
        </div>
      </div>
    `;

    if (temVideo) {
      const videoEl = card.querySelector('video');
      card.querySelector('.dep-card__midia').addEventListener('click', () => {
        if (videoEl.paused) { videoEl.play(); card.querySelector('.dep-card__play').style.display = 'none'; }
        else { videoEl.pause(); card.querySelector('.dep-card__play').style.display = 'flex'; }
      });
    }

    track.appendChild(card);

    // Dots
    const dot = document.createElement('button');
    dot.className = `dep__dot${idx === 0 ? ' ativo' : ''}`;
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Ir para depoimento ${idx + 1}: ${dep.nome}`);
    dot.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
    dot.addEventListener('click', () => irParaDep(idx));
    dotsWrap?.appendChild(dot);
  });

  document.getElementById('dep-prev')?.addEventListener('click', () => {
    irParaDep(State.depoimentoAtual - 1);
  });
  document.getElementById('dep-next')?.addEventListener('click', () => {
    irParaDep(State.depoimentoAtual + 1);
  });

  // Mantém os dots sincronizados quando o usuário arrasta o carrossel manualmente
  track.addEventListener('scroll', () => {
    clearTimeout(track._depScrollTimer);
    track._depScrollTimer = setTimeout(() => {
      const card = track.querySelector('.dep-card');
      if (!card) return;
      const cardWidth = card.offsetWidth + 20; // gap
      const idxAtual = Math.round(track.scrollLeft / cardWidth);
      atualizarDotsDep(idxAtual);
    }, 100);
  }, { passive: true });
};

const atualizarDotsDep = (idx) => {
  State.depoimentoAtual = Math.max(0, Math.min(idx, State.depTotal - 1));
  document.querySelectorAll('.dep__dot').forEach((d, i) => {
    const ativo = i === State.depoimentoAtual;
    d.classList.toggle('ativo', ativo);
    d.setAttribute('aria-selected', String(ativo));
  });
};

const irParaDep = (idx) => {
  const track = document.getElementById('dep-track');
  if (!track) return;
  const card = track.querySelector('.dep-card');
  if (!card) return;

  const alvo = Math.max(0, Math.min(idx, State.depTotal - 1));
  const cardWidth = card.offsetWidth + 20; // gap
  track.scrollTo({ left: alvo * cardWidth, behavior: 'smooth' });
  atualizarDotsDep(alvo);
};

/* ================================================
   10. MODAIS
   ================================================ */

/* --- Modal Login --- */
const initModalLogin = () => {
  // Fechar ao clicar no overlay
  document.getElementById('modal-login')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) fecharModal('modal-login');
  });

  // Botões fechar
  document.querySelectorAll('.modal__fechar').forEach(btn => {
    btn.addEventListener('click', () => fecharModal(btn.dataset.modal));
  });

  // Abas
  const tabLogin    = document.getElementById('tab-login');
  const tabCadastro = document.getElementById('tab-cadastro');
  const painelLogin    = document.getElementById('painel-login');
  const painelCadastro = document.getElementById('painel-cadastro');

  const mudarAba = (ativa) => {
    const isLogin = ativa === 'login';
    tabLogin.classList.toggle('modal__tab--ativo', isLogin);
    tabCadastro.classList.toggle('modal__tab--ativo', !isLogin);
    tabLogin.setAttribute('aria-selected', String(isLogin));
    tabCadastro.setAttribute('aria-selected', String(!isLogin));
    painelLogin.hidden  = !isLogin;
    painelCadastro.hidden = isLogin;
    // foco no primeiro input da aba
    const painel = isLogin ? painelLogin : painelCadastro;
    painel?.querySelector('input')?.focus();
  };

  tabLogin?.addEventListener('click', () => mudarAba('login'));
  tabCadastro?.addEventListener('click', () => mudarAba('cadastro'));

  // Form Login
  document.getElementById('form-login')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const senha = document.getElementById('login-senha').value;

    if (!email || !senha) {
      mostrarToast('Preencha e-mail e senha.', 'erro');
      return;
    }

    const btnSubmit = e.target.querySelector('[type="submit"]');
    btnSubmit.textContent = 'Entrando...';
    btnSubmit.disabled = true;

    try {
      const { usuario } = await API.login(email, senha);
      State.usuario = usuario;
      mostrarToast(`Bem-vindo, ${usuario.nome}! 👋`, 'sucesso');
      fecharModal('modal-login');
      console.log('[Login] Sucesso:', usuario);
    } catch (err) {
      mostrarToast(err.message || 'Erro ao entrar. Tente novamente.', 'erro');
    } finally {
      btnSubmit.textContent = 'Entrar';
      btnSubmit.disabled = false;
    }
  });

  // Form Cadastro
  document.getElementById('form-cadastro')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const dados = {
      nome:      document.getElementById('cad-nome').value.trim(),
      email:     document.getElementById('cad-email').value.trim(),
      telefone:  document.getElementById('cad-telefone').value.trim(),
      senha:     document.getElementById('cad-senha').value,
    };

    if (!dados.nome || !dados.email || !dados.senha) {
      mostrarToast('Preencha os campos obrigatórios.', 'erro');
      return;
    }
    if (dados.senha.length < 8) {
      mostrarToast('A senha deve ter no mínimo 8 caracteres.', 'erro');
      return;
    }

    const btnSubmit = e.target.querySelector('[type="submit"]');
    btnSubmit.textContent = 'Criando conta...';
    btnSubmit.disabled = true;

    try {
      const { usuario } = await API.cadastro(dados);
      State.usuario = usuario;
      mostrarToast(`Conta criada com sucesso! Bem-vindo, ${usuario.nome}! 🎉`, 'sucesso');
      fecharModal('modal-login');
      console.log('[Cadastro] Sucesso:', usuario);
    } catch (err) {
      mostrarToast(err.message || 'Erro ao criar conta. Tente novamente.', 'erro');
    } finally {
      btnSubmit.textContent = 'Criar Conta';
      btnSubmit.disabled = false;
    }
  });
};

/* --- Modal Produto --- */
const abrirModalProduto = (produto) => {
  const conteudo = document.getElementById('modal-produto-conteudo');
  if (!conteudo) return;

  const specsHTML = Object.entries(produto.specs || {}).map(([k, v]) => `
    <div class="mprod__spec">
      <span class="mprod__spec-key">${k}</span>
      <span class="mprod__spec-val">${v}</span>
    </div>
  `).join('');

  const msgWA = encodeURIComponent(
    `Olá! Vi o produto "${produto.titulo}" no site e gostaria de mais informações.`
  );

  conteudo.innerHTML = `
    <div class="mprod__layout">
      <div class="mprod__galeria">
        <img
          src="${produto.img}"
          alt="${produto.titulo}"
          width="800"
          height="600"
        />
      </div>
      <div class="mprod__info">
        <p class="mprod__cat">${produto.catNome}</p>
        <h2 class="mprod__titulo" id="modal-produto-titulo">${produto.titulo}</h2>
        <div class="mprod__precos">
          <div class="mprod__avista">${formatarPreco(produto.preco)}</div>
          <div class="mprod__parcelado">ou 10× de ${calcularParcela(produto.preco)} sem juros</div>
        </div>
        <div class="mprod__divider"></div>
        <p style="font-size:.9rem;color:var(--texto-secundario);line-height:1.7;margin-bottom:16px">${produto.descricao}</p>
        <div class="mprod__divider"></div>
        <p class="mprod__specs-titulo">Especificações Técnicas</p>
        <div class="mprod__specs">${specsHTML}</div>
        <div class="mprod__acoes">
          <button
            class="btn btn--primario"
            id="mprod-btn-carrinho"
            data-id="${produto.id}"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            Adicionar ao Carrinho
          </button>
          <a
            href="https://wa.me/${CONFIG.WHATSAPP_VENDAS}?text=${msgWA}"
            class="btn btn--outline-dark"
            target="_blank"
            rel="noopener"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/></svg>
            Tire Suas Dúvidas no WhatsApp
          </a>
          <a
            href="https://wa.me/${CONFIG.WHATSAPP_VENDAS}?text=${encodeURIComponent(`Olá! Gostaria de solicitar um produto personalizado baseado em: ${produto.titulo}`)}"
            class="btn btn--ghost"
            target="_blank"
            rel="noopener"
          >
            ✏️ Solicitar Produto Personalizado
          </a>
        </div>
      </div>
    </div>
  `;

  // Botão adicionar ao carrinho
  document.getElementById('mprod-btn-carrinho')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    btn.textContent = 'Adicionando...';
    btn.disabled = true;

    try {
      await adicionarAoCarrinho(produto);
      btn.textContent = '✔ Adicionado!';
      setTimeout(() => {
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> Adicionar ao Carrinho`;
        btn.disabled = false;
      }, 2000);
    } catch {
      btn.textContent = 'Erro — tente novamente';
      btn.disabled = false;
    }
  });

  abrirModal('modal-produto');
};

// Fechar modal-produto ao clicar no overlay
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('modal-produto')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) fecharModal('modal-produto');
  });
});

/* ================================================
   11. FAVORITOS & CARRINHO (funções de state)
   ================================================ */
const toggleFavorito = async (produtoId, btnEl) => {
  const jaFav = State.favoritos.includes(produtoId);
  const acao = jaFav ? 'remover' : 'adicionar';

  // Otimismo: atualizar UI antes da resposta
  if (jaFav) {
    State.favoritos = State.favoritos.filter(id => id !== produtoId);
  } else {
    State.favoritos.push(produtoId);
  }

  atualizarBadge('badge-favoritos', State.favoritos.length);
  btnEl?.classList.toggle('ativo', !jaFav);
  btnEl?.setAttribute('aria-pressed', String(!jaFav));
  const svg = btnEl?.querySelector('svg');
  if (svg) svg.setAttribute('fill', !jaFav ? 'currentColor' : 'none');

  mostrarToast(
    jaFav ? 'Removido dos favoritos.' : '❤️ Adicionado aos favoritos!',
    jaFav ? 'info' : 'sucesso'
  );

  try {
    await API.toggleFavorito(produtoId, acao);
  } catch {
    // Reverter em caso de erro
    if (jaFav) {
      State.favoritos.push(produtoId);
    } else {
      State.favoritos = State.favoritos.filter(id => id !== produtoId);
    }
    atualizarBadge('badge-favoritos', State.favoritos.length);
    mostrarToast('Erro ao atualizar favoritos.', 'erro');
  }
};

const adicionarAoCarrinho = async (produto) => {
  await API.adicionarAoCarrinho(produto.id, 1);

  const existente = State.carrinho.find(i => i.produto.id === produto.id);
  if (existente) {
    existente.quantidade++;
  } else {
    State.carrinho.push({ produto, quantidade: 1 });
  }

  const total = State.carrinho.reduce((s, i) => s + i.quantidade, 0);
  atualizarBadge('badge-carrinho', total);
  mostrarToast(`🛒 "${produto.titulo}" adicionado ao carrinho!`, 'sucesso');
};

/* ================================================
   12. FILTROS
   ================================================ */
const atualizarFiltros = () => {
  const filtroCat = document.getElementById('filtro-categoria');
  if (filtroCat && State.categoriaSelecionada !== 'todos') {
    filtroCat.value = State.categoriaSelecionada;
  }
};

const initFiltros = () => {
  /* ── PONTO 4: Listener do botão "Limpar filtros" (bug corrigido) ──
     O botão #filtro-limpar não tinha addEventListener.
     Aqui conectamos diretamente à função window.limparFiltros. */
  document.getElementById('filtro-limpar')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.limparFiltros();
  });

  // Botão "Ver Todos" — exibe filtros e todos os produtos
  document.getElementById('btn-ver-todos')?.addEventListener('click', () => {
    State.mostrandoTodos = true;

    const filtros = document.getElementById('filtros');
    if (filtros) filtros.hidden = false;

    const tituloVitrine = document.getElementById('vitrine-titulo');
    if (tituloVitrine) tituloVitrine.textContent = 'Catálogo Completo';

    renderizarVitrine();
    document.getElementById('btn-ver-todos').style.display = 'none';
  });

  // Filtro categoria (select)
  document.getElementById('filtro-categoria')?.addEventListener('change', (e) => {
    State.categoriaSelecionada = e.target.value;

    // Sincronizar cards de categoria
    document.querySelectorAll('.cat-card').forEach(c => {
      const ativo = c.dataset.cat === e.target.value;
      c.classList.toggle('ativa', ativo);
      c.setAttribute('aria-pressed', String(ativo));
    });

    renderizarVitrine();
  });

  // Filtro densidade (select) — NOVO
  document.getElementById('filtro-densidade')?.addEventListener('change', (e) => {
    State.filtroDensidade = e.target.value;
    renderizarVitrine();
  });

  // Filtro ordenação (select) — NOVO
  document.getElementById('filtro-ordenacao')?.addEventListener('change', (e) => {
    State.filtroOrdenacao = e.target.value;
    renderizarVitrine();
  });

  // Filtro preço (range)
  const rangePreco = document.getElementById('filtro-preco');
  const labelPreco = document.getElementById('filtro-preco-valor');

  rangePreco?.addEventListener('input', (e) => {
    State.filtroPrecoMax = Number(e.target.value);
    if (labelPreco) labelPreco.textContent = formatarPreco(State.filtroPrecoMax);
  });

  rangePreco?.addEventListener('change', () => renderizarVitrine());

  // Links do footer que filtram por categoria
  document.querySelectorAll('.footer__link[data-cat]').forEach(link => {
    link.addEventListener('click', (e) => {
      const cat = link.dataset.cat;
      if (!cat) return;
      State.categoriaSelecionada = cat;
      State.mostrandoTodos = true;

      const filtros = document.getElementById('filtros');
      if (filtros) filtros.hidden = false;

      const filtroCat = document.getElementById('filtro-categoria');
      if (filtroCat) filtroCat.value = cat;

      renderizarVitrine();
      setTimeout(() => {
        document.getElementById('vitrine')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    });
  });
};

// Exposto globalmente para uso no HTML inline (limpar filtros)
/**
 * limparFiltros — reseta TODOS os filtros (State + DOM) e re-renderiza
 * a vitrine imediatamente, sem precisar recarregar a página.
 * Exposta globalmente para uso em onclick inline e no listener do botão.
 */
window.limparFiltros = () => {
  /* 1. Resetar o State global */
  State.categoriaSelecionada = 'todos';
  State.filtroPrecoMax       = 5000;
  State.filtroDensidade      = 'todas';
  State.filtroOrdenacao      = 'padrao';
  State.mostrandoTodos       = false; // voltar ao modo "destaques"

  /* 2. Resetar visualmente todos os campos do DOM */
  const filtroCat       = document.getElementById('filtro-categoria');
  const filtroPreco     = document.getElementById('filtro-preco');
  const labelPreco      = document.getElementById('filtro-preco-valor');
  const filtroDens      = document.getElementById('filtro-densidade');
  const filtroOrdenacao = document.getElementById('filtro-ordenacao');
  const tituloVitrine   = document.getElementById('vitrine-titulo');
  const btnVerTodos     = document.getElementById('btn-ver-todos');

  if (filtroCat)       { filtroCat.value       = 'todos';  }
  if (filtroPreco)     { filtroPreco.value      = '5000';  }
  if (labelPreco)      { labelPreco.textContent = 'R$ 5.000'; }
  if (filtroDens)      { filtroDens.value       = 'todas'; }
  if (filtroOrdenacao) { filtroOrdenacao.value  = 'padrao'; }

  /* 3. Restaurar título da vitrine */
  if (tituloVitrine) tituloVitrine.textContent = 'Produtos em Destaque';

  /* 4. Mostrar botão "Ver Todos" novamente */
  if (btnVerTodos) btnVerTodos.style.display = '';

  /* 5. Limpar seleção visual dos cards de categoria */
  document.querySelectorAll('.cat-card').forEach(c => {
    c.classList.remove('ativa');
    c.setAttribute('aria-pressed', 'false');
  });

  /* 6. Fechar painel de filtros (opcional: só fecha se estiver "expandido") */
  const filtrosPanel = document.getElementById('filtros');
  if (filtrosPanel) filtrosPanel.hidden = true;

  /* 7. Re-renderizar vitrine imediatamente */
  renderizarVitrine();
  mostrarToast('Filtros removidos. Exibindo destaques.', 'info');
};

/* ================================================
   12. ANIMAÇÕES — IntersectionObserver
   ================================================ */
let observer;

const observarReveal = () => {
  const elementos = document.querySelectorAll('.reveal:not(.visivel)');
  if (!elementos.length) return;

  if (!observer) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visivel');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
  }

  elementos.forEach(el => observer.observe(el));
};

/* ================================================
   13. FOOTER — ano dinâmico
   ================================================ */
const initFooter = () => {
  const el = document.getElementById('ano-footer');
  if (el) el.textContent = new Date().getFullYear();
};

/* ================================================
   14. INIT — ponto de entrada
   ================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Atualizar badges zerados ao iniciar
  atualizarBadge('badge-carrinho', 0);
  atualizarBadge('badge-favoritos', 0);

  initHeader();
  initCategorias();
  renderizarVitrine();
  initDepoimentos();
  initModalLogin();
  initFiltros();
  initFooter();
  observarReveal();

  // Scroll-reveal global (para elementos que não são da vitrine)
  setTimeout(observarReveal, 500);

  console.log(
    '%c🛏️ Santa Rita - Casa dos Colchões%c\nFront-end carregado com sucesso!\nWhatsApp Vendas: (99) 99701-7188',
    'font-weight:bold;font-size:14px;color:#D92525;',
    'color:#1E4D8C;'
  );
});

/* ================================================
   MÓDULOS ADICIONAIS — Appended ao script.js
   ================================================
   15. AUTH MODULE   — localStorage como DB mock
   16. DASHBOARD MODULE — CRUD de produtos
   17. initHeaderAuth — estado de login no header
   18. initHeaderNav  — hamburger para novas páginas
   19. DRAWER CARRINHO & FAVORITOS
   20. Atualização do index.html: badge e drawer
   ================================================ */

/* ================================================
   15. AUTH MODULE
   ================================================ */
const Auth = (() => {
  const CHAVE_USUARIOS  = 'sr_usuarios';
  const CHAVE_SESSAO    = 'sr_sessao';

  // Usuários padrão (demo/seed)
  const USUARIOS_PADRAO = [
    { id: 1, nome: 'Maria Rita (Dona)', email: 'dono@santarita.com',  senha: 'senha123', role: 'Dono',        telefone: '(99) 99701-7188', criadoEm: '2024-01-01' },
    { id: 2, nome: 'João Funcionário',  email: 'func@santarita.com',  senha: 'senha123', role: 'Funcionário', telefone: '(99) 99860-8375', criadoEm: '2024-02-01' },
    { id: 3, nome: 'Ana Cliente',       email: 'cliente@email.com',   senha: 'senha123', role: 'Cliente',     telefone: '(99) 98765-4321', criadoEm: '2024-03-01' },
  ];

  const _getUsuarios = () => {
    try {
      const armazenado = localStorage.getItem(CHAVE_USUARIOS);
      if (!armazenado) {
        localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(USUARIOS_PADRAO));
        return USUARIOS_PADRAO;
      }
      return JSON.parse(armazenado);
    } catch { return USUARIOS_PADRAO; }
  };

  const _salvarUsuarios = (lista) => {
    try { localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(lista)); } catch {}
  };

  return {
    getUsuarios: _getUsuarios,

    getUsuarioLogado() {
      try { return JSON.parse(localStorage.getItem(CHAVE_SESSAO)); } catch { return null; }
    },

    async login(email, senha) {
      // Simula latência de rede
      await new Promise(r => setTimeout(r, 500));
      const usuarios = _getUsuarios();
      const usuario  = usuarios.find(u => u.email === email && u.senha === senha);
      if (!usuario) throw new Error('E-mail ou senha inválidos.');
      const sessao = { id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role };
      localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
      return sessao;
    },

    async cadastro(dados) {
      await new Promise(r => setTimeout(r, 600));
      const usuarios = _getUsuarios();
      if (usuarios.find(u => u.email === dados.email)) {
        throw new Error('Este e-mail já está cadastrado.');
      }
      const novoUsuario = {
        id:        Date.now(),
        nome:      dados.nome,
        email:     dados.email,
        senha:     dados.senha,
        role:      dados.role || 'Cliente',
        telefone:  dados.telefone || '',
        criadoEm: new Date().toISOString(),
      };
      usuarios.push(novoUsuario);
      _salvarUsuarios(usuarios);
      const sessao = { id: novoUsuario.id, nome: novoUsuario.nome, email: novoUsuario.email, role: novoUsuario.role };
      localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
      return sessao;
    },

    logout() {
      localStorage.removeItem(CHAVE_SESSAO);
      window.location.href = 'index.html';
    },
  };
})();

/* ================================================
   16. DASHBOARD MODULE — CRUD de Produtos
   ================================================ */
const Dashboard = (() => {

  // =========================
  // BUSCAR PRODUTOS
  // =========================
  const _getProdutos = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('produtos')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error('Erro ao buscar produtos:', error);
        return [];
      }

      return data || [];

    } catch (erro) {
      console.error('Erro ao conectar com Supabase:', erro);
      return [];
    }
  };


  // =========================
  // ADICIONAR PRODUTO
  // =========================
  const _adicionarProduto = async (dados) => {
    try {

      const novoProduto = {
        titulo: dados.titulo,
        categoria: dados.categoria || null,
        preco: Number(dados.preco) || 0,
        destaque: Boolean(dados.destaque),
        tag: dados.tag || null,
        densidade: dados.densidade || null,
        imagem: dados.imagem || null,
        descricao: dados.descricao || null,
        especificacoes: dados.especificacoes || null,
        estoque: Number(dados.estoque) || 0
      };

      const { data, error } = await supabaseClient
        .from('produtos')
        .insert([novoProduto])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar produto:', error);
        return null;
      }

      console.log('Produto cadastrado:', data);

      return data;

    } catch (erro) {
      console.error('Erro ao adicionar produto:', erro);
      return null;
    }
  };


  // =========================
  // EDITAR PRODUTO
  // =========================
  const _editarProduto = async (id, dados) => {
    try {

      const produtoAtualizado = {
        titulo: dados.titulo,
        categoria: dados.categoria || null,
        preco: Number(dados.preco) || 0,
        destaque: Boolean(dados.destaque),
        tag: dados.tag || null,
        densidade: dados.densidade || null,
        imagem: dados.imagem || null,
        descricao: dados.descricao || null,
        especificacoes: dados.especificacoes || null,
        estoque: Number(dados.estoque) || 0
      };

      const { data, error } = await supabaseClient
        .from('produtos')
        .update(produtoAtualizado)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao editar produto:', error);
        return null;
      }

      console.log('Produto atualizado:', data);

      return data;

    } catch (erro) {
      console.error('Erro ao editar produto:', erro);
      return null;
    }
  };


  // =========================
  // REMOVER PRODUTO
  // =========================
  const _removerProduto = async (id) => {
    try {

      const { error } = await supabaseClient
        .from('produtos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao remover produto:', error);
        return false;
      }

      console.log('Produto removido:', id);

      return true;

    } catch (erro) {
      console.error('Erro ao remover produto:', erro);
      return false;
    }
  };


  // =========================
  // FUNÇÕES PÚBLICAS
  // =========================
  return {
    getProdutos: _getProdutos,
    adicionarProduto: _adicionarProduto,
    editarProduto: _editarProduto,
    removerProduto: _removerProduto
  };

})();

/* Converte uma linha da tabela "produtos" do Supabase para o formato que o site usa
   (img, catNome, specs...). Sem isso, as fotos e dados não aparecem nas telas do site. */
const mapearProdutoSupabase = (p) => {
  const galeria = Array.isArray(p.imagens) ? p.imagens.filter(Boolean) : [];
  const principal = p.imagem || galeria[0] || '';
  return {
    id: p.id,
    titulo: p.titulo,
    categoria: p.categoria,
    catNome:
      (typeof CATEGORIAS_DATA !== 'undefined' && CATEGORIAS_DATA.find(c => c.id === p.categoria)?.nome)
      || p.categoria
      || 'Produto',
    preco: Number(p.preco) || 0,
    destaque: Boolean(p.destaque),
    tag: p.tag || null,
    densidade: p.densidade || null,
    img: principal,
    imagens: [...new Set([principal, ...galeria].filter(Boolean))],
    descricao: p.descricao || '',
    specs: {
      ...(p.especificacoes ? { Tecnologia: p.especificacoes } : {}),
      ...(p.densidade ? { Densidade: p.densidade } : {})
    },
    estoque: Number(p.estoque) || 0
  };
};

/* ================================================
   17. HEADER AUTH — exibir estado de login
   Chamado em todas as páginas
   ================================================ */
const initHeaderAuth = () => {
  const usuario   = Auth.getUsuarioLogado();
  const areaUser  = document.getElementById('header-user-area');
  const btnLogin  = document.getElementById('btn-login');
  const dashItem  = document.getElementById('nav-dashboard-item');

  if (usuario) {
    // Mostrar link Dashboard para admin
    if (dashItem && (usuario.role === 'Dono' || usuario.role === 'Funcionário')) {
      dashItem.style.display = '';
    }

    // Substituir botão de login pelo perfil
    if (areaUser) {
      areaUser.innerHTML = `
        <div class="header-user" role="group" aria-label="Conta do usuário">
          <div class="header-user__avatar" aria-hidden="true">${usuario.nome.charAt(0).toUpperCase()}</div>
          <div class="header-user__nome">
            <strong title="${usuario.nome}">${usuario.nome.split(' ')[0]}</strong>
            <small>${usuario.role}</small>
          </div>
          <button class="btn--logout" id="btn-logout" aria-label="Sair da conta">Sair</button>
        </div>
      `;
      document.getElementById('btn-logout')?.addEventListener('click', () => Auth.logout());
    }

    // Ocultar botão antigo de login (se existir)
    if (btnLogin) btnLogin.style.display = 'none';

  } else {
    // Sem sessão — mostrar botão de login
    if (areaUser) {
      areaUser.innerHTML = `
        <a href="login.html" class="action-btn" aria-label="Entrar ou criar conta">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </a>
      `;
    }
    if (btnLogin) {
      btnLogin.addEventListener('click', () => { window.location.href = 'login.html'; });
    }
  }

  // Inicializar badges com valores do localStorage
  const carrinho   = JSON.parse(localStorage.getItem('sr_carrinho')   || '[]');
  const favoritos  = JSON.parse(localStorage.getItem('sr_favoritos')  || '[]');
  atualizarBadge('badge-carrinho',  carrinho.reduce((s, i) => s + i.quantidade, 0));
  atualizarBadge('badge-favoritos', favoritos.length);
};

/* ================================================
   18. NAV — hamburger para páginas sem initHeader()
   ================================================ */
const initHeaderNav = () => {
  const hamburger = document.getElementById('hamburger');
  const nav       = document.getElementById('main-nav');
  if (!hamburger || !nav) return;

  hamburger.addEventListener('click', () => {
    const aberto = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!aberto));
    hamburger.classList.toggle('ativo', !aberto);
    nav.classList.toggle('aberto', !aberto);
  });

  nav.addEventListener('click', (e) => {
    if (e.target === nav) {
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.classList.remove('ativo');
      nav.classList.remove('aberto');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.classList.remove('ativo');
      nav.classList.remove('aberto');
    }
  });

  // Header scroll sombra
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header?.classList.toggle('header--scrolled', window.scrollY > 40);
  }, { passive: true });
};

/* ================================================
   19. DRAWER — Carrinho e Favoritos com localStorage
   ================================================ */
const Carrinho = (() => {
  const CHAVE = 'sr_carrinho';

  const _ler   = () => { try { return JSON.parse(localStorage.getItem(CHAVE) || '[]'); } catch { return []; } };
  const _salvar = (lista) => { try { localStorage.setItem(CHAVE, JSON.stringify(lista)); } catch {} };

  return {
    getItens:  _ler,

    adicionar(produto, quantidade = 1) {
      const lista = _ler();
      const idx   = lista.findIndex(i => i.produto.id === produto.id);
      if (idx > -1) { lista[idx].quantidade += quantidade; }
      else          { lista.push({ produto, quantidade }); }
      _salvar(lista);
      // Salvar no state também
      State.carrinho = lista;
      const total = lista.reduce((s, i) => s + i.quantidade, 0);
      atualizarBadge('badge-carrinho', total);
      // Salvar no localStorage de favoritos de popularidade
      const favsPop = JSON.parse(localStorage.getItem('sr_favoritos_pop') || '{}');
      favsPop[produto.id] = (favsPop[produto.id] || 0) + 1;
      try { localStorage.setItem('sr_favoritos_pop', JSON.stringify(favsPop)); } catch {}
    },

    alterar(produtoId, quantidade) {
      const lista = _ler();
      const idx   = lista.findIndex(i => i.produto.id === produtoId);
      if (idx === -1) return;
      if (quantidade <= 0) { lista.splice(idx, 1); }
      else { lista[idx].quantidade = quantidade; }
      _salvar(lista);
      State.carrinho = lista;
      const total = lista.reduce((s, i) => s + i.quantidade, 0);
      atualizarBadge('badge-carrinho', total);
    },

    remover(produtoId) { this.alterar(produtoId, 0); },

    total() {
      return _ler().reduce((s, i) => s + i.produto.preco * i.quantidade, 0);
    },
  };
})();

const Favoritos = (() => {
  const CHAVE = 'sr_favoritos';

  const _ler   = () => { try { return JSON.parse(localStorage.getItem(CHAVE) || '[]'); } catch { return []; } };
  const _salvar = (lista) => { try { localStorage.setItem(CHAVE, JSON.stringify(lista)); } catch {} };

  return {
    getIds: _ler,

    toggle(produtoId) {
      const lista = _ler();
      const idx   = lista.indexOf(produtoId);
      if (idx > -1) { lista.splice(idx, 1); }
      else          { lista.push(produtoId); }
      _salvar(lista);
      State.favoritos = lista;
      atualizarBadge('badge-favoritos', lista.length);
      return idx === -1; // true = adicionou, false = removeu
    },

    temId: (id) => _ler().includes(id),
  };
})();

/* ===== Drawer — renderização ===== */
const criarDrawerHTML = () => {
  if (document.getElementById('drawer-overlay')) return;

  const html = `
    <div class="drawer-overlay" id="drawer-overlay">
      <aside class="drawer" id="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-titulo">
        <div class="drawer__header">
          <h2 class="drawer__titulo" id="drawer-titulo">Carrinho</h2>
          <button class="modal__fechar" id="drawer-fechar" aria-label="Fechar painel" style="position:static">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="drawer__body" id="drawer-body"></div>
        <div class="drawer__footer" id="drawer-footer" hidden></div>
      </aside>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);

  document.getElementById('drawer-fechar')?.addEventListener('click', fecharDrawer);
  document.getElementById('drawer-overlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) fecharDrawer();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharDrawer();
  });
};

const abrirDrawer = (modo = 'carrinho') => {
  criarDrawerHTML();
  const overlay = document.getElementById('drawer-overlay');
  const titulo  = document.getElementById('drawer-titulo');
  const body    = document.getElementById('drawer-body');
  const footer  = document.getElementById('drawer-footer');

  document.body.style.overflow = 'hidden';

  if (modo === 'carrinho') {
    titulo.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> Carrinho`;
    renderDrawerCarrinho(body, footer);
  } else {
    titulo.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> Favoritos`;
    footer.hidden = true;
    renderDrawerFavoritos(body);
  }

  overlay.classList.add('aberto');
  document.getElementById('drawer-fechar')?.focus();
};

const fecharDrawer = () => {
  const overlay = document.getElementById('drawer-overlay');
  overlay?.classList.remove('aberto');
  document.body.style.overflow = '';
};

const renderDrawerCarrinho = (body, footer) => {
  const itens = Carrinho.getItens();

  if (!itens.length) {
    body.innerHTML = `
      <div class="drawer-vazio">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        <p>Seu carrinho está vazio.</p>
        <a href="index.html#vitrine" class="btn btn--primario btn--sm" onclick="fecharDrawer()">Ver produtos</a>
      </div>`;
    footer.hidden = true;
    return;
  }

  body.innerHTML = itens.map(item => `
    <div class="drawer-item" data-id="${item.produto.id}">
      <img class="drawer-item__img" src="${item.produto.img}" alt="${item.produto.titulo}" width="72" height="72" loading="lazy" />
      <div class="drawer-item__corpo">
        <div class="drawer-item__cat">${item.produto.catNome || ''}</div>
        <div class="drawer-item__nome">${item.produto.titulo}</div>
        <div class="drawer-item__preco">${formatarPreco(item.produto.preco)}</div>
        <div class="drawer-item__parcela">10× de ${calcularParcela(item.produto.preco)} sem juros</div>
        <div class="drawer-item__qtd">
          <button class="qtd-btn" data-acao="minus" data-id="${item.produto.id}" aria-label="Diminuir quantidade">−</button>
          <span class="qtd-num" aria-live="polite">${item.quantidade}</span>
          <button class="qtd-btn" data-acao="plus"  data-id="${item.produto.id}" aria-label="Aumentar quantidade">+</button>
        </div>
      </div>
      <button class="drawer-item__remover" data-id="${item.produto.id}" aria-label="Remover ${item.produto.titulo}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
      </button>
    </div>
  `).join('');

  // Eventos de quantidade e remoção
  body.querySelectorAll('.qtd-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id  = Number(btn.dataset.id);
      const item = Carrinho.getItens().find(i => i.produto.id === id);
      if (!item) return;
      const nova = btn.dataset.acao === 'plus' ? item.quantidade + 1 : item.quantidade - 1;
      Carrinho.alterar(id, nova);
      renderDrawerCarrinho(body, footer);
    });
  });
  body.querySelectorAll('.drawer-item__remover').forEach(btn => {
    btn.addEventListener('click', () => {
      Carrinho.remover(Number(btn.dataset.id));
      renderDrawerCarrinho(body, footer);
      mostrarToast('Item removido do carrinho.', 'info');
    });
  });

  // Footer com total e botão
  const total = Carrinho.total();
  footer.hidden = false;
  footer.innerHTML = `
    <div class="drawer__total">
      <span class="drawer__total-label">Total</span>
      <span class="drawer__total-valor">${formatarPreco(total)}</span>
    </div>
    <a
      href="https://wa.me/5599701-7188?text=${encodeURIComponent(`Olá! Gostaria de finalizar meu pedido:\n${Carrinho.getItens().map(i=>`• ${i.produto.titulo} (${i.quantidade}×) — ${formatarPreco(i.produto.preco)}`).join('\n')}\nTotal: ${formatarPreco(total)}`)}"
      class="btn btn--primario btn--full"
      target="_blank" rel="noopener"
      onclick="fecharDrawer()"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/></svg>
      Finalizar pelo WhatsApp
    </a>
  `;
};

const renderDrawerFavoritos = async (body) => {
  const ids      = Favoritos.getIds();
  const todos    = (await Dashboard.getProdutos()).map(mapearProdutoSupabase);
  const produtos = todos.filter(p => ids.includes(p.id));

  if (!produtos.length) {
    body.innerHTML = `
      <div class="drawer-vazio">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        <p>Você ainda não tem favoritos.</p>
        <a href="index.html#vitrine" class="btn btn--primario btn--sm" onclick="fecharDrawer()">Ver produtos</a>
      </div>`;
    return;
  }

  body.innerHTML = produtos.map(p => `
    <div class="drawer-item" data-id="${p.id}">
      <img class="drawer-item__img" src="${p.img}" alt="${p.titulo}" width="72" height="72" loading="lazy" />
      <div class="drawer-item__corpo">
        <div class="drawer-item__cat">${p.catNome || ''}</div>
        <div class="drawer-item__nome">${p.titulo}</div>
        <div class="drawer-item__preco">${formatarPreco(p.preco)}</div>
        <div class="drawer-item__parcela">10× de ${calcularParcela(p.preco)} sem juros</div>
        <button class="btn btn--primario btn--sm" style="margin-top:10px" data-add="${p.id}" aria-label="Adicionar ${p.titulo} ao carrinho">
          Adicionar ao Carrinho
        </button>
      </div>
      <button class="drawer-item__remover" data-rem-fav="${p.id}" aria-label="Remover ${p.titulo} dos favoritos">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
      </button>
    </div>
  `).join('');

  body.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = produtos.find(x => x.id == btn.dataset.add);
      if (!p) return;
      Carrinho.adicionar(p);
      mostrarToast(`🛒 "${p.titulo}" adicionado ao carrinho!`, 'sucesso');
    });
  });

  body.querySelectorAll('[data-rem-fav]').forEach(btn => {
    btn.addEventListener('click', () => {
      Favoritos.toggle(Number(btn.dataset.remFav));
      renderDrawerFavoritos(body);
    });
  });
};

/* ================================================
   20. PATCH no index.html — reescrever adicionarAoCarrinho
       e toggleFavorito para usar localStorage real
   ================================================ */

// Sobrescreve a função adicionarAoCarrinho do escopo original
const _adicionarAoCarrinho_real = async (produto) => {
  await API.adicionarAoCarrinho(produto.id, 1);
  Carrinho.adicionar(produto);
  mostrarToast(`🛒 "${produto.titulo}" adicionado!`, 'sucesso');
};

// Sobrescreve toggleFavorito original para usar localStorage real
const _toggleFavorito_real = async (produtoId, btnEl) => {
  const adicionou = Favoritos.toggle(produtoId);

  btnEl?.classList.toggle('ativo', adicionou);
  btnEl?.setAttribute('aria-pressed', String(adicionou));
  const svg = btnEl?.querySelector('svg');
  if (svg) svg.setAttribute('fill', adicionou ? 'currentColor' : 'none');

  mostrarToast(
    adicionou ? '❤️ Adicionado aos favoritos!' : 'Removido dos favoritos.',
    adicionou ? 'sucesso' : 'info'
  );

  try { await API.toggleFavorito(produtoId, adicionou ? 'adicionar' : 'remover'); } catch {}
};

/* ================================================
   PATCH no DOMContentLoaded — estender o init
   ================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Só rodar nas páginas que têm esses elementos
  const paginaIndex = !!document.getElementById('vitrine-grid');
  if (!paginaIndex) return;

  // Reescrever funções no escopo (monkey-patch via closure trick)
  // As funções são chamadas pelo nome no renderizarVitrine e no modal
  // Redeclaramos no escopo global para sobrescrever
  window._adicionarAoCarrinhoFn = _adicionarAoCarrinho_real;
  window._toggleFavoritoFn      = _toggleFavorito_real;

  // Atualizar badges do localStorage ao carregar
  const itens    = Carrinho.getItens();
  const favIds   = Favoritos.getIds();
  atualizarBadge('badge-carrinho',  itens.reduce((s,i)=>s+i.quantidade,0));
  atualizarBadge('badge-favoritos', favIds.length);

  // Inicializar header com auth
  initHeaderAuth();

  // Abrir drawer ao clicar no carrinho
  document.getElementById('btn-carrinho')?.addEventListener('click', (e) => {
    e.stopImmediatePropagation();
    abrirDrawer('carrinho');
  });

  // Abrir drawer ao clicar em favoritos
  document.getElementById('btn-favoritos')?.addEventListener('click', (e) => {
    e.stopImmediatePropagation();
    abrirDrawer('favoritos');
  });

  // Usar produto do localStorage (persistido)
  // Sobrescrever a API.carregarProdutos para usar localStorage quando disponível
  const _carregarOriginal = API.carregarProdutos.bind(API);
  API.carregarProdutos = async (filtros = {}) => {
    const lista = (await Dashboard.getProdutos()).map(mapearProdutoSupabase);
    let resultado = [...lista];
    if (filtros.categoria && filtros.categoria !== 'todos') {
      resultado = resultado.filter(p => p.categoria === filtros.categoria);
    }
    if (filtros.precoMax) {
      resultado = resultado.filter(p => p.preco <= filtros.precoMax);
    }
    if (filtros.densidade && filtros.densidade !== 'todas') {
      if (filtros.densidade === 'molas') {
        resultado = resultado.filter(p => p.densidade === 'molas' || (p.specs && Object.values(p.specs).some(v => String(v).toLowerCase().includes('pocket'))));
      } else {
        resultado = resultado.filter(p => p.densidade === filtros.densidade);
      }
    }
    if (filtros.ordenacao === 'menor') resultado = resultado.sort((a, b) => a.preco - b.preco);
    else if (filtros.ordenacao === 'maior') resultado = resultado.sort((a, b) => b.preco - a.preco);
    return resultado;
  };
});

// Tornar fecharDrawer global (usada em onclick inline)
window.fecharDrawer = fecharDrawer;
/* =====================================================
   MELHORIAS v2 — Santa Rita Casa dos Colchões
   =====================================================
   A. Stats Strip    — sem JS necessário (só CSS)
   B. Categorias     — slider reescrito com setas + imagens de fundo
   C. Banner Promo   — carrossel full-width com autoplay, dots, touch
   D. Favoritos/Carrinho — já implementado via Drawer, garantindo
                           que o toggleFavorito e adicionarAoCarrinho
                           sempre gravem no localStorage
   ===================================================== */

/* ===================================================
   B. IMAGENS DAS CATEGORIAS (usadas por initCategorias)
   =================================================== */
const CATEGORIAS_IMAGES = {
  colchao:     'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=70',
  cama:        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&q=70',
  sofa:        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=70',
  cabeceira:   'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=70',
  puff:        'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&q=70',
  travesseiro: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&q=70',
  almofada:    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=70',
  poltrona:    'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&q=70',
};


/* ===================================================
   C. CARROSSEL DE BANNERS PROMOCIONAIS
   =================================================== */
const initBannerPromo = () => {
  const track   = document.getElementById('banner-promo-track');
  const dotsWrap = document.getElementById('banner-dots');
  const btnPrev = document.getElementById('banner-prev');
  const btnNext = document.getElementById('banner-next');
  if (!track) return;

  const slides = track.querySelectorAll('.banner-slide');
  const total  = slides.length;
  if (total === 0) return;

  let atual   = 0;
  let autoplay;

  /* — Criar dots — */
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = `banner-promo__dot${i === 0 ? ' ativo' : ''}`;
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Banner ${i + 1}`);
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    dot.addEventListener('click', () => irParaBanner(i));
    dotsWrap?.appendChild(dot);
  });

  /* — Ir para um slide específico — */
  const irParaBanner = (idx) => {
    atual = (idx + total) % total;

    /* Mover o track (transição suave via CSS transition: transform 0.55s) */
    track.style.transform = `translateX(-${atual * 100}%)`;

    /* Atualizar classe .ativo nos slides para acionar:
       - opacity fade (slide ativo = 1, inativos = 0.55)
       - animações de entrada dos textos (tag, título, subtítulo, CTA) */
    slides.forEach((s, i) => {
      const eAtivo = i === atual;
      s.classList.toggle('ativo', eAtivo);
      s.setAttribute('aria-hidden', eAtivo ? 'false' : 'true');
    });

    /* Atualizar dots */
    dotsWrap?.querySelectorAll('.banner-promo__dot').forEach((d, i) => {
      const eAtivo = i === atual;
      d.classList.toggle('ativo', eAtivo);
      d.setAttribute('aria-selected', String(eAtivo));
    });
  };

  /* — Setas — */
  btnPrev?.addEventListener('click', () => {
    pararAutoplay();
    irParaBanner(atual - 1);
    reiniciarAutoplay();
  });
  btnNext?.addEventListener('click', () => {
    pararAutoplay();
    irParaBanner(atual + 1);
    reiniciarAutoplay();
  });

  /* — Autoplay — */
  const iniciarAutoplay = () => {
    autoplay = setInterval(() => irParaBanner(atual + 1), 4500);
  };
  const pararAutoplay = () => clearInterval(autoplay);
  const reiniciarAutoplay = () => { pararAutoplay(); iniciarAutoplay(); };

  iniciarAutoplay();

  /* Pausar ao hover */
  const container = track.closest('.banner-promo');
  container?.addEventListener('mouseenter',  pararAutoplay);
  container?.addEventListener('mouseleave',  iniciarAutoplay);

  /* — Touch events para mobile — */
  let touchX = 0;
  track.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   (e) => {
    const diff = touchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      pararAutoplay();
      irParaBanner(diff > 0 ? atual + 1 : atual - 1);
      reiniciarAutoplay();
    }
  }, { passive: true });

  /* Inicializar estado — slide 0 ativo (também aplica .ativo nos slides) */
  irParaBanner(0);
};


/* ===================================================
   D. FAVORITOS & CARRINHO — garantir integração
      com localStorage em TODOS os pontos de chamada
   =================================================== */

/**
 * toggleFavorito_localStorage — versão que usa o módulo Favoritos
 * com persistência real no localStorage e renderiza no drawer.
 *
 * Sobrescreve a função original "toggleFavorito" do escopo
 * sem quebrar a lógica do initVitrine/renderizarVitrine.
 */
const toggleFavorito_v2 = (produtoId, btnEl) => {
  const adicionou = Favoritos.toggle(produtoId);

  /* Atualizar visual do botão no card */
  if (btnEl) {
    btnEl.classList.toggle('ativo', adicionou);
    btnEl.setAttribute('aria-pressed', String(adicionou));
    const svg = btnEl.querySelector('svg');
    if (svg) svg.setAttribute('fill', adicionou ? 'currentColor' : 'none');
    btnEl.setAttribute('aria-label',
      `${adicionou ? 'Remover dos' : 'Adicionar aos'} favoritos`
    );
  }

  mostrarToast(
    adicionou ? '❤️ Adicionado aos favoritos!' : 'Removido dos favoritos.',
    adicionou ? 'sucesso' : 'info'
  );

  /* Se o drawer de favoritos estiver aberto, re-renderiza */
  const drawerBody = document.getElementById('drawer-body');
  const drawerTitulo = document.getElementById('drawer-titulo');
  if (drawerBody && drawerTitulo && drawerTitulo.textContent.includes('Favoritos')) {
    renderDrawerFavoritos(drawerBody);
  }
};

/**
 * adicionarAoCarrinho_v2 — versão que usa o módulo Carrinho
 * com persistência real no localStorage.
 */
const adicionarAoCarrinho_v2 = (produto) => {
  Carrinho.adicionar(produto);
  mostrarToast(`🛒 "${produto.titulo}" adicionado ao carrinho!`, 'sucesso');

  /* Se o drawer de carrinho estiver aberto, re-renderiza */
  const drawerBody   = document.getElementById('drawer-body');
  const drawerFooter = document.getElementById('drawer-footer');
  const drawerTitulo = document.getElementById('drawer-titulo');
  if (drawerBody && drawerFooter && drawerTitulo && drawerTitulo.textContent.includes('Carrinho')) {
    renderDrawerCarrinho(drawerBody, drawerFooter);
  }
};


/* ===================================================
   PATCH DO DOMContentLoaded — substituir funções e inicializar módulos novos
   =================================================== */
document.addEventListener('DOMContentLoaded', () => {
  /* 1. initCategorias já cuida do grid na seção 7 (INIT) */

  /* 2. Inicializar carrossel de banners */
  initBannerPromo();

  /* 3. Patch de toggleFavorito e adicionarAoCarrinho para versões com localStorage */
  window.toggleFavorito      = toggleFavorito_v2;
  window.adicionarAoCarrinho = adicionarAoCarrinho_v2;

  /* 4. Sincronizar State com localStorage na inicialização */
  State.carrinho  = Carrinho.getItens();
  State.favoritos = Favoritos.getIds();

  /* 5. Atualizar badges com valores reais do localStorage */
  const qtdCarrinho  = State.carrinho.reduce((s, i) => s + i.quantidade, 0);
  const qtdFavoritos = State.favoritos.length;
  atualizarBadge('badge-carrinho',  qtdCarrinho);
  atualizarBadge('badge-favoritos', qtdFavoritos);

  /* 6. Inicializar header com auth */
  if (typeof initHeaderAuth === 'function') initHeaderAuth();

  /* 7. Garantir que os botões do header abrem o drawer */
  document.getElementById('btn-carrinho')?.addEventListener('click', (e) => {
    e.stopImmediatePropagation();
    abrirDrawer('carrinho');
  }, { once: false });

  document.getElementById('btn-favoritos')?.addEventListener('click', (e) => {
    e.stopImmediatePropagation();
    abrirDrawer('favoritos');
  }, { once: false });

  /* Garantir que renderizarVitrine leia favs do localStorage */
  State.favoritos = Favoritos.getIds();
});