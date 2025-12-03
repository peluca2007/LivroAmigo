document.addEventListener('DOMContentLoaded', () => {
  const BOOKS_KEY = 'livroAmigoUserBooks';

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

  // garantir livros padrão caso não existam
  if (getBooks().length === 0) {
    saveBooks(defaultBooks);
  }

  function renderFeatured() {
    const grid = document.getElementById('featuredGrid');
    if (!grid) return;
    const books = getBooks().filter(b => b && b.status === 'Disponível');
    const subset = books.slice(0, 3);
    // se nenhum livro disponível, manter o markup estático padrão
    if (subset.length === 0) return;

    grid.innerHTML = '';
    subset.forEach(b => {
      const article = document.createElement('article');
      article.className = 'book';
      article.innerHTML = `
        <img class="book-cover" src="${b.cover}" alt="Capa do livro ${b.title}" width="72" height="96" loading="lazy" decoding="async">
        <div class="book-info">
          <h3>${b.title}</h3>
          <p class="muted">${b.author}</p>
          <p>Condição: ${b.status}</p>
          <a class="link" href="livros.html">Detalhes</a>
        </div>
      `;
      grid.appendChild(article);
    });
  }

  renderFeatured();

  // re-renderizar quando outras páginas alterarem os livros
  window.addEventListener('booksUpdated', () => renderFeatured());
});
