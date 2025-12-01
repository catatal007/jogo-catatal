// script.js — frontend que pede perguntas e mostra respostas

// estado simples
let score = Number(localStorage.getItem('cma_score')||0);
document.getElementById('score').innerText = score;

// start
document.getElementById('btnStart').addEventListener('click', ()=>{
  document.querySelector('.game-area').classList.remove('hidden');
  document.getElementById('btnNew').click();
});

// nova pergunta
document.getElementById('btnNew').addEventListener('click', async ()=>{
  const subject = document.getElementById('subjectSelect').value;
  const level = document.getElementById('levelSelect').value;
  const mode = document.getElementById('modeSelect').value;

  // UI reset
  document.getElementById('qTitle').innerText = 'Carregando...';
  document.getElementById('qExplain').innerText = '';
  document.getElementById('qText').innerText = '';
  document.getElementById('qChoices').innerHTML = '';
  document.getElementById('qInput').style.display = 'none';
  document.getElementById('feedback').innerText = '';

  if(mode === 'auto'){
    // gera localmente (sem API)
    const q = generateAutoQuestion(subject, level);
    showQuestion(q);
  } else {
    try {
      const res = await fetch('/.netlify/functions/generate-questions', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ subject, level, useAI: true })
      });
      if(!res.ok) throw new Error('Resposta do servidor: '+res.status);
      const q = await res.json();
      showQuestion(q);
    } catch(err){
      document.getElementById('qTitle').innerText = 'Erro ao obter pergunta (IA)';
      document.getElementById('feedback').innerText = err.message;
    }
  }
});

// mostra questão na UI
function showQuestion(q){
  document.getElementById('qTitle').innerText = q.title || 'Pergunta';
  document.getElementById('qExplain').innerText = q.explain || '';
  document.getElementById('qText').innerText = q.question || '';

  const choices = q.choices || q.options || null;
  const qChoices = document.getElementById('qChoices');
  qChoices.innerHTML = '';

  if(choices && Array.isArray(choices) && choices.length){
    choices.forEach(c=>{
      const btn = document.createElement('button');
      btn.innerText = c;
      btn.onclick = ()=> checkChoice(c, q.answer || q.correct);
      btn.className = 'choice-btn';
      qChoices.appendChild(btn);
    });
    document.getElementById('qInput').style.display = 'none';
  } else {
    // texto livre
    document.getElementById('qInput').style.display = 'flex';
    const btn = document.getElementById('btnCheckText');
    btn.onclick = ()=> {
      const val = document.getElementById('textAnswer').value.trim();
      checkText(val, String(q.answer || q.correct || ''));
    };
  }
}

// verificação para opções
function checkChoice(selected, correct){
  const fb = document.getElementById('feedback');
  if(String(selected).trim() === String(correct).trim()){
    fb.innerText = '✔ Correto!';
    addScore(10);
    triggerCat('celebrate');
  } else {
    fb.innerText = '✖ Incorreto. Resposta: ' + correct;
    triggerCat('sad');
  }
}

// verificação para respostas de texto livre
function checkText(ans, correct){
  const fb = document.getElementById('feedback');
  if(String(ans).replace(/\s+/g,'').toLowerCase() === String(correct).replace(/\s+/g,'').toLowerCase()){
    fb.innerText = '✔ Correto!';
    addScore(12);
    triggerCat('celebrate');
  } else {
    fb.innerText = '✖ Incorreto. Resposta: ' + correct;
    triggerCat('sad');
  }
}

// atualiza pontuação
function addScore(n){
  score += n;
  localStorage.setItem('cma_score', String(score));
  document.getElementById('score').innerText = score;
  // salvar no ranking local
  saveToRanking('Você', score);
}

// reações do Catatal (troca imagem momentânea)
function triggerCat(stateName){
  const hero = document.getElementById('catatalHero');
  if(!hero) return;
  if(stateName === 'celebrate'){ hero.src = 'catatal/celebrate.png'; setTimeout(()=>hero.src='catatal/normal.png',1400); }
  if(stateName === 'sad'){ hero.src = 'catatal/explaining.png'; setTimeout(()=>hero.src='catatal/normal.png',1400); }
}

// gerador offline simples (mesma lógica do servidor)
function generateAutoQuestion(subject, level){
  // exemplos simples por matéria e nível
  if(subject === 'math'){
    if(level === 'easy'){
      const a = Math.floor(Math.random()*10)+1;
      const b = Math.floor(Math.random()*10)+1;
      return { title: 'Soma', explain: 'Some os números.', question: `Quanto é ${a} + ${b}?`, answer: String(a+b) };
    } else if(level === 'medium'){
      const a = Math.floor(Math.random()*10)+1;
      const x = Math.floor(Math.random()*10);
      const b = a*x;
      return { title: 'Equação linear', explain: 'Resolva ax = b', question: `Resolva: ${a}x = ${b}. Qual é x?`, answer: String(x) };
    } else {
      return { title:'Quadrática', explain:'Encontre as raízes.', question:'Encontre as raízes de f(x)=x² - 5x + 6', answer:'2,3' };
    }
  }

  if(subject === 'logic'){
    if(level === 'easy'){
      return { title:'Sequência', explain:'Observe o padrão', question:'Complete: 2,4,6,8,__', answer:'10' };
    } else if(level === 'medium'){
      return { title:'Booleano', explain:'Veja operação AND', question:'Se A=true e B=false, A && B?', answer:'false' };
    } else {
      return { title:'Algoritmo', explain:'Pense passo a passo', question:'O que faz um loop for?', answer:'Repetição' };
    }
  }

  if(subject === 'web'){
    if(level === 'easy'){
      return { title:'Tag HTML', explain:'Tag de parágrafo', question:'Qual tag cria parágrafo?', choices:['<div>','<p>','<h1>'], answer:'<p>' };
    } else if(level === 'medium'){
      return { title:'CSS', explain:'Propriedade color', question:'Qual propriedade muda a cor do texto?', choices:['background','color','margin'], answer:'color' };
    } else {
      return { title:'HTML Avançado', explain:'Tags semânticas', question:'Qual tag representa conteúdo principal?', choices:['<main>','<section>','<article>'], answer:'<main>' };
    }
  }

  // fallback
  return { title:'Pergunta', explain:'Gerada', question:'O que é programação?', answer:'Criar instruções para computador' };
}

// ranking local: salva simples (insere ou atualiza)
function saveToRanking(name, scoreVal){
  const key = 'cma_ranking';
  const list = JSON.parse(localStorage.getItem(key) || '[]');
  list.push({name,score:scoreVal,date:new Date().toISOString()});
  // ordenar decrescente
  list.sort((a,b)=>b.score - a.score);
  localStorage.setItem(key, JSON.stringify(list.slice(0,50)));
  // atualiza ranking page se aberta
  try { if(window.updateRankingList) window.updateRankingList(); } catch(e){}
}

// init: optional pre-load first question
// document.getElementById('btnNew').click();
