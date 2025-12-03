document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'livroAmigoUsers';
  const form = document.querySelector('form.form');

  function getUsers(){
    const u = localStorage.getItem(STORAGE_KEY);
    return u ? JSON.parse(u) : [];
  }

  function saveUsers(list){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const telefone = document.getElementById('telefone').value.trim();
    const tipo = document.getElementById('tipo').value;
    const local = document.getElementById('local').value.trim();
    const senha = document.getElementById('senha').value;
    const newsletter = !!document.querySelector('input[name="newsletter"]').checked;

    if (!nome || !email || !senha) {
      alert('Preencha nome, e-mail e senha.');
      return;
    }

    const users = getUsers();
    if (users.find(u => u.email === email)) {
      alert('Já existe um usuário cadastrado com este e-mail.');
      return;
    }

    const newUser = {
      nome,
      email,
      telefone,
      tipo,
      local,
      senha,
      newsletter,
      data: new Date().toLocaleString('pt-BR')
    };

    users.push(newUser);
    saveUsers(users);
    alert('Cadastro efetuado. Você será redirecionado para a tela de login.');
    window.location = 'login.html';
  });
});
