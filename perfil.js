document.addEventListener('DOMContentLoaded', () => {
  try {
    // startup debug info to help diagnose missing bindings
    try { console.debug('[perfil] init - currentUser', localStorage.getItem('livroAmigoCurrentUser')); } catch (e) {}
    try { console.debug('[perfil] init - livroAmigoUserBooks', JSON.parse(localStorage.getItem('livroAmigoUserBooks') || 'null')); } catch (e) { console.debug('[perfil] init - no books or parse error'); }
  
  const BOOKS_KEY = 'livroAmigoUserBooks';
  const LOAN_KEY = 'livroAmigoLoanRequests';
  const HISTORY_KEY = 'livroAmigoHistory';

  // Busca nome do usuário na página (tenta ler o título H2)
  const profileNameEl = document.querySelector('.profile-card h2');
  const profileMutedEl = document.querySelector('.profile-card p.muted');
  const CURRENT_KEY = 'livroAmigoCurrentUser';
  let currentUserName = 'Usuário';
  let currentUserEmail = null;

  // Se não houver usuário logado, cria usuário padrão de teste (Pedro Lucas)
  function ensureDefaultUser() {
    const email = localStorage.getItem(CURRENT_KEY);
    if (email) return; // já tem

    const defaultUser = {
      nome: 'Pedro Lucas',
      email: 'pedro@local',
      telefone: '',
      tipo: 'Voluntário',
      local: 'Paranapanema/SP',
      newsletter: false,
      data: new Date().toLocaleDateString()
    };

    const users = JSON.parse(localStorage.getItem('livroAmigoUsers') || '[]');
    const exists = users.find(u => u.email === defaultUser.email);
    if (!exists) {
      users.push(defaultUser);
      localStorage.setItem('livroAmigoUsers', JSON.stringify(users));
    }
    localStorage.setItem(CURRENT_KEY, defaultUser.email);
  }

  function getCurrentUser() {
    const email = localStorage.getItem(CURRENT_KEY);
    if (!email) return null;
    const users = JSON.parse(localStorage.getItem('livroAmigoUsers') || '[]');
    return users.find(u => u.email === email) || null;
  }

  // tenta carregar usuário atual — se não tiver, cria usuário padrão
  let currentUserObj = getCurrentUser();
  if (currentUserObj) {
    currentUserName = currentUserObj.nome;
    currentUserEmail = currentUserObj.email;
    if (profileNameEl) profileNameEl.textContent = currentUserObj.nome;
    if (profileMutedEl) profileMutedEl.textContent = `${currentUserObj.tipo || 'Membro'} · ${currentUserObj.local || ''}`;
  } else {
    ensureDefaultUser();
    currentUserObj = getCurrentUser();
    if (currentUserObj) {
      currentUserName = currentUserObj.nome;
      currentUserEmail = currentUserObj.email;
      if (profileNameEl) profileNameEl.textContent = currentUserObj.nome;
      if (profileMutedEl) profileMutedEl.textContent = `${currentUserObj.tipo || 'Membro'} · ${currentUserObj.local || ''}`;
    }
  }

  const initialBooks = [
    { id: 'b1', title: '1984', author: 'George Orwell', cover: 'Public/1984Livro.jpg', status: 'Disponível' },
    { id: 'b2', title: 'O Capital', author: 'Karl Marx', cover: 'Public/capitalLivro.webp', status: 'Disponível' },
    { id: 'b3', title: 'A Metamorfose', author: 'Franz Kafka', cover: 'Public/metamorfeseLivro.jpg', status: 'Disponível' }
  ];

  function getUserBooks() {
    const data = localStorage.getItem(BOOKS_KEY);
    return data ? JSON.parse(data) : null;
  }

  function saveUserBooks(list) {
    localStorage.setItem(BOOKS_KEY, JSON.stringify(list));
  }

  function getLoanRequests() {
    const data = localStorage.getItem(LOAN_KEY);
    return data ? JSON.parse(data) : [];
  }

  function saveLoanRequests(list) {
    localStorage.setItem(LOAN_KEY, JSON.stringify(list));
  }

  // Histórico por usuário (mapa email -> array de strings)
  function getAllHistories() {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : {};
  }

  function saveAllHistories(map) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(map));
  }

  function getHistoryFor(email) {
    const map = getAllHistories();
    return map[email] || [];
  }

  function addHistoryEntry(email, entry) {
    if (!email) return;
    const map = getAllHistories();
    map[email] = map[email] || [];
    // evitar duplicatas exatas
    if (!map[email].includes(entry)) {
      map[email].unshift(entry);
      saveAllHistories(map);
    }
  }

  function ensureDefaultHistory() {
    const map = getAllHistories();
    if (!map['pedro@local']) {
      map['pedro@local'] = [
        'Quarto de Despejo — 10/09/2025',
        'Vidas Secas — 22/08/2025'
      ];
      saveAllHistories(map);
    }
  }

  // Eventos: renderiza eventos em que o usuário confirmou presença
  function getEvents() {
    const raw = localStorage.getItem('livroAmigoEvents');
    return raw ? JSON.parse(raw) : [];
  }

  function saveEvents(list) {
    localStorage.setItem('livroAmigoEvents', JSON.stringify(list));
  }

  function formatShortDateLocal(dateStr) {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    } catch (e) {
      return dateStr;
    }
  }

  function renderMyEvents() {
    const listEl = document.getElementById('myEventsList');
    const noMsg = document.getElementById('noMyEvents');
    if (!listEl) return;
    const events = getEvents();
    // evitar duplicatas (caso algum evento com mesmo id apareça mais de uma vez no storage)
    const seen = new Set();
    // mostrar apenas eventos em que o usuário está inscrito e que não sejam passados
    const mine = events
      .filter(ev => {
        const attendees = ev.attendees || [];
        if (!attendees.includes(currentUserEmail)) return false;
        if (seen.has(ev.id)) return false;
        // ignorar eventos já ocorridos (aparecem no histórico)
        if (isPastDate(ev.date)) return false;
        seen.add(ev.id);
        return true;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    listEl.innerHTML = '';
    if (mine.length === 0) {
      if (noMsg) noMsg.style.display = 'block';
      return;
    } else {
      if (noMsg) noMsg.style.display = 'none';
    }

    mine.forEach(ev => {
      const li = document.createElement('li');
      const when = `${formatShortDateLocal(ev.date)}${ev.time ? ' · ' + ev.time : ''}`;
      const attendeesCount = (ev.attendees || []).length;
      li.innerHTML = `
        <time datetime="${ev.date}">${when}</time>
        <div>
          <strong>${ev.title}</strong>
          <p class="muted">${ev.location || ''} ${attendeesCount ? '· ' + attendeesCount + ' presente(s)' : ''}</p>
        </div>
        <div class="event-actions">
          <button class="btn btn--ghost" data-id="${ev.id}" data-action="cancel">Cancelar presença</button>
        </div>
      `;
      listEl.appendChild(li);
    });

    // handlers (rebind after render)
    listEl.querySelectorAll('button[data-action="cancel"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        if (!confirm('Cancelar presença neste evento?')) return;
        const events = getEvents();
        const ev = events.find(x => x.id === id);
        if (!ev) return;
        ev.attendees = (ev.attendees || []).filter(a => a !== currentUserEmail);
        saveEvents(events);
        renderMyEvents();
        // notify other scripts
        try { window.dispatchEvent(new Event('eventsUpdated')); } catch (err) {}
      });
    });

    // sem cálculo dinâmico de acento — layout por CSS
  }

  // utilitário: determina se uma data (YYYY-MM-DD) já passou (dia inteiro)
  function isPastDate(dateStr) {
    if (!dateStr) return false;
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    // zerar hora de hoje
    today.setHours(0,0,0,0);
    return d < today;
  }

  // migrar presenças em eventos já ocorridos para o histórico do usuário
  function migratePastAttendancesToHistory() {
    if (!currentUserEmail) return;
    const events = getEvents();
    events.forEach(ev => {
      const attendees = ev.attendees || [];
      if (attendees.includes(currentUserEmail) && isPastDate(ev.date)) {
        const when = `${formatShortDateLocal(ev.date)}${ev.time ? ' · ' + ev.time : ''}`;
        const entry = `Participou: ${ev.title} — ${when}`;
        // addHistoryEntry evita duplicata
        addHistoryEntry(currentUserEmail, entry);
      }
    });
  }

  // reagir a atualizações disparadas por events.js
  window.addEventListener('eventsUpdated', () => {
    migratePastAttendancesToHistory();
    renderMyEvents();
    renderHistory();
  });

  function renderHistory() {
    const listEl = document.getElementById('historyList');
    const btn = document.getElementById('viewAllHistory');
    if (!listEl) return;
    listEl.innerHTML = '';
    const history = getHistoryFor(currentUserEmail) || [];
    const short = history.slice(0, 2);
    if (short.length === 0) {
      listEl.innerHTML = '<li class="muted">Nenhum histórico ainda.</li>';
      if (btn) btn.style.display = 'none';
      return;
    }
    short.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      listEl.appendChild(li);
    });
    if (history.length > short.length) {
      if (btn) {
        btn.style.display = 'inline-block';
        btn.textContent = 'Ver tudo';
        btn.onclick = () => {
          listEl.innerHTML = '';
          history.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            listEl.appendChild(li);
          });
          btn.style.display = 'none';
        };
      }
    } else {
      if (btn) btn.style.display = 'none';
    }
  }

  function ensureBooks() {
    if (!getUserBooks()) {
      // definir dono padrão para os livros iniciais
      const withOwner = initialBooks.map(b => ({ ...b, owner: 'pedro@local' }));
      saveUserBooks(withOwner);
    }
  }

  function renderBooks() {
    const container = document.getElementById('meusLivros');
    if (!container) return;
    container.innerHTML = '';
    const books = getUserBooks() || [];
    // mostrar livros que o usuário possui ou que estejam emprestados para ele
    const owned = books.filter(b => b.owner === currentUserEmail || b.borrowedBy === currentUserEmail);

    owned.forEach(book => {
      const article = document.createElement('article');
      article.className = 'card book';

      article.innerHTML = `
        <img class="book-cover" src="${book.cover}" alt="Capa do livro ${book.title}" width="72" height="96" loading="lazy" decoding="async">
        <div class="book-info">
          <h3>${book.title}</h3>
          <p class="muted">${book.author}</p>
          <p style="margin:8px 0; font-weight:600">Status: <span class="book-status">${book.status}</span></p>
        </div>
      `;

      const info = article.querySelector('.book-info');

      // ações para o dono do livro
      if (book.owner && currentUserEmail && book.owner === currentUserEmail) {
        const actions = document.createElement('div');
        actions.style.marginTop = '8px';

        const statusEl = document.createElement('div');
        statusEl.innerHTML = `<small class="muted">Seu livro · Status: <span class="book-status">${book.status}</span></small>`;
        actions.appendChild(statusEl);

        // proprietários podem publicar se o admin já aprovou (status 'Aprovado')
        // ou se o livro foi retirado do catálogo anteriormente (status 'Retirado') — permitir recolocar
        if (book.status === 'Aprovado' || book.status === 'Retirado') {
          const pub = document.createElement('button');
          pub.className = 'btn';
          pub.style.marginLeft = '8px';
          pub.textContent = 'Publicar (disponibilizar)';
          pub.addEventListener('click', () => {
            const books = getUserBooks();
            const b = books.find(x => x.id === book.id);
            if (b) {
              b.status = 'Disponível';
              // se havia uma retirada marcada enquanto estava emprestado, limpar a marcação ao republicar
              if (b.ownerWithdrawn) delete b.ownerWithdrawn;
              saveUserBooks(books);
              renderBooks();
              try { window.dispatchEvent(new Event('booksUpdated')); } catch (err) {}
              alert('Livro publicado e disponível para empréstimo.');
            }
          });
          actions.appendChild(pub);
        } else {
          // se ainda estiver pendente, exibir apenas informação (sem permitir publicar)
          // nada a fazer aqui — o status já é mostrado no cartão
        }

        // botão para retirar do catálogo (mantém o livro no perfil)
        // permitir retirar também enquanto o livro estiver emprestado — nesse caso marcamos retirada pendente
        if (book.status === 'Aprovado' || book.status === 'Disponível' || book.status === 'Emprestado') {
          const retire = document.createElement('button');
          retire.className = 'btn btn--ghost';
          retire.style.marginLeft = '8px';
          retire.textContent = 'Retirar do catálogo';
          retire.addEventListener('click', () => {
            if (!confirm('Retirar este livro do catálogo?')) return;
            const books = getUserBooks() || [];
            const b = books.find(x => x.id === book.id);
            if (b) {
              if (b.status === 'Emprestado') {
                // marcar retirada pendente — quando o tomador devolver, o livro ficará Retirado
                b.ownerWithdrawn = true;
                saveUserBooks(books);
                addHistoryEntry(currentUserEmail || 'pedro@local', `${book.title} — marcado para retirada (após devolução) em ${new Date().toLocaleDateString()}`);
                renderBooks();
                try { window.dispatchEvent(new Event('booksUpdated')); } catch (err) {}
                alert('Livro marcado para retirada. Após a devolução ele não voltará ao catálogo.');
              } else {
                b.status = 'Retirado';
                // limpar flag caso exista
                if (b.ownerWithdrawn) delete b.ownerWithdrawn;
                saveUserBooks(books);
                addHistoryEntry(currentUserEmail || 'pedro@local', `${book.title} — retirado do catálogo em ${new Date().toLocaleDateString()}`);
                renderBooks();
                try { window.dispatchEvent(new Event('booksUpdated')); } catch (err) {}
                alert('Livro retirado do catálogo. Ele ainda aparece no seu perfil como privado.');
              }
            }
          });
          actions.appendChild(retire);
        }

        // botão para apagar permanentemente do perfil
        const del = document.createElement('button');
        del.className = 'btn btn--ghost';
        del.style.marginLeft = '8px';
        del.textContent = 'Apagar';
        del.addEventListener('click', () => {
          if (!confirm('Apagar permanentemente este livro? Esta ação não pode ser desfeita.')) return;
          const books = getUserBooks() || [];
          const idx = books.findIndex(x => x.id === book.id);
          if (idx > -1) {
            books.splice(idx, 1);
            saveUserBooks(books);
            addHistoryEntry(currentUserEmail || 'pedro@local', `${book.title} — apagado em ${new Date().toLocaleDateString()}`);
            renderBooks();
            try { window.dispatchEvent(new Event('booksUpdated')); } catch (err) {}
            alert('Livro apagado do seu perfil.');
          }
        });
        actions.appendChild(del);

        info.appendChild(actions);
      } else if (book.borrowedBy === currentUserEmail) {
        // livro emprestado para o usuário atual — mostrar como emprestado e permitir devolução
        const borrowerInfo = document.createElement('div');
        borrowerInfo.style.marginTop = '8px';
        borrowerInfo.innerHTML = `<small class="muted">Emprestado para você · Status: <strong>Emprestado</strong></small>`;
        info.appendChild(borrowerInfo);

        const actions = document.createElement('div');
        actions.style.marginTop = '8px';

        const returnBtn = document.createElement('button');
        returnBtn.className = 'btn';
        returnBtn.textContent = 'Devolver';
        returnBtn.addEventListener('click', () => {
          if (!confirm('Confirmar devolução deste livro?')) return;
          const books = getUserBooks() || [];
          const b = books.find(x => x.id === book.id);
          if (!b) return alert('Livro não encontrado.');
          const dateStr = new Date().toLocaleDateString();
          // decidir novo status: se dono marcou retirada enquanto emprestado, ficar Retirado ao devolver
          if (b.ownerWithdrawn) {
            b.borrowedBy = null;
            b.status = 'Retirado';
            delete b.ownerWithdrawn;
          } else {
            b.borrowedBy = null;
            b.status = 'Disponível';
          }
          saveUserBooks(books);

          // atualizar histórico do tomador e do dono
          try {
            addHistoryEntry(currentUserEmail, `Devolveu: ${b.title} — ${dateStr}`);
            addHistoryEntry(b.owner || 'unknown', `Recebeu de volta: ${b.title} — ${dateStr}`);
          } catch (err) { console.error('[perfil] history update on return failed', err); }

          // remover pedidos pendentes relacionados a este livro (se houver)
          try {
            const reqs = getLoanRequests().filter(r => r.bookId !== b.id);
            saveLoanRequests(reqs);
          } catch (err) {}

          renderBooks();
          try { window.dispatchEvent(new Event('booksUpdated')); } catch (err) {}
          alert('Livro devolvido. Obrigado!');
        });

        actions.appendChild(returnBtn);
        info.appendChild(actions);
      } else {
        // caso raro: livro incluído por filtro mas o usuário nem é dono nem tomador — oferecer solicitar
        const btn = document.createElement('button');
        btn.className = 'btn btn--ghost';
        btn.style.marginLeft = 'auto';
        btn.textContent = 'Solicitar empréstimo';
        btn.addEventListener('click', () => {
          // defensive: não permitir que o dono solicite seu próprio livro
          if (currentUserEmail && book.owner === currentUserEmail) {
            alert('Você não pode solicitar seu próprio livro.');
            return;
          }
          const req = {
            id: 'req_' + Date.now(),
            bookId: book.id,
            title: book.title,
            requester: currentUserName,
            requesterEmail: currentUserEmail,
            date: new Date().toLocaleDateString()
          };
          const added = (function(newReq){
            const requests = getLoanRequests();
            const email = newReq.requesterEmail || null;
            const exact = requests.find(r => r.bookId === newReq.bookId && (r.requesterEmail || null) === email);
            if (exact) return false;
            if (email) {
              const filtered = requests.filter(r => !(r.bookId === newReq.bookId && (r.requesterEmail == null)));
              filtered.push(newReq);
              saveLoanRequests(filtered);
              return true;
            } else {
              const hasRegistered = requests.some(r => r.bookId === newReq.bookId && r.requesterEmail);
              if (hasRegistered) return false;
              requests.push(newReq);
              saveLoanRequests(requests);
              return true;
            }
          })(req);
          if (!added) {
            alert('Pedido não criado (já existe outro pedido ativo para este livro).');
            return;
          }
          window.dispatchEvent(new Event('booksUpdated'));
          renderBooks();
          alert('Pedido de empréstimo enviado ao admin.');
        });
        info.appendChild(btn);
      }
      container.appendChild(article);
    });
  }

  // Criação de novo livro pelo usuário (aguarda aprovação do admin)
  const createForm = document.getElementById('createBookForm');
  if (createForm) {
    createForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('newTitle').value.trim();
      const author = document.getElementById('newAuthor').value.trim();
      const coverUrl = document.getElementById('newCover').value.trim();
      const fileInput = document.getElementById('newCoverFile');
      if (!title || !author) {
        alert('Preencha título e autor.');
        return;
      }

      function saveWithCover(cover) {
        const books = getUserBooks() || [];
        const book = {
          id: 'b' + Date.now(),
          title,
          author,
          cover,
          status: 'Pendente',
          owner: currentUserEmail || 'pedro@local'
        };
        books.push(book);
        saveUserBooks(books);
        try { window.dispatchEvent(new Event('booksUpdated')); } catch (err) {}
        // adiciona entrada ao histórico do usuário
        addHistoryEntry(currentUserEmail || 'pedro@local', `${title} — ${new Date().toLocaleDateString()}`);
        renderBooks();
        renderHistory();
        createForm.reset();
        alert('Livro cadastrado e aguardando aprovação do admin.');
      }

      if (fileInput && fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = function(evt) {
          const dataUrl = evt.target.result;
          saveWithCover(dataUrl);
        };
        reader.readAsDataURL(file);
      } else if (coverUrl) {
        saveWithCover(coverUrl);
      } else {
        saveWithCover('Public/placeholder.png');
      }
    });
  }

  // Inicializa
  ensureBooks();
  ensureDefaultHistory();
  renderBooks();
  // migrar eventos passados para histórico antes de renderizar
  migratePastAttendancesToHistory();
  renderHistory();
  // mostrar eventos confirmados do usuário ao carregar a página
  renderMyEvents();
  
  // reagir a atualizações de livros disparadas por admin.js (aprovação, rejeição, etc.)
  window.addEventListener('booksUpdated', () => {
    renderBooks();
    renderHistory();
  });
  } catch (err) {
    console.error('[perfil] fatal error during init', err);
    try { alert('Erro na página de perfil: ' + (err && err.message ? err.message : err)); } catch(e) {}
  }

});
