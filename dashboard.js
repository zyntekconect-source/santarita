/* ============================================================
   DASHBOARD.JS — Santa Rita Admin
   Depende de: script.js (carregado antes no dashboard.html)
   Os objetos Auth, Dashboard, Carrinho, Favoritos vêm do script.js
   ============================================================ */

/* ── Formatar moeda ── */
const _fmt = (v) =>
  (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/* ── Toast ── */
function dbToast(msg, tipo = 'info') {
  const c = document.getElementById('toast-container');
  if (!c) return;
  const el = document.createElement('div');
  el.className = `toast toast--${tipo}`;
  el.setAttribute('role', 'alert');
  el.textContent = msg;
  c.appendChild(el);
  setTimeout(() => {
    el.style.cssText = 'opacity:0;transform:translateY(8px);transition:.3s ease';
    setTimeout(() => el.remove(), 350);
  }, 3200);
}

/* ── Aguardar script.js terminar de definir Auth/Dashboard ── */
function aguardarModulos(cb, tentativas = 0) {
  if (typeof Auth !== 'undefined' && typeof Dashboard !== 'undefined') {
    cb();
  } else if (tentativas < 30) {
    setTimeout(() => aguardarModulos(cb, tentativas + 1), 100);
  } else {
    console.error('[Dashboard] Módulos Auth/Dashboard não encontrados após 3s. Verifique a ordem dos scripts no dashboard.html.');
    document.getElementById('dash-saudacao') && (document.getElementById('dash-saudacao').textContent = 'Erro ao carregar módulos.');
  }
}

/* ============================================================
   PONTO DE ENTRADA
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  await iniciarDashboard();
});

/* Tela exibida quando a conta não é admin (mostra o motivo, em vez de só redirecionar) */
function dbMostrarAcessoNegado(email, erro) {
  const motivo = erro
    ? `Não foi possível verificar a permissão (${erro.message || erro.code || 'erro desconhecido'}). Confira se a tabela "admins" foi criada no Supabase (arquivo seguranca.sql).`
    : `A conta <strong>${email}</strong> não está cadastrada como administradora.`;

  const tela = document.createElement('div');
  tela.setAttribute('role', 'alert');
  tela.style.cssText = 'position:fixed;inset:0;z-index:5000;display:flex;align-items:center;justify-content:center;padding:24px;background:#f3f4f6;font-family:Inter,Arial,sans-serif;';
  tela.innerHTML = `
    <div style="max-width:440px;background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:32px;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,.08)">
      <h1 style="margin:0 0 10px;font-size:1.3rem;color:#111827">Acesso restrito</h1>
      <p style="margin:0 0 22px;color:#6b7280;line-height:1.6;font-size:.92rem">${motivo}</p>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        <a href="index.html" class="btn btn--ghost">Voltar ao site</a>
        <button type="button" class="btn btn--primario" id="acesso-negado-sair">Sair e entrar com outra conta</button>
      </div>
    </div>`;
  document.body.appendChild(tela);
  document.getElementById('acesso-negado-sair')?.addEventListener('click', sairDashboard);
}

async function iniciarDashboard() {

  // Verificar sessão do Supabase
  const {
    data: { session },
    error
  } = await supabaseClient.auth.getSession();

  if (error || !session) {
    console.log('Usuário não autenticado.');

    window.location.href = 'login.html';
    return;
  }

  const usuario = session.user;

  /* ── Só administradores entram (tabela "admins" no Supabase) ──
     Obs.: a trava de verdade são as regras (RLS) do banco; esta checagem
     evita que um cliente logado veja o painel. */
  const { data: ehAdmin, error: erroAdmin } = await supabaseClient
    .from('admins')
    .select('user_id')
    .eq('user_id', usuario.id)
    .maybeSingle();

  if (erroAdmin || !ehAdmin) {
    console.warn('Acesso negado ao dashboard.', erroAdmin || 'usuário não é administrador');
    dbMostrarAcessoNegado(usuario.email, erroAdmin);
    return;
  }

  document.body.classList.remove('dash-verificando');
  console.log('Admin autenticado:', usuario.email);

  /* ── Saudação ── */

  const hora = new Date().getHours();

  const periodo =
    hora < 12
      ? 'Bom dia'
      : hora < 18
        ? 'Boa tarde'
        : 'Boa noite';

  const dataFmt = new Date().toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

  const saudEl = document.getElementById('dash-saudacao');

  if (saudEl) {
    saudEl.textContent =
      `${periodo}, ${usuario.email} — ${dataFmt}`;
  }

  const avatarEl = document.getElementById('db-user-avatar');

  if (avatarEl) {
    avatarEl.textContent =
      usuario.email.charAt(0).toUpperCase();
  }

  /* ── Inicializar tudo ── */

  dbInitSidebar();
  await dbRenderGeral();
  await dbRenderTabelaProdutos();
  await dbRenderEstoque();
  await dbRenderMetricas();
  dbInitFormProduto();
  dbInitFiltrosProdutos();
  dbInitModalConfirmacao();
}



/* ============================================================
   SIDEBAR
   ============================================================ */
function dbInitSidebar() {
  const sidebar   = document.getElementById('db-sidebar');
  const hamburger = document.getElementById('db-hamburger');
  const toggleBtn = document.getElementById('db-sidebar-toggle');
  const overlay   = document.getElementById('db-overlay');
  const navItems  = document.querySelectorAll('.db-nav-item[data-section]');
  const pageName  = document.getElementById('db-page-name');

  const PAGE_NAMES = {
    'section-geral':        'Dashboard Geral',
    'section-produtos':     'Gerenciamento de Produtos',
    'section-novo-produto': 'Novo Produto',
    'section-estoque':      'Estoque',
    'section-metricas':     'Métricas',
  };

  const abrirSidebar = () => {
    sidebar?.classList.add('db-sidebar--aberta');
    overlay?.classList.add('db-overlay--ativo');
    hamburger?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };
  const fecharSidebar = () => {
    sidebar?.classList.remove('db-sidebar--aberta');
    overlay?.classList.remove('db-overlay--ativo');
    hamburger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  hamburger?.addEventListener('click', abrirSidebar);
  toggleBtn?.addEventListener('click', fecharSidebar);
  overlay?.addEventListener('click', fecharSidebar);

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetId = item.dataset.section;
      if (!targetId) return;

      navItems.forEach(i => {
        i.classList.remove('db-nav-item--ativo');
        i.removeAttribute('aria-current');
      });
      item.classList.add('db-nav-item--ativo');
      item.setAttribute('aria-current', 'page');

      document.querySelectorAll('.db-section').forEach(s => {
        s.classList.remove('db-section--ativa');
        s.hidden = true;
      });

      const target = document.getElementById(targetId);
      if (target) {
        target.hidden = false;
        target.classList.add('db-section--ativa');
      }

      if (pageName) pageName.textContent = PAGE_NAMES[targetId] || '';
      fecharSidebar();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  /* Botão "Novo Produto" dentro de Gerenciamento */
  document.getElementById('dash-btn-add-produto')?.addEventListener('click', () => {
    document.querySelector('.db-nav-item[data-section="section-novo-produto"]')?.click();
  });

  /* Logout */
  // Troca o botão por um clone para remover qualquer outro clique ligado a ele
  // (ex.: no script.js) que mande para o index, e assume o controle do logout.
  const btnSair = document.getElementById('btn-logout-sidebar');
  if (btnSair) {
    const novoBtn = btnSair.cloneNode(true);
    btnSair.replaceWith(novoBtn);
    novoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      sairDashboard();
    });
  }
}

