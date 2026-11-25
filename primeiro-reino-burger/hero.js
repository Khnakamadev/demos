const casa = window.restaurante;
const variacao = casa.variacoes[Number(document.body.dataset.variacao)];
const corpo = document.body;
const selecione = (seletor) => document.querySelector(seletor);

document.title = casa.nome + " | " + casa.cidade;
for (const [chave, valor] of Object.entries({
  nome: casa.nome,
  cidade: casa.cidade,
  cozinha: casa.cozinha,
  horarios: casa.horarios,
  telefone: "WhatsApp " + casa.contato.telefone
})) {
  selecione("[data-" + chave + "]").textContent = valor;
}

corpo.dataset.tema = variacao.tema;
for (const chave of ["fundo", "texto", "destaque"]) {
  corpo.style.setProperty("--" + chave, variacao[chave]);
}
corpo.style.setProperty("--titulo", JSON.stringify(variacao.fonte));
const fonte = document.createElement("link");
fonte.rel = "stylesheet";
fonte.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=" +
  encodeURIComponent(variacao.fonte).replace(/%20/g, "+") + (corpo.classList.contains("v4") ? ":wght@800" : corpo.classList.contains("v3") ? ":wght@700" : "") +
  "&display=swap";
document.head.append(fonte);

const titulo = selecione("h1");
variacao.titulo.forEach((linha, index) => {
  if (index) titulo.append(corpo.classList.contains("v1") ? " " : document.createElement("br"));
  titulo.append(linha);
});
selecione(".subtitulo").textContent = variacao.subtitulo;
const imagem = selecione(".foto img");
imagem.alt = variacao.alt;
imagem.src = variacao.foto;
const legenda = selecione("figcaption");
legenda.textContent = variacao.legenda;
legenda.hidden = !variacao.legenda;

const real = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const pratos = selecione(".pratos");
for (const prato of casa.cardapio.flatMap(categoria => categoria.itens)) {
  const item = document.createElement("li");
  const nome = document.createElement("strong");
  const preco = document.createElement("span");
  const descricao = document.createElement("p");
  nome.textContent = prato.nome;
  preco.textContent = real.format(prato.preco);
  descricao.textContent = prato.descricao;
  item.append(nome, preco, descricao);
  pratos.append(item);
}

const link = selecione(".link-whatsapp");
link.href = "https://wa.me/" + casa.contato.whatsapp;
link.hidden = casa.contato.ficticio;
selecione("[data-aviso]").hidden = !casa.contato.ficticio;

for (const botao of document.querySelectorAll("[data-abrir]")) {
  botao.addEventListener("click", () => document.getElementById(botao.dataset.abrir).showModal());
}

