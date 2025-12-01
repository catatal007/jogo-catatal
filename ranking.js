function updateRankingList(){
  const list = JSON.parse(localStorage.getItem('cma_ranking') || '[]');
  const ul = document.getElementById('rankingList');
  ul.innerHTML = '';
  if(list.length === 0){
    ul.innerHTML = '<li>Nenhum resultado salvo ainda.</li>'; return;
  }
  list.slice(0,10).forEach((item, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>#${i+1}</strong> ${item.name} — ${item.score} pontos <span style="color:var(--muted)">(${new Date(item.date).toLocaleString()})</span>`;
    ul.appendChild(li);
  });
}

function clearRanking(){
  localStorage.removeItem('cma_ranking');
  updateRankingList();
}

window.updateRankingList = updateRankingList;
updateRankingList();