/* ============================================================
   DASHBOARD GERAL — overview + gráfico (dados reais do Supabase)
   ============================================================ */
async function dbRenderGeral() {
  const produtos = await Dashboard.getProdutos();

  const total      = produtos.length;
  const destaque   = produtos.filter(p => p.destaque).length;
  const semEstoque = produtos.filter(p => !(Number(p.estoque) > 0)).length;
  const unidades   = produtos.reduce((s, p) => s + (Number(p.estoque) || 0), 0);
  const ticket     = total ? produtos.reduce((s, p) => s + (Number(p.preco) || 0), 0) / total : 0;

  const CARDS = [
    { cor: 'blue',   valor: total,    label: 'Total de Produtos',    detalhe: 'cadastrados no catálogo',
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>` },
    { cor: 'red',    valor: destaque, label: 'Em Destaque',          detalhe: 'aparecem na vitrine do site',
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>` },
    { cor: 'orange', valor: unidades, label: 'Unidades em Estoque',  detalhe: `${semEstoque} produto(s) sem estoque`,
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>` },
    { cor: 'green',  valor: _fmt(ticket), label: 'Preço Médio',      detalhe: 'média dos produtos cadastrados',
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>` },
  ];

  const grid = document.getElementById('db-overview-grid');
  if (grid) {
    grid.innerHTML = CARDS.map(c => `
      <div class="db-overview-card db-overview-card--${c.cor}">
        <div class="db-overview-card__icon">${c.icon}</div>
        <div class="db-overview-card__body">
          <div class="db-overview-card__valor">${c.valor}</div>
          <div class="db-overview-card__label">${c.label}</div>
          <div class="db-overview-card__detalhe">${c.detalhe}</div>
        </div>
      </div>`).join('');
  }

  /* Gráfico de barras por categoria */
  const CATS = Object.entries(CATS_NOMES).map(([id, nome]) => ({ id, nome }));
  const countByCat = {};
  CATS.forEach(c => { countByCat[c.id] = produtos.filter(p => p.categoria === c.id).length; });
  const maxCount = Math.max(...Object.values(countByCat), 1);

  const barsEl = document.getElementById('db-chart-bars');
  if (barsEl) {
    barsEl.innerHTML = CATS.map(c => {
      const count = countByCat[c.id];
      const pct   = Math.round((count / maxCount) * 100);
      return `
        <div class="db-chart-row">
          <span class="db-chart-label">${c.nome}</span>
          <div class="db-chart-bar-wrap" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
            <div class="db-chart-bar" style="width:${pct}%"></div>
          </div>
          <span class="db-chart-count">${count}</span>
        </div>`;
    }).join('');
  }
}

