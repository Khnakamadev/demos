(() => {
  const casa = window.restaurante;
  if (!casa) return;

  const { textos, tema, seo, secoes, contato, hero } = casa;
  const r = textos.rotulos;
  const site = document.querySelector("#site");
  const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

  function escape(value) {
    return String(value ?? "").replace(/[&<>"']/g, char =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  }

  function link(url, label, classe = "") {
    return url ? `<a class="${classe}" href="${escape(url)}">${escape(label)}</a>` : "";
  }

  function foto(image, principal = false) {
    if (!image?.src) return "";
    return `<img src="${escape(image.src)}" alt="${escape(image.alt)}" width="${escape(image.largura)}"
      height="${escape(image.altura)}" ${principal ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"'}>`;
  }

  function textoSecao({ titulo, rotulo, texto }) {
    return `${rotulo ? `<p class="chapeu">${escape(rotulo)}</p>` : ""}
      <h2>${escape(titulo)}</h2>${texto ? `<p>${escape(texto)}</p>` : ""}`;
  }

  function secao(id, conteudo, estilo = "") {
    return `<section id="${id}" class="bloco ${estilo}"><div class="container">${conteudo}</div></section>`;
  }

  for (const [chave, valor] of Object.entries(tema.cores)) {
    document.documentElement.style.setProperty("--" + chave, valor);
  }
  const families = Object.entries(tema.fontes).filter(([, font]) => font);
  for (const [chave, font] of families) {
    const fallback = chave === "titulo" ? "Georgia, serif" : "system-ui, sans-serif";
    document.documentElement.style.setProperty("--" + chave, JSON.stringify(font.split(":")[0]) + ", " + fallback);
  }
  if (families.length) {
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "https://fonts.googleapis.com/css2?" +
      [...new Set(families.map(([, font]) => font))].map(font => "family=" + encodeURIComponent(font).replace(/%20/g, "+")).join("&") +
      "&display=swap";
    document.head.append(stylesheet);
  }

  document.title = casa.nome + " | " + casa.cidade;
  for (const [key, value] of Object.entries({
    description: seo.descricao, "og:title": document.title, "og:description": seo.descricao,
    "og:type": "website", "og:locale": "pt_BR", "og:image": seo.imagem?.src && new URL(seo.imagem.src, seo.url || document.baseURI).href,
    "og:image:alt": seo.imagem?.alt, "og:url": seo.url
  })) {
    if (!value || document.head.querySelector("meta[property=" + JSON.stringify(key) + "], meta[name=" + JSON.stringify(key) + "]")) continue;
    const tag = document.createElement("meta");
    tag.setAttribute(key.startsWith("og:") ? "property" : "name", key);
    tag.content = value;
    document.head.append(tag);
  }
  if (seo.favicon) {
    const icon = document.createElement("link");
    icon.rel = "icon";
    icon.href = seo.favicon;
    document.head.append(icon);
  }

  const comercial = contato.ficticio ? {} : contato;
  const whatsapp = secoes.whatsapp && comercial.whatsapp ? "https://wa.me/" + comercial.whatsapp.replace(/\D/g, "") : "";
  const telefone = comercial.telefone ? "tel:" + comercial.telefone.replace(/[^+\d]/g, "") : "";
  const reserva = comercial.reserva || whatsapp || telefone;
  const delivery = secoes.delivery ? comercial.delivery || (secoes.ifood && comercial.ifood) || whatsapp : "";
  const cardapio = casa.cardapio.filter(categoria => categoria.itens.length);
  const mostraCardapio = secoes.cardapio && cardapio.length > 0;
  const mostraReservas = secoes.reservas || secoes.eventos;
  const mostraFaq = secoes.faq && casa.faq.length > 0;
  const destaques = casa.destaques.map(nome => cardapio.flatMap(cat => cat.itens).find(item => item.nome === nome)).filter(Boolean);
  const acoesHero = link(secoes.reservas && (reserva || "#reservas"), r.reservar, "botao primario") +
    link(mostraCardapio && "#cardapio", r.cardapio, "botao") + link(delivery, r.delivery, "botao");
  const navegacao = [
    [secoes.historia && "#historia", textos.historia.rotulo || textos.historia.titulo],
    [mostraCardapio && "#cardapio", textos.cardapio.titulo],
    [mostraReservas && "#reservas", secoes.reservas ? r.reservar : textos.reservas.tituloEventos],
    [secoes.localizacao && "#localizacao", textos.localizacao.titulo]
  ].map(([url, label]) => link(url, label)).join("");
  const redes = link(whatsapp, r.whatsapp) + link(telefone, comercial.telefone) +
    link(comercial.instagram, r.instagram) + link(secoes.ifood && comercial.ifood, r.ifood) +
    link(delivery, r.delivery) + link(secoes.reservas && comercial.reserva, r.reservar);
  const placasHero = (Array.isArray(hero.titulo) ? hero.titulo : [hero.titulo]).map(linha => `<span>${escape(linha)}</span>`).join("");

  function prato(item, emDestaque) {
    const titulo = `<h3>${escape(item.nome)}</h3>`;
    const imagem = foto(item.foto);
    const selo = item.daCasa ? `<small>${escape(r.daCasa)}</small>` : "";
    return `<li>${emDestaque ? imagem : ""}${titulo}
      ${emDestaque || !Number.isFinite(item.preco) ? "" : `<strong>${moeda.format(item.preco)}</strong>`}
      <p>${escape(item.descricao)}</p>${selo}${emDestaque ? "" : imagem}</li>`;
  }

  const abas = cardapio.map(({ nome }, i) => `<button id="aba-${i}" type="button" role="tab" aria-controls="categoria-${i}"
    aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${escape(nome)}</button>`).join("");
  const paineis = cardapio.map(({ itens }, i) => `<div id="categoria-${i}" role="tabpanel" aria-labelledby="aba-${i}"
    tabindex="0" ${i === 0 ? "" : "hidden"}><ul class="pratos">${itens.map(item => prato(item, false)).join("")}</ul></div>`).join("");
  const bairro = `<address>${escape(casa.endereco)}</address>`;
  const horas = `<ul class="horarios">${casa.funcionamento.map(h => `<li><span>${escape(h.dias)}</span><span>${escape(h.horas)}</span></li>`).join("")}</ul>`;
  const nota = `${escape(textos.avaliacoes.nota)} / 5 · ${escape(textos.avaliacoes.total)} ${escape(r.avaliacoes)} · ${link(textos.avaliacoes.fonte, textos.avaliacoes.plataforma)}`;

  site.innerHTML = `
    <a class="pular" href="#conteudo">${escape(r.pular)}</a>
    <header class="cabecalho"><div class="container barra">
      <a class="marca" href="#inicio"><span aria-hidden="true">◒</span>${escape(casa.nome)}</a>
      ${navegacao ? `<button class="botao menu-toggle" aria-expanded="false" aria-controls="menu">${escape(r.menu)}</button>
      <nav id="menu" aria-label="${escape(r.principal)}">${navegacao}</nav>` : ""}
    </div></header>
    <main id="conteudo" tabindex="-1">
      <section class="hero" id="inicio">
        <div class="cena">
          ${foto(hero.foto, true)}
          ${!casa.heroAnimacao && hero.video ? `<video autoplay muted loop playsinline preload="metadata" poster="${escape(hero.foto?.src)}" src="${escape(hero.video)}" aria-hidden="true"></video>` : ""}
          <div class="container hero-texto">
            <p class="chapeu">${escape(casa.cidade)} · ${escape(casa.cozinha)}</p>
            <h1>${placasHero}</h1>
            <p id="slogan">${escape(casa.slogan)}</p>
            ${acoesHero ? `<div class="acoes">${acoesHero}</div>` : ""}
          </div>
        </div>
      </section>
      ${casa.aviso ? `<p class="aviso">${escape(casa.aviso)}</p>` : ""}
      ${secoes.historia ? secao("historia", `<div class="duas"><div>${textoSecao(textos.historia)}</div>${foto(casa.fotoHistoria)}</div>`, "claro") : ""}
      ${secoes.destaques && destaques.length ? secao("destaques", `${textoSecao(textos.destaques)}
        <ul class="destaques">${destaques.map(item => prato(item, true)).join("")}</ul>`) : ""}
      ${mostraCardapio ? secao("cardapio", `${textoSecao(textos.cardapio)}
        <div class="abas" role="tablist" aria-label="${escape(r.categorias)}">${abas}</div>${paineis}`, "claro") : ""}
      ${secoes.galeria ? secao("galeria", `${textoSecao(textos.galeria)}
        <div class="galeria">${casa.galeria.map(image => `<figure>${foto(image)}</figure>`).join("")}</div>`) : ""}
      ${secoes.avaliacoes && casa.avaliacoes.length ? secao("avaliacoes", `${textoSecao(textos.avaliacoes)}<p>${nota}</p>
        <ul class="avaliacoes">${casa.avaliacoes.map(a => `<li><blockquote><p>“${escape(a.texto)}”</p>
          <footer>${escape(a.autor)}${a.nota ? " · " + escape(a.nota) + " / 5" : ""} · ${link(a.fonte, "Fonte")}</footer></blockquote></li>`).join("")}</ul>`, "claro") : ""}
      ${mostraReservas ? secao("reservas", `<div class="duas"><div>
        ${textoSecao({ ...textos.reservas, titulo: secoes.reservas ? textos.reservas.titulo : textos.reservas.tituloEventos,
          texto: secoes.reservas ? textos.reservas.texto : "" })}
        ${secoes.eventos ? `<p class="eventos">${escape(textos.reservas.eventos)}</p>` : ""}
        ${reserva ? `<div class="acoes">${link(secoes.reservas ? reserva : whatsapp || telefone, secoes.reservas ? r.reservar : r.contato, "botao primario")}</div>` : ""}
        </div>${foto(casa.fotoReservas)}</div>`) : ""}
      ${secoes.localizacao ? secao("localizacao", `<div class="duas"><div>${textoSecao(textos.localizacao)}${bairro}
        <div class="acoes">${link(casa.mapa, r.mapa, "botao")}</div></div>
        <div><h3>${escape(textos.localizacao.horarios)}</h3>${horas}</div></div>`, "claro") : ""}
      ${mostraFaq ? secao("faq", `${textoSecao(textos.faq)}<div class="faq">${casa.faq.map(f =>
        `<details><summary>${escape(f.pergunta)}</summary><p>${escape(f.resposta)}</p></details>`).join("")}</div>`) : ""}
      ${secoes.cta ? secao("cta", `${textoSecao(textos.cta)}<div class="acoes">
        ${link(secoes.reservas && reserva, r.reservar, "botao primario") || link(secoes.localizacao ? "#localizacao" : casa.mapa, textos.localizacao.titulo, "botao")}
        ${link(delivery, r.delivery, "botao")}</div>`, "final") : ""}
    </main>
    <footer class="rodape"><div class="container">
      <a class="marca" href="#inicio"><span aria-hidden="true">◒</span>${escape(casa.nome)}</a>
      ${bairro}<p>${casa.funcionamento.map(h => escape(h.dias + " · " + h.horas)).join(" | ")}</p>
      ${redes ? `<div class="acoes">${redes}</div>` : ""}
    </div></footer>
    ${link(whatsapp, r.whatsapp, "botao primario whatsapp")}`;
  document.querySelector("#fallback").hidden = true;

  const menu = document.querySelector("#menu");
  const toggle = document.querySelector(".menu-toggle");
  if (menu) {
    function abrirMenu(aberto) {
      toggle.setAttribute("aria-expanded", String(aberto));
      menu.classList.toggle("aberto", aberto);
    }
    toggle.addEventListener("click", () => abrirMenu(!menu.classList.contains("aberto")));
    menu.addEventListener("click", event => {
      const ancora = event.target.closest("a");
      if (!ancora || !menu.classList.contains("aberto")) return;
      abrirMenu(false);
      const destino = document.querySelector(ancora.hash);
      destino.tabIndex = -1;
      destino.focus({ preventScroll: true });
    });
    document.querySelector(".cabecalho").addEventListener("keydown", event => {
      if (event.key !== "Escape" || !menu.classList.contains("aberto")) return;
      abrirMenu(false);
      toggle.focus();
    });
  }

  const tabs = [...site.querySelectorAll('[role="tab"]')];
  function selecionar(index) {
    tabs.forEach((tab, i) => {
      tab.tabIndex = i === index ? 0 : -1;
      tab.setAttribute("aria-selected", String(i === index));
      document.getElementById(tab.getAttribute("aria-controls")).hidden = i !== index;
    });
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => selecionar(i));
    tab.addEventListener("keydown", event => {
      const destinos = { ArrowRight: (i + 1) % tabs.length, ArrowLeft: (i + tabs.length - 1) % tabs.length,
        Home: 0, End: tabs.length - 1 };
      const index = destinos[event.key];
      if (typeof index !== "number") return;
      event.preventDefault();
      selecionar(index);
      tabs[index].focus();
    });
  });

  if (casa.heroAnimacao) iniciarAnimacao(casa.heroAnimacao);

  // Adaptação do Tostilho: cena fixa, progresso pela rolagem e quadro disponível mais próximo.
  // Amostra até 36 quadros e reduz a resolução para limitar a memória no notebook.
  async function iniciarAnimacao({ quadros, total, mensagens = [] }) {
    if (!quadros || !Number.isSafeInteger(total) || total < 1) return;
    const story = site.querySelector(".hero");
    const scene = story.querySelector(".cena");
    const slogan = scene.querySelector("#slogan");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;
    canvas.hidden = true;
    canvas.setAttribute("aria-hidden", "true");
    const progress = document.createElement("span");
    progress.className = "progresso";
    progress.setAttribute("aria-hidden", "true");
    scene.append(canvas, progress);
    const frames = new Map();
    const amostra = Math.min(36, total);
    const ordem = [...mensagens].sort((a, b) => a.inicio - b.inicio);
    let desenhado = -1;
    let agendado = false;

    function render() {
      agendado = false;
      const distancia = Math.max(1, story.offsetHeight - scene.offsetHeight);
      const pos = Math.max(0, Math.min(1, -story.getBoundingClientRect().top / distancia));
      const alvo = Math.round(pos * (total - 1));
      let perto = -1;
      for (const index of frames.keys()) {
        if (perto < 0 || Math.abs(index - alvo) < Math.abs(perto - alvo)) perto = index;
      }
      if (perto >= 0 && perto !== desenhado) {
        const frame = frames.get(perto);
        const largura = frame.width || frame.naturalWidth;
        const altura = frame.height || frame.naturalHeight;
        const escala = Math.min(1, 720 / Math.max(largura, altura));
        canvas.width = Math.max(1, Math.round(largura * escala));
        canvas.height = Math.max(1, Math.round(altura * escala));
        context.drawImage(frame, 0, 0, canvas.width, canvas.height);
        canvas.hidden = false;
        desenhado = perto;
      }
      const mensagem = ordem.reduce((texto, m) => pos >= m.inicio ? m.texto : texto, casa.slogan);
      if (slogan.textContent !== mensagem) slogan.textContent = mensagem;
      progress.style.transform = `scaleX(${pos})`;
    }

    function agendar() {
      if (agendado) return;
      agendado = true;
      requestAnimationFrame(render);
    }

    for (let i = 0; i < amostra; i++) {
      const index = Math.round(i * (total - 1) / Math.max(1, amostra - 1));
      const image = new Image();
      image.src = quadros + String(index + 1).padStart(3, "0") + ".jpg";
      try {
        await image.decode();
      } catch {
        continue;
      }

      let frame = image;
      if (typeof createImageBitmap === "function") {
        const escala = Math.min(1, 720 / Math.max(image.naturalWidth, image.naturalHeight));
        try {
          frame = await createImageBitmap(image, {
            resizeWidth: Math.max(1, Math.round(image.naturalWidth * escala)),
            resizeHeight: Math.max(1, Math.round(image.naturalHeight * escala))
          });
        } catch {
          // Um quadro decodificado também pode ser desenhado diretamente.
        }
      }
      frames.set(index, frame);
      if (frames.size === 1 && total > 1) {
        story.classList.add("is-playing");
        window.addEventListener("scroll", agendar, { passive: true });
        window.addEventListener("resize", agendar);
      }
      agendar();
    }
  }
})();
