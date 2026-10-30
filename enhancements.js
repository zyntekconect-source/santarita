/* ================================================
   SANTA RITA — ENHANCEMENTS.JS
   Scroll reveal em cascata, parallax leve no topo,
   barra de progresso e polimento de header.
   Roda depois de script.js — não substitui nada.
   ================================================ */
(function () {
  'use strict';

  var reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {

    /* ---- 1. Barra de progresso de leitura ---- */
    var barra = document.createElement('div');
    barra.id = 'sr-progress';
    document.body.appendChild(barra);
    function atualizarProgresso() {
      var alt = document.documentElement.scrollHeight - window.innerHeight;
      var pct = alt > 0 ? (window.scrollY / alt) * 100 : 0;
      barra.style.width = pct + '%';
    }
    window.addEventListener('scroll', atualizarProgresso, { passive: true });
    atualizarProgresso();

    /* ---- 2. Blobs decorativos de profundidade no topo (hero) ---- */
    var alvoFundo = document.querySelector('.hero, .auth-split__visual, .prod-hero, .banner-topo');
    if (alvoFundo && !alvoFundo.querySelector('.sr-blob')) {
      ['sr-blob sr-blob--1', 'sr-blob sr-blob--2', 'sr-blob sr-blob--3'].forEach(function (cls) {
        var b = document.createElement('div');
        b.className = cls;
        alvoFundo.insertBefore(b, alvoFundo.firstChild);
      });
    }

    /* ---- 3. Parallax leve dos blobs ao rolar ---- */
    if (!reduzMovimento) {
      var blobs = document.querySelectorAll('.sr-blob');
      window.addEventListener('scroll', function () {
        var y = window.scrollY;
        blobs.forEach(function (b, i) {
          var vel = 0.06 + i * 0.03;
          b.style.transform = 'translateY(' + (y * vel) + 'px)';
        });
      }, { passive: true });
    }

    /* ---- 3b. Faixa de anúncio rotativa ---- */
    var itensAnuncio = document.querySelectorAll('.anuncio-bar__item');
    if (itensAnuncio.length > 1) {
      var idxAnuncio = 0;
      setInterval(function () {
        itensAnuncio[idxAnuncio].classList.remove('is-ativo');
        idxAnuncio = (idxAnuncio + 1) % itensAnuncio.length;
        itensAnuncio[idxAnuncio].classList.add('is-ativo');
      }, 4000);
    }

    /* ---- 3c. Cards "Escolha pelo seu jeito de dormir" ----
       Reaproveita o sistema de filtros já existente em script.js
       (State, renderizarVitrine, #filtro-categoria, #filtro-densidade). */
    document.querySelectorAll('.jeito-card').forEach(function (card) {
      card.addEventListener('click', function () {
        document.querySelectorAll('.jeito-card').forEach(function (c) { c.classList.remove('jeito-card--ativo'); });
        card.classList.add('jeito-card--ativo');

        var cat = card.dataset.cat;
        var dens = card.dataset.dens;

        var filtros = document.getElementById('filtros');
        if (filtros) filtros.hidden = false;

        var filtroCat = document.getElementById('filtro-categoria');
        var filtroDens = document.getElementById('filtro-densidade');

        if (typeof State !== 'undefined') {
          State.mostrandoTodos = true;
          if (cat) State.categoriaSelecionada = cat;
          if (dens) State.filtroDensidade = dens;
        }
        if (filtroCat && cat) filtroCat.value = cat;
        if (filtroDens && dens) filtroDens.value = dens;

        if (typeof renderizarVitrine === 'function') renderizarVitrine();

        setTimeout(function () {
          document.getElementById('vitrine')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      });
    });

    /* ---- 3d. Newsletter ---- */
    document.getElementById('form-newsletter')?.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = document.getElementById('newsletter-email').value.trim();
      if (!email) return;
      if (typeof mostrarToast === 'function') {
        mostrarToast('Inscrição confirmada! Fique de olho no seu e-mail. 📩', 'sucesso');
      }
      e.target.reset();
    });

    /* ---- 3e. FAQ no rodapé (respostas rápidas via toast) ---- */
    var respostasFaq = {
      garantia: 'Garantia estendida contra defeitos de fabricação — fale com a gente pelo WhatsApp para detalhes.',
      troca: 'Troca garantida em até 30 dias após a compra, conforme condições da loja.',
      entrega: 'Entrega e montagem grátis dentro da cidade.',
      medida: 'Fazemos colchões, bases e cabeceiras sob medida — envie as dimensões pelo WhatsApp.'
    };
    document.querySelectorAll('[data-faq]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var msg = respostasFaq[link.dataset.faq];
        if (msg && typeof mostrarToast === 'function') mostrarToast(msg, 'info');
      });
    });

    /* ---- 3f. Widget de suporte flutuante (substitui o WhatsApp isolado) ----
       Fica do lado direito da tela, com ícone de headset. Ao clicar, abre
       um mini-chat com perguntas prontas e atalhos para WhatsApp/Instagram. */
    (function initSuporteWidget() {
      if (document.querySelector('.suporte-fab')) return; // evita duplicar

      var NUM_WHATS = '5599701-7188';
      var LINK_INSTA = 'https://instagram.com/santaritacolchoes';

      var perguntas = [
        { texto: 'Qual o prazo de entrega?', resposta: 'Entregamos e montamos em até 5 dias úteis dentro da cidade — sem custo adicional.' },
        { texto: 'Fazem colchão sob medida?', resposta: 'Sim! Fazemos colchões, bases e cabeceiras sob medida. Me diga as dimensões que já te passo um valor.' },
        { texto: 'Como funciona o parcelamento?', resposta: 'Parcelamos em até 10x sem juros no cartão, sem entrada.' },
        { texto: 'Qual a garantia dos produtos?', resposta: 'Garantia estendida contra defeitos de fabricação em todos os produtos — te explico as condições certinho no WhatsApp.' },
      ];

      var fab = document.createElement('button');
      fab.className = 'suporte-fab';
      fab.setAttribute('aria-label', 'Abrir suporte');
      fab.setAttribute('aria-expanded', 'false');
      fab.innerHTML =
        '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
        '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/>' +
        '<path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>' +
        '</svg><span class="suporte-fab__badge"></span>';

      var painel = document.createElement('div');
      painel.className = 'suporte-painel';
      painel.setAttribute('role', 'dialog');
      painel.setAttribute('aria-label', 'Suporte Santa Rita');

      var perguntasHtml = perguntas.map(function (p) {
        return '<button type="button" class="suporte-opcao" data-resposta="' + encodeURIComponent(p.resposta) + '">' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 2-3 4"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' +
          p.texto + '</button>';
      }).join('');

      painel.innerHTML =
        '<div class="suporte-painel__header">' +
          '<svg width="30" height="30" viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="8" fill="rgba(255,255,255,0.15)"/><path d="M7 14h22v2H7zM7 18h22v2H7zM10 22h16v4H10z" fill="white"/><path d="M10 10h16v4H10z" fill="white" opacity=".7"/></svg>' +
          '<div><strong>Suporte Santa Rita</strong><span>Costumamos responder em minutos</span></div>' +
          '<button type="button" class="suporte-painel__fechar" aria-label="Fechar suporte">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="suporte-painel__corpo" id="suporte-corpo">' +
          '<div class="suporte-painel__msg">Olá! 👋 Como podemos ajudar? Escolha uma pergunta rápida ou fale direto com a gente.</div>' +
          '<div>' +
            '<div class="suporte-painel__grupo-titulo">Perguntas frequentes</div>' +
            '<div class="suporte-painel__opcoes">' + perguntasHtml + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="suporte-painel__canais">' +
          '<a class="suporte-canal suporte-canal--whats" target="_blank" rel="noopener" href="https://wa.me/' + NUM_WHATS + '?text=Olá!%20Vim%20pelo%20site%20e%20preciso%20de%20ajuda.">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/></svg>' +
            'WhatsApp</a>' +
          '<a class="suporte-canal suporte-canal--insta" target="_blank" rel="noopener" href="' + LINK_INSTA + '">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>' +
            'Instagram</a>' +
        '</div>';

      document.body.appendChild(fab);
      document.body.appendChild(painel);

      function abrir() {
        painel.classList.add('aberto');
        fab.setAttribute('aria-expanded', 'true');
      }
      function fechar() {
        painel.classList.remove('aberto');
        fab.setAttribute('aria-expanded', 'false');
      }

      fab.addEventListener('click', function () {
        painel.classList.contains('aberto') ? fechar() : abrir();
      });
      painel.querySelector('.suporte-painel__fechar').addEventListener('click', fechar);
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fechar(); });
      document.addEventListener('click', function (e) {
        if (!painel.classList.contains('aberto')) return;
        if (painel.contains(e.target) || fab.contains(e.target)) return;
        fechar();
      });

      painel.querySelectorAll('.suporte-opcao').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var corpo = document.getElementById('suporte-corpo');
          var bolha = document.createElement('div');
          bolha.className = 'suporte-painel__msg';
          bolha.textContent = decodeURIComponent(btn.dataset.resposta);
          corpo.appendChild(bolha);
          corpo.scrollTop = corpo.scrollHeight;
        });
      });
    })();

    /* ---- 4. Sombra no header ao rolar ---- */
    var header = document.querySelector('.header');
    if (header) {
      window.addEventListener('scroll', function () {
        header.classList.toggle('sr-scrolled', window.scrollY > 12);
      }, { passive: true });
    }

    /* ---- 5. Scroll-reveal automático em cascata ----
       Marca automaticamente títulos, parágrafos, cards e itens de
       seções que ainda não tenham uma classe de animação, e revela
       em cascata conforme entram na tela. */
    var seletorAlvo = [
      '.categorias .cat-card', '.vitrine .produto-card',
      '.sobre__conteudo > *', '.depoimentos .dep__card',
      '.cta-band__conteudo > *', '.footer__col',
      'section > .container > h2, section > .container > p.secao__sub',
      '.stat-card, .dash-card'
    ].join(', ');

    var grupos = {};
    document.querySelectorAll(seletorAlvo).forEach(function (el) {
      if (el.classList.contains('reveal') || el.classList.contains('sr-up') ||
          el.classList.contains('sr-fade') || el.classList.contains('sr-left')) return;
      el.classList.add('sr-up');
      var pai = el.parentElement;
      var chave = pai ? (pai.className || 'root') : 'root';
      grupos[chave] = grupos[chave] || 0;
      el.style.setProperty('--sr-i', grupos[chave]);
      grupos[chave]++;
      if (pai) pai.classList.add('sr-stagger');
    });

    if (reduzMovimento) {
      document.querySelectorAll('.sr-up, .sr-fade, .sr-left, .sr-right, .sr-scale')
        .forEach(function (el) { el.classList.add('sr-visivel'); });
      return;
    }

    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('sr-visivel');
          observador.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.sr-up, .sr-fade, .sr-left, .sr-right, .sr-scale')
      .forEach(function (el) { observador.observe(el); });
  });
})();