/* ============================================================
   GERENCIAMENTO DE PRODUTOS — tabela
   ============================================================ */
let _produtoParaRemover = null;
let _imagensParaRemover = [];

async function dbRenderTabelaProdutos(busca = '', cat = 'todos') {
  let lista = await Dashboard.getProdutos();
  if (busca) lista = lista.filter(p => p.titulo?.toLowerCase().includes(busca.toLowerCase()));
  if (cat !== 'todos') lista = lista.filter(p => p.categoria === cat);

  const tbody = document.getElementById('dash-tabela-body');
  const empty = document.getElementById('dash-tabela-empty');
  const count = document.getElementById('dash-table-count');
  if (!tbody) return;

  if (!lista.length) {
    tbody.innerHTML = '';
    if (empty) empty.hidden = false;
    if (count) count.textContent = '';
    return;
  }
  if (empty) empty.hidden = true;
  if (count) count.textContent = `${lista.length} produto(s) encontrado(s)`;

  tbody.innerHTML = lista.map(p => `
    <tr data-id="${p.id}">
      <td>
        <div class="dash-td-produto">
          <img src="${p.imagem || p.img || 'https://placehold.co/44x44?text=SR'}" alt="" width="44" height="44" class="dash-prod-img" loading="lazy" onerror="this.src='https://placehold.co/44x44?text=SR'" />
          <div>
            <div class="dash-prod-nome">${p.titulo}</div>
            <div class="dash-prod-id">ID #${p.id}</div>
          </div>
        </div>
      </td>
      <td><span class="dash-badge">${CATS_NOMES[p.categoria] || p.categoria || '—'}</span></td>
      <td class="dash-td-preco">${_fmt(p.preco)}</td>
      <td class="text-center">
        ${p.destaque
          ? '<span class="dash-status dash-status--sim">✓ Sim</span>'
          : '<span class="dash-status dash-status--nao">— Não</span>'}
      </td>
      <td class="text-center">
        <div class="dash-acoes">
          <button class="dash-btn-acao dash-btn-acao--editar" data-id="${p.id}" aria-label="Editar ${p.titulo}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Editar
          </button>
          <button class="dash-btn-acao dash-btn-acao--remover" data-id="${p.id}" aria-label="Remover ${p.titulo}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
            Remover
          </button>
        </div>
      </td>
    </tr>`).join('');

 tbody.querySelectorAll('.dash-btn-acao--editar').forEach(btn => {
  btn.addEventListener('click', async () => {

    const produtos = await Dashboard.getProdutos();

    const p = produtos.find(
      x => String(x.id) === String(btn.dataset.id)
    );

    if (p) {
      dbAbrirFormEdicao(p);
    } else {
      dbToast('Produto não encontrado.', 'erro');
    }
  });
});

tbody.querySelectorAll('.dash-btn-acao--remover').forEach(btn => {
  btn.addEventListener('click', async () => {

    _produtoParaRemover = btn.dataset.id;

    const produtos = await Dashboard.getProdutos();

    const p = produtos.find(
      x => String(x.id) === String(btn.dataset.id)
    );
    _imagensParaRemover = dbUrlsDoProduto(p);

    const modal = document.getElementById('modal-confirmar');
    const desc = document.getElementById('modal-conf-desc');

    if (desc) {
      desc.textContent = p
        ? `"${p.titulo}" será removido permanentemente.`
        : 'Esta ação não pode ser desfeita.';
    }

    if (modal) {
      modal.hidden = false;
    }
  });
});
}

