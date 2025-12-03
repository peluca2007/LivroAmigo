document.addEventListener('DOMContentLoaded', () => {
  const BOOKS_KEY = 'livroAmigoUserBooks';
  const LOAN_KEY = 'livroAmigoLoanRequests';

  function getLoanRequests() {
    const data = localStorage.getItem(LOAN_KEY);
    return data ? JSON.parse(data) : [];
  }

  function saveLoanRequests(list) {
    localStorage.setItem(LOAN_KEY, JSON.stringify(list));
  }

  // Adiciona um pedido seguindo regras básicas de deduplicação:
  // - Se um usuário cadastrado (com requesterEmail) cria um pedido, remover pedidos de visitantes (sem e-mail) para o mesmo bookId.
  // - Se um visitante (sem requesterEmail) cria um pedido, não adicionar se já existir pedido de usuário cadastrado para o mesmo livro.
  // - Evitar duplicatas exatas (mesmo bookId e mesmo requesterEmail).
  function addLoanRequest(newReq) {
    const reqs = getLoanRequests();
    const email = newReq.requesterEmail || null;
    // evita duplicata exata
    const exact = reqs.find(r => r.bookId === newReq.bookId && (r.requesterEmail || null) === email);
    if (exact) return false;

    if (email) {
      // remove pedidos de visitante para o mesmo livro
      const filtered = reqs.filter(r => !(r.bookId === newReq.bookId && (r.requesterEmail == null)));
      filtered.push(newReq);
      saveLoanRequests(filtered);
      return true;
    } else {
      // visitante: se já existir pedido de usuário cadastrado para este livro, não adicionar
      const hasRegistered = reqs.some(r => r.bookId === newReq.bookId && r.requesterEmail);
      if (hasRegistered) return false;
      reqs.push(newReq);
      saveLoanRequests(reqs);
      return true;
    }
  }

  function getCurrentUser() {
    const email = localStorage.getItem('livroAmigoCurrentUser');
    if (!email) return null;
    const usersRaw = localStorage.getItem('livroAmigoUsers') || '[]';
    try {
      const users = JSON.parse(usersRaw);
      return users.find(u => u.email === email) || { nome: 'Usuário', email };
    } catch (e) {
      return { nome: 'Usuário', email };
    }
  }

  function getBooks() {
    const data = localStorage.getItem(BOOKS_KEY);
    return data ? JSON.parse(data) : [];
  }

  function saveBooks(list) {
    localStorage.setItem(BOOKS_KEY, JSON.stringify(list));
  }

  const defaultBooks = [
    { id: 'b1', title: '1984', author: 'George Orwell', cover: 'Public/1984Livro.jpg', status: 'Disponível', owner: 'pedro@local' },
    { id: 'b2', title: 'O Capital', author: 'Karl Marx', cover: 'Public/capitalLivro.webp', status: 'Disponível', owner: 'pedro@local' },
    { id: 'b3', title: 'A Metamorfose', author: 'Franz Kafka', cover: 'Public/metamorfeseLivro.jpg', status: 'Disponível', owner: 'pedro@local' }
  ];

  if (getBooks().length === 0) {
    saveBooks(defaultBooks);
  }

  function render(filter = '') {
    const grid = document.getElementById('booksGrid');
    if (!grid) return;
    const books = getBooks().filter(b => b.status === 'Disponível');
    const text = filter.trim().toLowerCase();
    const filtered = books.filter(b => b.title.toLowerCase().includes(text) || b.author.toLowerCase().includes(text));

    grid.innerHTML = '';
    const currentUser = getCurrentUser();
    filtered.forEach(b => {
      const article = document.createElement('article');
      article.className = 'card book';
      article.innerHTML = `
        <img class="book-cover" src="${b.cover}" alt="Capa do livro ${b.title}" width="72" height="96" loading="lazy" decoding="async">
        <div class="book-info">
          <h3>${b.title}</h3>
          <p class="muted">${b.author}</p>
          <p>Condição: ${b.status}</p>
        </div>
      `;

      // ações: mostrar botão de solicitação quando o livro está disponível e o usuário atual não é o dono
      const info = article.querySelector('.book-info');
      try {
        if (b.status === 'Disponível' && (!currentUser || b.owner !== currentUser.email)) {
              const btn = document.createElement('button');
              btn.className = 'btn';
              btn.style.marginTop = '8px';
              btn.textContent = 'Solicitar empréstimo';
              btn.addEventListener('click', () => {
                try {
                  // defesa: proprietário não pode solicitar seu próprio livro
                  if (currentUser && b.owner === currentUser.email) {
                    alert('Você não pode solicitar seu próprio livro.');
                    return;
                  }

                  // verificação rápida de duplicata para o mesmo solicitante (lida com e-mails nulos)
                  const requests = getLoanRequests();
                  const myEmail = currentUser && currentUser.email ? currentUser.email : null;
                  const exists = requests.find(r => r.bookId === b.id && ((r.requesterEmail || null) === myEmail));
                  if (exists) {
                    alert('Você já solicitou este livro. Aguarde a resposta do administrador.');
                    return;
                  }

                  const requesterName = currentUser ? currentUser.nome : 'Visitante';
                  const requesterEmail = myEmail;
                  const req = {
                    id: 'req_' + Date.now(),
                    bookId: b.id,
                    title: b.title,
                    requester: requesterName,
                    requesterEmail: requesterEmail,
                    date: new Date().toLocaleString('pt-BR')
                  };

                  console.debug('[livros] creating loan request', req);
                  const added = addLoanRequest(req);
                  console.debug('[livros] addLoanRequest returned', added);
                  if (!added) {
                    alert('Pedido não criado (já existe outro pedido ativo para este livro).');
                    return;
                  }

                  // NÃO alterar `book.status` aqui — deixar disponibilidade até aprovação do admin
                  window.dispatchEvent(new Event('booksUpdated'));

                  // disable the button to give immediate feedback
                  btn.disabled = true;
                  btn.textContent = 'Pedido enviado';

                  alert('Pedido de empréstimo enviado. O administrador analisará o pedido.');
                } catch (err) {
                  console.error('[livros] erro ao criar pedido', err);
                  alert('Ocorreu um erro ao enviar o pedido. Veja o console para detalhes.');
                }
              });
          info.appendChild(btn);
        } else if (b.status === 'Pendente') {
          const badge = document.createElement('button');
          badge.className = 'btn btn--ghost';
          badge.style.marginTop = '8px';
          badge.disabled = true;
          badge.textContent = 'Pendente';
          info.appendChild(badge);
        } else if (b.status === 'Emprestado') {
          const badge = document.createElement('button');
          badge.className = 'btn btn--ghost';
          badge.style.marginTop = '8px';
          badge.disabled = true;
          badge.textContent = 'Emprestado';
          info.appendChild(badge);
        }
      } catch (err) {
        console.error('Error rendering book actions', err);
      }

      // details link
      const details = document.createElement('a');
      details.className = 'link';
      details.href = '#';
      details.textContent = 'Detalhes';
      info.appendChild(details);

      grid.appendChild(article);
    });
  }

  const search = document.getElementById('bookSearch');
  if (search) {
    search.addEventListener('input', (e) => render(e.target.value));
  }

  render();

  // reagir quando livros forem alterados por outras páginas (admin ou perfil)
  window.addEventListener('booksUpdated', () => render());
});
