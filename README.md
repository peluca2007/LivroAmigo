# 📚 Livro Amigo — Biblioteca Comunitária

**Livro Amigo** é uma aplicação web desenvolvida para gerenciar uma biblioteca comunitária. O projeto conecta leitores, permite o empréstimo de livros, a doação de obras e a organização de eventos culturais, promovendo o incentivo à leitura e a integração da comunidade.

> **Nota:** Este projeto utiliza `localStorage` para persistência de dados, simulando um banco de dados diretamente no navegador.

---

## 🚀 Funcionalidades

### 👤 Para Usuários (Membros)
* **Cadastro e Login:** Criação de conta e autenticação segura.
* **Catálogo de Livros:** Visualização de livros disponíveis com busca por título ou autor.
* **Solicitação de Empréstimo:** Usuários podem solicitar livros que não sejam seus.
* **Gestão de Acervo Pessoal:**
    * Adicionar seus próprios livros ao sistema (requer aprovação do admin).
    * Gerenciar status dos livros (Disponível, Emprestado, Retirado).
* **Perfil:** Histórico de leitura, livros emprestados e eventos confirmados.
* **Eventos:** Visualização e inscrição em eventos da comunidade (Rodas de leitura, feiras, etc.).

### 🛡️ Para Administradores
* **Gestão de Usuários:** Listar, editar e excluir usuários cadastrados.
* **Aprovação de Livros:** Validar novos livros cadastrados pelos usuários antes de irem para o catálogo público.
* **Gestão de Empréstimos:** Aprovar ou rejeitar pedidos de empréstimo entre usuários.
* **Gestão de Eventos:** Criar, editar e excluir eventos culturais.

---

## 🛠️ Tecnologias Utilizadas

* **HTML5:** Estrutura semântica das páginas.
* **CSS3:** Estilização responsiva e design moderno.
* **JavaScript (Vanilla):** Lógica de interação, manipulação do DOM e persistência de dados.
* **LocalStorage:** Utilizado para salvar usuários, livros, eventos e histórico sem necessidade de banco de dados externo.

---

## 📂 Estrutura do Projeto

Os principais arquivos do sistema são:

* `index.html`: Página inicial com destaques.
* `livros.html` / `livros.js`: Catálogo e lógica de busca/empréstimo.
* `perfil.html` / `perfil.js`: Painel do usuário (meus livros, histórico).
* `admin.html` / `admin.js`: Painel de controle geral.
* `cadastro.html` / `login.html`: Fluxo de autenticação.
* `style.css`: Folha de estilos global.

---

## ⚙️ Como Rodar o Projeto

1.  **Clone o repositório** ou baixe os arquivos ZIP.
2.  Abra a pasta do projeto.
3.  Execute o arquivo `index.html` em seu navegador de preferência (Chrome, Firefox, Edge).

Não é necessário instalar dependências (`npm`) ou configurar servidores, pois o projeto é estático e roda inteiramente no client-side.

---

## 🔐 Acesso ao Painel Admin

Para testar as funcionalidades administrativas:

1.  Acesse a página de **Login** e clique no link ou navegue para `admin-login.html`.
2.  Utilize a senha padrão configurada no código:
    * **Senha:** `00`

---

## 👨‍💻 Autor

Desenvolvido por **Pedro Lucas Sales Larini**.

* [GitHub](https://github.com/peluca2007)
* [LinkedIn](https://www.linkedin.com/in/pedro-lucas-sales-larini-7a885b1a4/)

---

<p align="center">
  Feito com ❤ pela comunidade para a comunidade.
</p>