/* ── Filtros ── */
function dbInitFiltrosProdutos() {
  const inputBusca = document.getElementById('dash-busca');
  const selectCat  = document.getElementById('dash-filtro-cat');
  const refresh = () => dbRenderTabelaProdutos(inputBusca?.value || '', selectCat?.value || 'todos');
  inputBusca?.addEventListener('input', refresh);
  selectCat?.addEventListener('change', refresh);
}

/* ============================================================
   ESTOQUE — quantidade real de cada produto
   ============================================================ */
async function dbRenderEstoque() {
  const produtos = await Dashboard.getProdutos();
  const tbody = document.getElementById('dash-estoque-body');
  if (!tbody) return;

  if (!produtos.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:#9ca3af;">Nenhum produto no estoque.</td></tr>`;
    return;
  }

  tbody.innerHTML = produtos.map(p => {
    const qty = Number(p.estoque) || 0;
    const cls = qty > 15 ? 'db-estoque-qty--ok' : qty > 5 ? 'db-estoque-qty--med' : 'db-estoque-qty--low';
    const txt = qty === 0 ? 'Sem estoque' : `${qty} un.`;
    return `
      <tr>
        <td>
          <div class="dash-td-produto">
            <img src="${p.imagem || p.img || 'https://placehold.co/44x44?text=SR'}" alt="" width="44" height="44" class="dash-prod-img" loading="lazy" onerror="this.src='https://placehold.co/44x44?text=SR'" />
            <div>
              <div class="dash-prod-nome">${p.titulo}</div>
              <div class="dash-prod-id">ID #${p.id}</div>
            </div>
          </div>
        </td>
        <td><span class="dash-badge">${CATS_NOMES[p.categoria] || p.categoria || '—'}</span></td>
        <td class="dash-td-preco">${_fmt(p.preco)}</td>
        <td style="color:#6b7280;font-size:.82rem;">${p.densidade || '—'}</td>
        <td class="text-center">
          ${p.destaque
            ? '<span class="dash-status dash-status--sim">✓ Sim</span>'
            : '<span class="dash-status dash-status--nao">— Não</span>'}
        </td>
        <td class="text-center"><span class="db-estoque-qty ${cls}">${txt}</span></td>
      </tr>`;
  }).join('');
}

/* ============================================================
   MÉTRICAS — resumo do catálogo (dados reais)
   ============================================================ */
