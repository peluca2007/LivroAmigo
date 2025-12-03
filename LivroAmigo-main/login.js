document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'livroAmigoUsers';
  const CURRENT_KEY = 'livroAmigoCurrentUser';
  const form = document.querySelector('form.form');

  function getUsers(){
    const u = localStorage.getItem(STORAGE_KEY);
    return u ? JSON.parse(u) : [];
  }

  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const senha = document.getElementById('senha').value;
    const users = getUsers();
    const user = users.find(u => u.email === email && u.senha === senha);
    if (!user) {
      alert('E-mail ou senha incorretos.');
      return;
    }

    localStorage.setItem(CURRENT_KEY, user.email);
    // redireciona para perfil
    window.location = 'perfil.html';
  });
});
