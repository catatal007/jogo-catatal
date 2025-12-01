// generate-questions.js — Netlify Function (independente)
// Recebe POST { subject, level, useAI }.
// Se OPENAI_API_KEY estiver definida e useAI true -> tenta chamar OpenAI.
// Caso contrário, gera offline no servidor (mesma lógica do frontend).

const fetch = require('node-fetch'); // Netlify Node suporta fetch nativo em versões recentes, mas keep for compatibility.

exports.handler = async (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const subject = body.subject || 'math';
    const level = body.level || 'easy';
    const useAI = !!body.useAI;

    // Se pediu IA e existe chave no ambiente, chama OpenAI
    if(useAI && process.env.OPENAI_API_KEY){
      const prompt = `Gere UMA pergunta de ${subject} nível ${level} (ensino médio). Retorne somente JSON com campos:
{"title":"", "explain":"", "question":"", "answer":"", "choices": null_or_array}
Sem texto extra.`;
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          'Authorization':'Bearer '+process.env.OPENAI_API_KEY
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages:[{role:'user', content: prompt}],
          max_tokens: 400,
          temperature: 0.7
        })
      });
      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content || null;
      if(content){
        try {
          const parsed = JSON.parse(content);
          return { statusCode: 200, body: JSON.stringify(parsed) };
        } catch(err){
          // fallback: return text as question
          return { statusCode: 200, body: JSON.stringify({ title:subject, explain:'', question:content, answer:'' }) };
        }
      }
    }

    // fallback offline generator (server-side)
    function autoGen(subject, level){
      if(subject === 'math'){
        if(level === 'easy'){
          const a = Math.floor(Math.random()*10)+1;
          const b = Math.floor(Math.random()*10)+1;
          return { title:'Soma', explain:'Some os números.', question:`Quanto é ${a} + ${b}?`, answer: String(a+b) };
        }
        if(level === 'medium'){
          const a = Math.floor(Math.random()*10)+1;
          const x = Math.floor(Math.random()*10);
          const b = a*x;
          return { title:'Equação linear', explain:'Resolva ax = b', question:`Resolva: ${a}x = ${b}. Qual é x?`, answer:String(x) };
        }
        return { title:'Quadrática', explain:'Encontre as raízes.', question:'Encontre as raízes de f(x)=x² - 5x + 6', answer:'2,3' };
      }

      if(subject === 'logic'){
        if(level === 'easy') return { title:'Sequência', explain:'Complete a sequência', question:'Complete: 2,4,6,8,__', answer:'10' };
        if(level === 'medium') return { title:'Booleano', explain:'Avalie AND/OR', question:'Se A=true e B=false, qual A && B?', answer:'false' };
        return { title:'Algoritmo', explain:'O que faz um loop for?', question:'O que um loop for faz?', answer:'Repetição' };
      }

      if(subject === 'web'){
        if(level === 'easy') return { title:'Tag HTML', explain:'Tag de parágrafo', question:'Qual tag cria parágrafo?', choices:['<div>','<p>','<h1>'], answer:'<p>' };
        if(level === 'medium') return { title:'CSS', explain:'Propriedade color', question:'Qual propriedade muda a cor do texto?', choices:['background','color','margin'], answer:'color' };
        return { title:'HTML semântico', explain:'Tag principal', question:'Qual tag representa conteúdo principal?', choices:['<main>','<section>','<article>'], answer:'<main>' };
      }

      return { title:'Pergunta', explain:'Gerada', question:'O que é programação?', answer:'Criar instruções para computador' };
    }

    const q = autoGen(subject, level);
    return { statusCode: 200, body: JSON.stringify(q) };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