async function dbRenderMetricas() {
  const produtos = await Dashboard.getProdutos();

  const precos   = produtos.map(p => Number(p.preco)).filter(Boolean);
  const precoMed = precos.length ? precos.reduce((s, v) => s + v, 0) / precos.length : 0;
  const precoMin = precos.length ? Math.min(...precos) : 0;
  const precoMax = precos.length ? Math.max(...precos) : 0;
  const unidades = produtos.reduce((s, p) => s + (Number(p.estoque) || 0), 0);
  const semEstoque = produtos.filter(p => !(Number(p.estoque) > 0)).length;

  const porCat = {};
  produtos.forEach(p => { porCat[p.categoria] = (porCat[p.categoria] || 0) + 1; });
  const [catTopId, catTopQtd] = Object.entries(porCat).sort((a, b) => b[1] - a[1])[0] || [null, 0];

  const METRICAS = [
    { ico: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`, cor: 'azul', valor: produtos.length, label: 'Produtos no Catálogo',
      detalhe: `${produtos.filter(p => p.destaque).length} em destaque` },
    { ico: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`, cor: 'laranja', valor: unidades, label: 'Unidades em Estoque',
      detalhe: `${semEstoque} produto(s) sem estoque` },
    { ico: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`, cor: 'verde', valor: _fmt(precoMed), label: 'Preço Médio do Catálogo',
      detalhe: precos.length ? `de ${_fmt(precoMin)} a ${_fmt(precoMax)}` : 'Sem produtos ainda' },
    { ico: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`, cor: 'vermelho', valor: catTopId ? (CATS_NOMES[catTopId] || catTopId) : '—', label: 'Categoria com Mais Produtos',
      detalhe: catTopId ? `${catTopQtd} produto(s)` : 'Sem produtos ainda' },
  ];

  const grid = document.getElementById('metricas-grid');
  if (grid) {
    grid.innerHTML = METRICAS.map(m => `
      <div class="metrica-card metrica-card--${m.cor}">
        <div class="metrica-card__ico">${m.ico}</div>
        <div class="metrica-card__corpo">
          <div class="metrica-card__valor">${m.valor}</div>
          <div class="metrica-card__label">${m.label}</div>
          <div class="metrica-card__detalhe">${m.detalhe}</div>
        </div>
      </div>`).join('');
  }
}

/* ============================================================
   FORMULÁRIO — Novo / Editar Produto
   ============================================================ */
let _modoEdicao = false;
let _produtoEmEdicao = null;

const CATS_NOMES = {
  colchao: 'Colchões', cama: 'Cama', sofa: 'Sofá',
  cabeceira: 'Cabeceira', puff: 'Puff', travesseiro: 'Travesseiro',
  almofada: 'Almofada', poltrona: 'Poltrona',
};

const IMG_TIPOS_OK = ['image/png', 'image/jpeg', 'image/webp'];
const IMG_MAX_MB = 5;
const MAX_FOTOS = 8;

/* Fotos do formulário, na ordem. A primeira é a principal.
   { url: 'https://...' }  → já está no Storage
   { file: File, preview }  → ainda vai ser enviada ao salvar */
let _fotos = [];

/* URLs de imagens de um produto (principal + extras, sem repetir) */
function dbUrlsDoProduto(p) {
  const lista = [];
  if (Array.isArray(p?.imagens)) lista.push(...p.imagens);
  if (p?.imagem) lista.push(p.imagem);
  return [...new Set(lista.filter(Boolean))];
}

