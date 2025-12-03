document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('adminLoginForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const pwd = document.getElementById('adminPassword').value;
    if (pwd === '00') {
      localStorage.setItem('livroAmigoIsAdmin', 'true');
      window.location = 'admin.html';
    } else {
      alert('Senha incorreta.');
    }
  });
});
