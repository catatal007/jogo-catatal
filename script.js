// IMAGENS DO CATATAL
const imagens = {
    neutro: "assets/img/catatal_neutro.png",
    bravo: "assets/img/catatal_bravo.png",
    explicando: "assets/img/catatal_explicando.png",
    feliz: "assets/img/catatal_feliz.png",
    pensando: "assets/img/catatal_pensando.png"
};

const catatal = document.getElementById("catatal");
const perguntaEl = document.getElementById("pergunta");
const opcoesEl = document.getElementById("opcoes");
const resultadoEl = document.getElementById("resultado");

// PERGUNTAS GERADAS AUTOMATICAMENTE
const perguntas = [
    {
        pergunta: "O que é cidadania?",
        opcoes: ["Direito de votar", "Ser rico", "Ter um carro"],
        correta: 0,
        explicacao: "Cidadania é exercer direitos e deveres na sociedade."
    },
    {
        pergunta: "O que é democracia?",
        opcoes: ["Governo do povo", "Governo militar", "Governo religioso"],
        correta: 0,
        explicacao: "Democracia significa que o povo participa das decisões."
    },
    {
        pergunta: "Qual órgão cria as leis?",
        opcoes: ["Congresso Nacional", "Presidência", "Prefeitura"],
        correta: 0,
        explicacao: "O Congresso é responsável por criar e aprovar leis."
    }
];

function carregarPergunta() {
    resultadoEl.textContent = "";

    catatal.src = imagens.neutro;

    const p = perguntas[Math.floor(Math.random() * perguntas.length)];

    perguntaEl.textContent = p.pergunta;

    opcoesEl.innerHTML = "";

    p.opcoes.forEach((opcao, index) => {
        const btn = document.createElement("button");
        btn.textContent = opcao;
        btn.onclick = () => resposta(index, p);
        opcoesEl.appendChild(btn);
    });
}

function resposta(index, perguntaObj) {
    if (index === perguntaObj.correta) {
        catatal.src = imagens.feliz;
        resultadoEl.textContent = "✔️ Acertou! " + perguntaObj.explicacao;
    } else {
        catatal.src = imagens.bravo;
        resultadoEl.textContent = "❌ Errou. " + perguntaObj.explicacao;
    }

    setTimeout(() => {
        catatal.src = imagens.pensando;
        setTimeout(carregarPergunta, 2000);
    }, 1500);
}

carregarPergunta();