function dbInitFormProduto() {
  const form = document.getElementById('dash-form-produto');
  const cancelar = document.getElementById('dash-form-cancelar');
  if (!form) return;

  dbInitUploadImagem();

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const id         = document.getElementById('df-id')?.value;
    const nome       = document.getElementById('df-nome')?.value.trim();
    const preco      = parseFloat(document.getElementById('df-preco')?.value);
    const categoria  = document.getElementById('df-categoria')?.value;
    const densidade  = document.getElementById('df-densidade')?.value.trim();
    const tecnologia = document.getElementById('df-tecnologia')?.value.trim();
    const descricao  = document.getElementById('df-descricao')?.value.trim();
    const destaque   = document.getElementById('df-destaque')?.checked;
    const tag        = document.getElementById('df-tag')?.value.trim();
    const estoque    = Math.max(0, parseInt(document.getElementById('df-estoque')?.value, 10) || 0);

    if (!nome || !preco || !categoria) {
      dbToast('Preencha os campos obrigatórios: Nome, Preço e Categoria.', 'erro');
      return;
    }

    const btnSalvar = document.getElementById('dash-form-submit');
    const htmlBtn = btnSalvar?.innerHTML;
    if (btnSalvar) { btnSalvar.disabled = true; btnSalvar.textContent = 'Salvando...'; }
    const liberarBtn = () => { if (btnSalvar) { btnSalvar.disabled = false; btnSalvar.innerHTML = htmlBtn; } };

    const enviadasAgora = [];   // para desfazer se algo falhar

    try {
      /* ── Envia as fotos novas, mantendo a ordem ── */
      const urls = [];
      const novas = _fotos.filter(f => f.file).length;
      let enviadas = 0;
      for (const foto of _fotos) {
        if (foto.url) { urls.push(foto.url); continue; }
        enviadas++;
        dbToast(`Enviando imagem ${enviadas} de ${novas}...`, 'info');
        const url = await uploadImagemProduto(foto.file);
        if (!url) {
          await dbExcluirImagensStorage(enviadasAgora);
          liberarBtn();
          return;                         // erro já mostrado no toast
        }
        enviadasAgora.push(url);
        urls.push(url);
      }

      /* ── Campos com os nomes das colunas do Supabase ── */
      const dados = {
        titulo: nome,
        preco,
        categoria,
        densidade,
        especificacoes: tecnologia,
        imagem: urls[0] || '',            // principal (usada pela vitrine)
        descricao,
        destaque,
        tag:     tag || null,
        estoque,
      };

      const salvo = (_modoEdicao && id)
        ? await Dashboard.editarProduto(id, dados)
        : await Dashboard.adicionarProduto(dados);

      if (!salvo) {
        await dbExcluirImagensStorage(enviadasAgora);
        dbToast('Não foi possível salvar o produto. Veja o console (F12).', 'erro');
        liberarBtn();
        return;
      }

      /* ── Lista completa de fotos (coluna "imagens") ── */
      const { error: erroImgs } = await supabaseClient
        .from('produtos')
        .update({ imagens: urls })
        .eq('id', salvo.id);

      if (erroImgs) {
        console.error('Erro ao salvar a lista de imagens:', erroImgs);
        dbToast('Produto salvo, mas as fotos extras não foram gravadas (falta a coluna "imagens" no Supabase).', 'erro');
      }

      /* ── Apaga do Storage as fotos que saíram do produto ── */
      if (_modoEdicao && _produtoEmEdicao) {
        const sobraram = new Set(urls);
        const removidas = dbUrlsDoProduto(_produtoEmEdicao).filter(u => !sobraram.has(u));
        await dbExcluirImagensStorage(removidas);
      }

      dbToast(_modoEdicao ? 'Produto atualizado com sucesso!' : 'Produto adicionado com sucesso!', 'sucesso');
      dbResetarForm();
      await dbRefreshTudo();
      document.querySelector('.db-nav-item[data-section="section-produtos"]')?.click();
    } catch (err) {
      console.error('Erro ao salvar produto:', err);
      await dbExcluirImagensStorage(enviadasAgora);
      dbToast('Erro ao salvar o produto.', 'erro');
      liberarBtn();
    }
  });

  cancelar?.addEventListener('click', () => {
    dbResetarForm();
    document.querySelector('.db-nav-item[data-section="section-produtos"]')?.click();
  });
}

