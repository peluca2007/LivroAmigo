document.addEventListener('DOMContentLoaded', () => {
  const EVENTS_KEY = 'livroAmigoEvents';

  function getEvents() {
    const data = localStorage.getItem(EVENTS_KEY);
    return data ? JSON.parse(data) : [];
  }

  function saveEvents(list) {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(list));
  }

  // Se não houver eventos no Local Storage, popular com eventos padrão (datas no futuro)
  if (getEvents().length === 0) {
    const defaults = [
      { id: 'ev_1', title: 'Roda de leitura: literatura brasileira', date: '2026-03-05', time: '19:00', location: 'Centro Comunitário', description: 'Traga seu livro favorito para compartilhar trechos e recomendações.', attendees: [] },
      { id: 'ev_2', title: 'Feira de troca de livros', date: '2026-04-12', time: '10:00', location: 'Praça Principal', description: 'Troque até 5 livros por novos títulos. Traga também doações.', attendees: [] },
      { id: 'ev_3', title: 'Mutirão de catalogação', date: '2026-05-23', time: '09:00', location: 'Sede da associação', description: 'Ajude a organizar e etiquetar o acervo da biblioteca comunitária.', attendees: [] },
      { id: 'ev_4', title: 'Oficina de encadernação artesanal', date: '2026-06-15', time: '14:00', location: 'Espaço Cultural', description: 'Aprenda técnicas básicas de encadernação para preservar livros.', attendees: [] },
      { id: 'ev_5', title: 'Noite de contação de histórias', date: '2026-09-10', time: '18:30', location: 'Biblioteca Municipal', description: 'Atividade para crianças e famílias com narrativas e músicas.', attendees: [] }
    ];
    saveEvents(defaults);
  }

  let events = getEvents();

  function formatShortDate(dateStr) {
    try {
      const d = new Date(dateStr);
      // Exibir dia, mês abreviado e ano: "05 mar 2026"
      let s = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
      // Normalizar para forma compacta sem palavras 'de' e sem pontos na abreviação do mês
      s = s.replace(/\s+de\s+/g, ' ').replace(/\./g, '');
      return s;
    } catch (e) {
      return dateStr;
    }
  }

  function isPastDate(dateStr) {
    if (!dateStr) return false;
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0,0,0,0);
    return d < today;
  }

  // Se não houver eventos futuros (no storage), acrescentar alguns defaults futuros (evita listas vazias)
  const futureDefaults = [
    { id: 'ev_1', title: 'Roda de leitura: literatura brasileira', date: '2026-03-05', time: '19:00', location: 'Centro Comunitário', description: 'Traga seu livro favorito para compartilhar trechos e recomendações.', attendees: [] },
    { id: 'ev_2', title: 'Feira de troca de livros', date: '2026-04-12', time: '10:00', location: 'Praça Principal', description: 'Troque até 5 livros por novos títulos. Traga também doações.', attendees: [] },
    { id: 'ev_3', title: 'Mutirão de catalogação', date: '2026-05-23', time: '09:00', location: 'Sede da associação', description: 'Ajude a organizar e etiquetar o acervo da biblioteca comunitária.', attendees: [] },
    { id: 'ev_4', title: 'Oficina de encadernação artesanal', date: '2026-06-15', time: '14:00', location: 'Espaço Cultural', description: 'Aprenda técnicas básicas de encadernação para preservar livros.', attendees: [] },
    { id: 'ev_5', title: 'Noite de contação de histórias', date: '2026-09-10', time: '18:30', location: 'Biblioteca Municipal', description: 'Atividade para crianças e famílias com narrativas e músicas.', attendees: [] }
  ];

  const hasUpcoming = events.some(ev => !isPastDate(ev.date));
  if (!hasUpcoming) {
    // mesclar defaults sem duplicar IDs
    const existing = events.slice();
    futureDefaults.forEach(d => {
      if (!existing.find(e => e.id === d.id)) existing.push(d);
    });
    saveEvents(existing);
    events = getEvents();
  }

  // Renderiza a lista completa (usada em eventos.html - elemento com id 'eventsList')
  const fullListEl = document.getElementById('eventsList');
  if (fullListEl) {
    const noMsg = document.getElementById('noEventsMsg');

    // sem cálculo dinâmico de acento aqui — usamos CSS estático

    function renderFullList() {
      const list = getEvents();
      fullListEl.innerHTML = '';
      if (list.length === 0) {
        if (noMsg) noMsg.style.display = 'block';
        return;
      } else {
        if (noMsg) noMsg.style.display = 'none';
      }

      // mostrar apenas eventos futuros (próximos)
      const upcoming = list.filter(ev => !isPastDate(ev.date)).sort((a,b) => new Date(a.date) - new Date(b.date));
      if (upcoming.length === 0) {
        if (noMsg) noMsg.style.display = 'block';
        return;
      }

      upcoming.forEach(ev => {
        const li = document.createElement('li');
        const attendees = ev.attendees || [];
        const count = attendees.length;
        const current = localStorage.getItem('livroAmigoCurrentUser');

        const btnHtml = current ? `<button class="btn" data-id="${ev.id}">${attendees.includes(current) ? 'Presente' : 'Confirmar presença'}</button>` : `<small class="muted">Faça login para confirmar presença</small>`;

        li.innerHTML = `
          <time datetime="${ev.date}"><span class="ev-date">${formatShortDate(ev.date)}</span><span class="ev-time">${ev.time || ''}</span></time>
          <div>
            <strong>${ev.title}</strong>
            <p class="muted">${ev.location || ''} · ${count} presente(s)</p>
            <p>${ev.description || ''}</p>
          </div>
          <div class="event-actions">${btnHtml}</div>
        `;
        fullListEl.appendChild(li);
      });

      // adicionar handlers para os botões de presença
      fullListEl.querySelectorAll('button[data-id]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.dataset.id;
          const email = localStorage.getItem('livroAmigoCurrentUser');
          if (!email) { alert('Faça login para confirmar presença.'); return; }

          const list2 = getEvents();
          const ev = list2.find(x => x.id === id);
          if (!ev) return;
          // bloquear inscrição em eventos passados (caso a data mude enquanto a página está aberta)
          if (isPastDate(ev.date)) { alert('Este evento já ocorreu — não é possível confirmar presença.'); return; }
          ev.attendees = ev.attendees || [];
          const idx = ev.attendees.indexOf(email);

          // se estiver adicionando (ainda não está inscrito), checar conflito de data
          if (idx === -1) {
            const conflict = list2.some(other => {
              if (!other.attendees || other.attendees.length === 0) return false;
              if (other.id === ev.id) return false;
              return other.date === ev.date && other.attendees.includes(email);
            });
            if (conflict) {
              alert('Você já confirmou presença em outro evento nesta mesma data.');
              return;
            }
            ev.attendees.push(email);
          } else {
            // remover inscrição
            ev.attendees.splice(idx, 1);
          }

          saveEvents(list2);
          // notificar outras partes do app (perfil, homepage)
          try { window.dispatchEvent(new Event('eventsUpdated')); } catch (err) {}
          // re-render
          renderFullList();
        });
      });
    }

    renderFullList();

    // sem handler de resize necessário para o layout padrão
  }

  // Renderiza pequenos resumos em qualquer <ul class="events"> sem id (ex.: homepage)
  document.querySelectorAll('ul.events').forEach(ul => {
    if (ul.id === 'eventsList') return; // já processado
    ul.innerHTML = '';
    const max = 2; // mostrar dois eventos na homepage
    const upcoming = events.filter(ev => !isPastDate(ev.date)).sort((a,b) => new Date(a.date) - new Date(b.date));
    const subset = upcoming.slice(0, max);
    subset.forEach(ev => {
      const attendees = ev.attendees || [];
      const count = attendees.length;
      const li = document.createElement('li');
      li.innerHTML = `
        <time datetime="${ev.date}"><span class="ev-date">${formatShortDate(ev.date)}</span><span class="ev-time">${ev.time || ''}</span></time>
        <div>
          <strong>${ev.title}</strong>
          <p class="muted">${ev.location || ''} ${ev.time ? '· ' + ev.time : ''} · ${count} presente(s)</p>
        </div>
      `;
      ul.appendChild(li);
    });

    // se não houver eventos, mostrar mensagem simples
    if (subset.length === 0) {
      const parent = ul.parentElement;
      if (parent) {
        const p = parent.querySelector('#noEventsMsg');
        if (p) p.style.display = 'block';
      }
    }
  });
});
