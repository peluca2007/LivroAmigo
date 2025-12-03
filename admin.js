document.addEventListener('DOMContentLoaded', () => {
  // Stable admin.js implementation: storage helpers, rendering and delegation.
  try {
    const STORAGE_KEY = 'livroAmigoUsers';
    const LOAN_KEY = 'livroAmigoLoanRequests';
    const BOOKS_KEY = 'livroAmigoUserBooks';
    const EVENTS_KEY = 'livroAmigoEvents';

    const form = document.getElementById('adminForm');
    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const telefoneInput = document.getElementById('telefone');
    const tipoInput = document.getElementById('tipo');
    const localInput = document.getElementById('local');
    const searchInput = document.getElementById('search');
    const userList = document.getElementById('userList');
    const btnLimpar = document.getElementById('btnLimpar');
    const btnExcluirTodos = document.getElementById('btnExcluirTodos');
    const emptyMessage = document.getElementById('emptyMessage');

    // simple auth guard
    if (localStorage.getItem('livroAmigoIsAdmin') !== 'true') {
      window.location = 'admin-login.html';
      return;
    }

    // --- Storage helpers ---
    function getUsers() {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (e) { return []; }
    }
    function saveUsers(list) { localStorage.setItem(STORAGE_KEY, JSON.stringify(list || [])); }

    function getLoanRequests() { try { return JSON.parse(localStorage.getItem(LOAN_KEY) || '[]'); } catch (e) { return []; } }
    function saveLoanRequests(list) { localStorage.setItem(LOAN_KEY, JSON.stringify(list || [])); }

    function getUserBooks() { try { return JSON.parse(localStorage.getItem(BOOKS_KEY) || '[]'); } catch (e) { return []; } }
    function saveUserBooks(list) { localStorage.setItem(BOOKS_KEY, JSON.stringify(list || [])); }

    function getEvents() { try { return JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]'); } catch (e) { return []; } }
    function saveEvents(list) { localStorage.setItem(EVENTS_KEY, JSON.stringify(list || [])); }

    // utils
    function normalizeEmail(e) { return (e || '').toString().trim().toLowerCase(); }

    // --- Users ---
    let editingUserIndex = -1;
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
    const defaultSubmitText = submitBtn ? submitBtn.textContent : 'Salvar';

    function renderUsers(filterText = '') {
      const users = getUsers();
      if (!userList) return;
      userList.innerHTML = '';
      const text = (filterText || '').toLowerCase();
      const filtered = users.filter(u => {
        return (u.nome || '').toLowerCase().includes(text) || (u.email || '').toLowerCase().includes(text);
      });
      if (filtered.length === 0) {
        if (emptyMessage) emptyMessage.style.display = 'block';
      } else {
        if (emptyMessage) emptyMessage.style.display = 'none';
      }
      filtered.forEach(u => {
        const li = document.createElement('li');
        li.innerHTML = `
          <div>
            <strong>${u.nome || ''}</strong>
            <p class="muted">${u.email || ''}</p>
            <p style="font-size:0.85rem;margin-top:4px;">Cadastrado em: ${u.data || ''}</p>
          </div>
          <div class="event-actions">
            <button class="btn btn--ghost btn--sm edit-btn" data-email="${u.email}">Editar</button>
            <button class="btn btn--ghost btn--sm delete-btn" data-email="${u.email}">Excluir</button>
          </div>
        `;
        userList.appendChild(li);
      });
    }

    function startUserEdit(email) {
      const ne = normalizeEmail(email);
      if (!ne) return alert('E-mail inválido');
      const users = getUsers();
      const idx = users.findIndex(u => normalizeEmail(u.email) === ne);
      if (idx === -1) return alert('Usuário não encontrado');
      const user = users[idx];
      const listItems = Array.from(document.querySelectorAll('#userList li'));
      const li = listItems.find(liEl => {
        const btn = liEl.querySelector('button.edit-btn');
        return btn && normalizeEmail(btn.dataset.email) === ne;
      });
      if (!li) return alert('Elemento do usuário não encontrado na lista.');

      li.innerHTML = `
        <form class="edit-user-form" data-email="${(user.email||'').replace(/"/g,'&quot;')}">
          <label>Nome <input name="nome" value="${(user.nome||'').replace(/"/g,'&quot;')}"></label>
          <label>E-mail <input name="email" type="email" value="${(user.email||'').replace(/"/g,'&quot;')}"></label>
          <label>Telefone <input name="telefone" value="${(user.telefone||'').replace(/"/g,'&quot;')}"></label>
          <label>Tipo <select name="tipo">
            <option${(user.tipo==='Membro'?' selected':'')}>Membro</option>
            <option${(user.tipo==='Voluntário'?' selected':'')}>Voluntário</option>
            <option${(user.tipo==='Doador'?' selected':'')}>Doador</option>
            <option${(user.tipo==='Leitor'?' selected':'')}>Leitor</option>
          </select></label>
          <label>Local <input name="local" value="${(user.local||'').replace(/"/g,'&quot;')}"></label>
          <div style="margin-top:8px;display:flex;gap:8px;">
            <button class="btn" type="submit">Salvar</button>
            <button class="btn btn--ghost" type="button" data-action="cancel">Cancelar</button>
          </div>
        </form>
      `;

      const formEl = li.querySelector('.edit-user-form');
      formEl.addEventListener('submit', ev => {
        ev.preventDefault();
        const fd = new FormData(formEl);
        const nome = (fd.get('nome')||'').trim();
        const emailNew = (fd.get('email')||'').trim().toLowerCase();
        const telefone = (fd.get('telefone')||'').trim();
        const tipo = (fd.get('tipo')||'').trim() || 'Membro';
        const local = (fd.get('local')||'').trim();
        if (!nome || !emailNew) return alert('Preencha nome e e-mail.');
        const usersMap = getUsers();
        const found = usersMap.findIndex(u => normalizeEmail(u.email) === ne);
        if (found === -1) return alert('Usuário não encontrado ao salvar.');
        usersMap[found].nome = nome;
        usersMap[found].email = emailNew;
        usersMap[found].telefone = telefone;
        usersMap[found].tipo = tipo;
        usersMap[found].local = local;
        usersMap[found].data = usersMap[found].data || new Date().toLocaleString('pt-BR');
        saveUsers(usersMap);
        renderUsers(searchInput ? searchInput.value : '');
        alert('Usuário atualizado com sucesso!');
      });
    }

    // --- Loan Requests ---
    function renderLoanRequests() {
      const listEl = document.getElementById('loanRequestsList');
      const noReq = document.getElementById('noLoanRequests');
      if (!listEl) return;
      const reqs = getLoanRequests();
      listEl.innerHTML = '';
      if (!reqs || reqs.length === 0) {
        if (noReq) noReq.style.display = 'block';
      } else {
        if (noReq) noReq.style.display = 'none';
      }
      reqs.forEach((r, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `
          <div>
            <strong>${r.title}</strong>
            <p class="muted">Pedido por: ${r.requester}${r.requesterEmail ? ' · ' + r.requesterEmail : ''} · ${r.date}</p>
          </div>
          <div class="event-actions">
            <button class="btn" data-idx="${idx}" data-action="approve">Aprovar</button>
            <button class="btn btn--outline" data-idx="${idx}" data-action="reject">Rejeitar</button>
          </div>
        `;
        listEl.appendChild(li);
      });
      listEl.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const action = e.currentTarget.dataset.action;
          const idx = Number(e.currentTarget.dataset.idx);
          if (action === 'approve') return approveRequest(idx);
          if (action === 'reject') return rejectRequest(idx);
        });
      });
    }

    function approveRequest(index) {
      if (!confirm('Aprovar empréstimo?')) return;
      const reqs = getLoanRequests();
      const req = reqs[index];
      if (!req) return;
      const books = getUserBooks();
      const book = books.find(b => b.id === req.bookId);
      if (book) {
        book.status = 'Emprestado';
        book.borrowedBy = req.requesterEmail || req.requester || null;
        saveUserBooks(books);
      }
      reqs.splice(index, 1);
      saveLoanRequests(reqs);
      renderLoanRequests();
      try { window.dispatchEvent(new Event('booksUpdated')); } catch (e) {}
      renderUsers(searchInput ? searchInput.value : '');
      alert('Empréstimo aprovado.');
    }

    function rejectRequest(index) {
      if (!confirm('Rejeitar pedido de empréstimo?')) return;
      const reqs = getLoanRequests();
      reqs.splice(index, 1);
      saveLoanRequests(reqs);
      renderLoanRequests();
    }

    // --- Book approvals ---
    function renderBookApprovals() {
      const listEl = document.getElementById('bookApprovalList');
      const noMsg = document.getElementById('noBookApprovals');
      if (!listEl) return;
      const all = getUserBooks() || [];
      const books = all.filter(b => b && b.status === 'Pendente');
      listEl.innerHTML = '';
      if (books.length === 0) { if (noMsg) noMsg.style.display = 'block'; } else { if (noMsg) noMsg.style.display = 'none'; }
      const users = getUsers();
      books.forEach(book => {
        const owner = users.find(u => u.email === book.owner);
        const li = document.createElement('li');
        li.innerHTML = `
          <div>
            <strong>${book.title}</strong>
            <p class="muted">${book.author} · Enviado por: ${owner ? owner.nome : book.owner}</p>
          </div>
          <div class="event-actions">
            <button class="btn" data-id="${book.id}" data-action="approve">Aprovar</button>
            <button class="btn btn--outline" data-id="${book.id}" data-action="reject">Rejeitar</button>
          </div>
        `;
        listEl.appendChild(li);
      });
      listEl.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const action = e.currentTarget.dataset.action;
          const id = e.currentTarget.dataset.id;
          if (action === 'approve') return approveBook(id);
          if (action === 'reject') return rejectBook(id);
        });
      });
    }

    function approveBook(id) {
      if (!confirm('Aprovar este livro?')) return;
      const books = getUserBooks();
      const b = books.find(x => x.id === id);
      if (!b) return alert('Livro não encontrado');
      b.status = 'Aprovado';
      saveUserBooks(books);
      try { window.dispatchEvent(new Event('booksUpdated')); } catch (e) {}
      renderBookApprovals();
      alert('Livro marcado como aprovado.');
    }

    function rejectBook(id) {
      if (!confirm('Rejeitar/remover este livro?')) return;
      const books = getUserBooks();
      const idx = books.findIndex(x => x.id === id);
      if (idx === -1) return;
      books.splice(idx, 1);
      saveUserBooks(books);
      renderBookApprovals();
    }

    // --- Events ---
    let eventFilter = 'future';
    function isPastDate(dateStr) { if (!dateStr) return false; const d = new Date(dateStr + 'T00:00:00'); const t = new Date(); t.setHours(0,0,0,0); return d < t; }
    function formatShortDate(dateStr) { try { const d = new Date(dateStr); return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/\./g,''); } catch (e) { return dateStr; } }

    function renderEvents() {
      const listEl = document.getElementById('eventsList');
      const noMsg = document.getElementById('noEventsMessage');
      if (!listEl) return;
      const events = getEvents() || [];
      let shown = events.slice();
      if (eventFilter === 'future') shown = events.filter(ev => !isPastDate(ev.date));
      if (eventFilter === 'past') shown = events.filter(ev => isPastDate(ev.date));
      listEl.innerHTML = '';
      if (shown.length === 0) { if (noMsg) noMsg.style.display = 'block'; } else { if (noMsg) noMsg.style.display = 'none'; }
      shown.forEach(ev => {
        const attendees = (ev.attendees || []).length;
        const li = document.createElement('li');
        li.setAttribute('data-id', ev.id);
        li.innerHTML = `
          <time datetime="${ev.date}"><span class="ev-date">${formatShortDate(ev.date)}</span><span class="ev-time">${ev.time || ''}</span></time>
          <div>
            <strong>${ev.title}</strong>
            <p class="muted">${ev.location || ''} · ${attendees} presente(s)</p>
            <p>${ev.description || ''}</p>
          </div>
          <div class="event-actions">
            <button class="btn" data-id="${ev.id}" data-action="attendees">Ver presentes</button>
            <button class="btn" data-id="${ev.id}" data-action="edit">Editar</button>
            <button class="btn btn--outline" data-id="${ev.id}" data-action="delete">Apagar</button>
          </div>
        `;
        listEl.appendChild(li);
      });
      listEl.querySelectorAll('button').forEach(btn => btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action; const id = e.currentTarget.dataset.id;
        if (action === 'delete') return deleteEvent(id);
        if (action === 'attendees') return showAttendees(id);
        if (action === 'edit') return startEventEdit(id);
      }));
    }

    function deleteEvent(id) { if (!confirm('Apagar este evento?')) return; const evs = getEvents(); const idx = evs.findIndex(x => x.id === id); if (idx === -1) return; evs.splice(idx,1); saveEvents(evs); try { window.dispatchEvent(new Event('eventsUpdated')); } catch (e) {} renderEvents(); }
    function showAttendees(id) { const evs = getEvents(); const ev = evs.find(x => x.id === id); if (!ev) return alert('Evento não encontrado.'); const att = ev.attendees || []; if (att.length === 0) return alert('Nenhum participante confirmado.'); const users = getUsers(); alert('Participantes:\n\n' + att.map(a => { const u = users.find(x => x.email===a); return u? `${u.nome} <${a}>` : a; }).join('\n')); }
    function startEventEdit(id) { const evs = getEvents(); const ev = evs.find(x => x.id===id); if (!ev) return; const li = document.querySelector(`li[data-id="${id}"]`); if (!li) return; li.innerHTML = `
        <form class="edit-event-form" data-id="${id}">
          <label>Título <input name="title" value="${(ev.title||'').replace(/"/g,'&quot;')}"></label>
          <label>Data <input name="date" type="date" value="${ev.date}"></label>
          <label>Hora <input name="time" value="${(ev.time||'').replace(/"/g,'&quot;')}"></label>
          <label>Local <input name="location" value="${(ev.location||'').replace(/"/g,'&quot;')}"></label>
          <label>Descrição <textarea name="description">${(ev.description||'')}</textarea></label>
          <div style="margin-top:8px;display:flex;gap:8px;"><button class="btn" type="submit">Salvar</button><button class="btn btn--ghost" type="button" data-action="cancel">Cancelar</button></div>
        </form>
      `;
      const formEl = li.querySelector('.edit-event-form');
      formEl.addEventListener('submit', e => { e.preventDefault(); const fd = new FormData(formEl); ev.title = (fd.get('title')||'').trim(); ev.date = fd.get('date')||ev.date; ev.time = fd.get('time')||''; ev.location = (fd.get('location')||'').trim(); ev.description = (fd.get('description')||'').trim(); saveEvents(evs); try { window.dispatchEvent(new Event('eventsUpdated')); } catch (e) {} renderEvents(); });
      li.querySelector('button[data-action="cancel"]').addEventListener('click', () => renderEvents());
    }

    // --- Admin form handling (create/update users) ---
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = nomeInput.value.trim();
        const email = (emailInput.value || '').trim().toLowerCase();
        const telefone = telefoneInput ? telefoneInput.value.trim() : '';
        const tipo = tipoInput ? tipoInput.value : '';
        const local = localInput ? localInput.value.trim() : '';
        if (!nome || !email) return alert('Preencha nome e e-mail.');
        const users = getUsers();
        if (editingUserIndex >= 0 && editingUserIndex < users.length) {
          users[editingUserIndex].nome = nome; users[editingUserIndex].email = email; users[editingUserIndex].telefone = telefone; users[editingUserIndex].tipo = tipo; users[editingUserIndex].local = local; users[editingUserIndex].data = users[editingUserIndex].data || new Date().toLocaleString('pt-BR'); saveUsers(users); editingUserIndex = -1; if (submitBtn) submitBtn.textContent = defaultSubmitText; form.reset(); renderUsers(searchInput ? searchInput.value : ''); alert('Usuário atualizado com sucesso!'); return;
        }
        const newUser = { nome, email, telefone, tipo: tipo || 'Membro', local: local || '', data: new Date().toLocaleString('pt-BR') };
        users.push(newUser); saveUsers(users); form.reset(); renderUsers(searchInput ? searchInput.value : ''); alert('Usuário cadastrado com sucesso!');
      });
    }

    function deleteUserByEmail(email) {
      if (!email) return; const ne = normalizeEmail(email); const users = getUsers(); const idx = users.findIndex(u => normalizeEmail(u.email) === ne); if (idx === -1) return alert('Usuário não encontrado'); if (!confirm('Tem certeza que deseja excluir este usuário?')) return; users.splice(idx,1); saveUsers(users); renderUsers(searchInput ? searchInput.value : '');
    }

    if (btnExcluirTodos) btnExcluirTodos.addEventListener('click', () => { const users = getUsers(); if (users.length === 0) return alert('A lista já está vazia.'); if (!confirm('ATENÇÃO: Isso apagará TODOS os usuários cadastrados. Deseja continuar?')) return; localStorage.removeItem(STORAGE_KEY); renderUsers(); });
    if (btnLimpar) btnLimpar.addEventListener('click', () => { if (form) form.reset(); if (nomeInput) nomeInput.focus(); editingUserIndex = -1; if (submitBtn) submitBtn.textContent = defaultSubmitText; });
    if (searchInput) searchInput.addEventListener('input', e => renderUsers(e.target.value));

    // initial render
    renderUsers(); renderLoanRequests(); renderBookApprovals(); renderEvents();

    // single delegated handler for userList to handle edit/delete/cancel
    if (userList) {
      userList.addEventListener('click', ev => {
        const btn = ev.target.closest('button'); if (!btn) return;
        if (btn.dataset && btn.dataset.action === 'cancel') { renderUsers(searchInput ? searchInput.value : ''); return; }
        if (btn.classList.contains('edit-btn')) { const em = btn.dataset.email; startUserEdit(em); return; }
        if (btn.classList.contains('delete-btn')) { const em = btn.dataset.email; deleteUserByEmail(em); return; }
      });
    }

    // event filters controls (if present)
    const btnAll = document.getElementById('filterAll'); const btnFuture = document.getElementById('filterFuture'); const btnPast = document.getElementById('filterPast');
    function setFilter(f) { eventFilter = f; renderEvents(); [btnAll, btnFuture, btnPast].forEach(b => { if (b) b.classList.remove('active-filter'); }); const map = { all: btnAll, future: btnFuture, past: btnPast }; if (map[f]) map[f].classList.add('active-filter'); }
    if (btnAll) btnAll.addEventListener('click', () => setFilter('all')); if (btnFuture) btnFuture.addEventListener('click', () => setFilter('future')); if (btnPast) btnPast.addEventListener('click', () => setFilter('past')); setFilter('future');

    // logout button
    const btnLogout = document.getElementById('btnLogout'); if (btnLogout) btnLogout.addEventListener('click', () => { localStorage.removeItem('livroAmigoIsAdmin'); window.location = 'admin-login.html'; });

    // react to cross-page events
    window.addEventListener('eventsUpdated', () => { renderEvents(); renderLoanRequests(); renderBookApprovals(); renderUsers(searchInput ? searchInput.value : ''); });
    window.addEventListener('booksUpdated', () => { renderBookApprovals(); renderUsers(searchInput ? searchInput.value : ''); });

  } catch (err) {
    console.error('[admin] fatal error during init', err);
    try { alert('Erro no painel admin: ' + (err && err.message ? err.message : err)); } catch (e) {}
  }
});