/* ── Galeria de fotos do formulário ── */
function dbRenderGaleria() {
  const galeria = document.getElementById('galeria-fotos');
  const nome = document.getElementById('nome-imagem');
  if (nome) {
    nome.textContent = _fotos.length
      ? `${_fotos.length} de ${MAX_FOTOS} imagem(ns)`
      : 'Nenhuma imagem selecionada';
  }
  if (!galeria) return;

  galeria.innerHTML = _fotos.map((f, i) => `
    <div class="foto-item ${i === 0 ? 'foto-item--principal' : ''}">
      <img src="${f.url || f.preview}" alt="Foto ${i + 1} do produto" />
      ${i === 0 ? '<span class="foto-item__badge">Principal</span>' : ''}
      <div class="foto-item__acoes">
        ${i > 0 ? `<button type="button" class="foto-item__btn foto-item__btn--star" data-acao="principal" data-idx="${i}" aria-label="Tornar principal" title="Tornar principal">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </button>` : ''}
        <button type="button" class="foto-item__btn" data-acao="remover" data-idx="${i}" aria-label="Remover imagem" title="Remover imagem">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>`).join('');
}

function dbAdicionarArquivos(arquivos) {
  for (const file of arquivos) {
    if (_fotos.length >= MAX_FOTOS) {
      dbToast(`Limite de ${MAX_FOTOS} imagens por produto.`, 'erro');
      break;
    }
    if (!IMG_TIPOS_OK.includes(file.type)) {
      dbToast(`"${file.name}": use PNG, JPG ou WEBP.`, 'erro');
      continue;
    }
    if (file.size > IMG_MAX_MB * 1024 * 1024) {
      dbToast(`"${file.name}" passa de ${IMG_MAX_MB} MB.`, 'erro');
      continue;
    }
    _fotos.push({ file, preview: URL.createObjectURL(file) });
  }
  dbRenderGaleria();
}

function dbAbrirFormEdicao(p) {
  _modoEdicao = true;
  _produtoEmEdicao = p;
  document.getElementById('df-id').value         = p.id;
  document.getElementById('df-nome').value       = p.titulo || '';
  document.getElementById('df-preco').value      = p.preco || '';
  document.getElementById('df-categoria').value  = p.categoria || '';
  document.getElementById('df-densidade').value  = p.densidade || '';
  document.getElementById('df-tecnologia').value = p.especificacoes || '';
  document.getElementById('df-descricao').value  = p.descricao || '';
  document.getElementById('df-destaque').checked = !!p.destaque;
  document.getElementById('df-tag').value        = p.tag || '';
  document.getElementById('df-estoque').value    = Number(p.estoque) || 0;

  // principal primeiro, depois as extras
  const urls = dbUrlsDoProduto(p);
  const principal = p.imagem;
  if (principal && urls.includes(principal)) {
    urls.splice(urls.indexOf(principal), 1);
    urls.unshift(principal);
  }
  _fotos = urls.map(url => ({ url }));
  dbRenderGaleria();

  const btn = document.getElementById('dash-form-submit');
  if (btn) btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Atualizar Produto`;
  document.querySelector('.db-nav-item[data-section="section-novo-produto"]')?.click();
}

function dbResetarForm() {
  _modoEdicao = false;
  _produtoEmEdicao = null;
  document.getElementById('dash-form-produto')?.reset();
  const idEl = document.getElementById('df-id');
  if (idEl) idEl.value = '';
  _fotos = [];
  dbRenderGaleria();
  const btn = document.getElementById('dash-form-submit');
  if (btn) {
    btn.disabled = false;
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Salvar Produto`;
  }
}

async function dbRefreshTudo() {
  await dbRenderGeral();
  await dbRenderTabelaProdutos(
    document.getElementById('dash-busca')?.value || '',
    document.getElementById('dash-filtro-cat')?.value || 'todos'
  );
  await dbRenderEstoque();
  await dbRenderMetricas();
}

/* ── Storage: apagar arquivos pelas URLs públicas (falhas não travam o fluxo) ── */
async function dbExcluirImagensStorage(urls) {
  const caminhos = (urls || [])
    .filter(u => u && u.includes('/produtos/'))
    .map(u => decodeURIComponent(u.split('/produtos/').pop().split('?')[0]));
  if (!caminhos.length) return;
  try {
    const { error } = await supabaseClient.storage.from('produtos').remove(caminhos);
    if (error) console.error('Não foi possível apagar imagens do Storage:', error);
  } catch (e) {
    console.error('Erro ao apagar imagens do Storage:', e);
  }
}

/* ============================================================
   UPLOAD DAS IMAGENS
   ============================================================ */
function dbInitUploadImagem() {
  const btnGaleria = document.getElementById('btn-selecionar-imagem');
  const btnCamera  = document.getElementById('btn-tirar-foto');
  const input      = document.getElementById('df-img-file');
  const inputCam   = document.getElementById('df-img-camera');
  const galeria    = document.getElementById('galeria-fotos');
  if (!btnGaleria || !input) return;

  btnGaleria.addEventListener('click', () => input.click());
  btnCamera?.addEventListener('click', () => inputCam?.click());

  input.addEventListener('change', () => {
    dbAdicionarArquivos([...input.files]);
    input.value = '';
  });
  inputCam?.addEventListener('change', () => {
    dbAdicionarArquivos([...inputCam.files]);
    inputCam.value = '';
  });

  // remover / tornar principal
  galeria?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-acao]');
    if (!btn) return;
    const i = Number(btn.dataset.idx);
    if (btn.dataset.acao === 'remover') {
      _fotos.splice(i, 1);
    } else if (btn.dataset.acao === 'principal') {
      const [foto] = _fotos.splice(i, 1);
      _fotos.unshift(foto);
    }
    dbRenderGaleria();
  });

  dbRenderGaleria();
}

async function uploadImagemProduto(file) {
  if (!file) return null;

  try {
    const extensao = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const nomeArquivo = `produto-${Date.now()}-${crypto.randomUUID()}.${extensao}`;

    const { error } = await supabaseClient.storage
      .from('produtos')
      .upload(nomeArquivo, file, { cacheControl: '3600', upsert: false, contentType: file.type });

    if (error) throw error;

    const { data } = supabaseClient.storage.from('produtos').getPublicUrl(nomeArquivo);
    return data.publicUrl;

  } catch (error) {
    console.error('Erro ao enviar imagem:', error);
    dbToast('Erro ao enviar a imagem. Veja o console (F12).', 'erro');
    return null;
  }
}

/* ============================================================
   MODAL CONFIRMAÇÃO EXCLUSÃO
   ============================================================ */
function dbInitModalConfirmacao() {
  const modal     = document.getElementById('modal-confirmar');
  const confirmar = document.getElementById('conf-confirmar');
  const cancelar  = document.getElementById('conf-cancelar');

  confirmar?.addEventListener('click', async () => {
    if (!_produtoParaRemover) return;

    const removido = await Dashboard.removerProduto(_produtoParaRemover);

    if (removido) {
      dbToast('Produto removido com sucesso!', 'sucesso');
      await dbExcluirImagensStorage(_imagensParaRemover);
      _imagensParaRemover = [];
      _produtoParaRemover = null;
      if (modal) modal.hidden = true;
      await dbRefreshTudo();
    } else {
      dbToast('Erro ao remover produto.', 'erro');
    }
  });

  cancelar?.addEventListener('click', () => {
    _produtoParaRemover = null;
    if (modal) modal.hidden = true;
  });

  modal?.addEventListener('click', e => {
    if (e.target === modal) {
      _produtoParaRemover = null;
      modal.hidden = true;
    }
  });
}

async function sairDashboard() {
  console.log('[Sair] v3 — saindo e indo para login.html');
  try {
    // Encerra a sessão do Supabase, se estiver sendo utilizada
    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
      await supabaseClient.auth.signOut({ scope: 'local' });
    }
  } catch (error) {
    console.error('Erro ao encerrar sessão:', error);
  } finally {
    // Limpa a sessão local, caso exista
    // (não chamar Auth.logout(): no script.js ele provavelmente redireciona para index.html)
    localStorage.removeItem('sr_sessao');
    localStorage.removeItem('sr_usuario');
    sessionStorage.clear();

    // Volta para a tela de login
    console.log('[Sair] indo para login.html');
    window.location.replace('login.html');
  }
}
document.getElementById('btn-sair')?.addEventListener('click', sairDashboard);
