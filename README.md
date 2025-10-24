# Livro Amigo — Biblioteca Comunitária

Website estático que conecta doadores, leitores e voluntários para incentivar o acesso à leitura na comunidade. Entrega as páginas: Início, Catálogo, Eventos, Cadastro, Login e Perfil, com foco em semântica, acessibilidade e validação W3C.

## Sumário
- [Objetivo e ODS](#objetivo-e-ods)
- [Requisitos atendidos (Projeto 1)](#requisitos-atendidos-projeto-1)
- [Páginas](#páginas)
- [Tecnologias](#tecnologias)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Como rodar localmente](#como-rodar-localmente)
- [Publicação no GitHub Pages](#publicação-no-github-pages)
- [Validação W3C (HTML e CSS)](#validação-w3c-html-e-css)
- [Acessibilidade aplicada](#acessibilidade-aplicada)
- [Integrantes](#integrantes)
- [Licença](#licença)

## Objetivo e ODS
- Facilitar trocas/doações de livros, organização de eventos e cadastro de voluntários.
- Alinha-se ao ODS 4 — Educação de Qualidade.

## Requisitos atendidos (Projeto 1)
- Página principal com: cabeçalho, rodapé, menu, 3+ imagens, 3+ links, 3+ cores, 2+ fontes e 2+ ícones.
- Página de cadastro com 5+ campos e botão que direciona ao login.
- HTML e CSS separados e prontos para validação W3C.
- Link para currículo/portfólio de integrante no rodapé da página principal.

## Páginas
- index.html — Home com carrossel, campanhas, destaques e próximos eventos.
- livros.html — Catálogo com título, autor, condição e link de detalhes.
- eventos.html — Lista de eventos com data e descrição.
- cadastro.html — Formulário com Nome, E-mail, Telefone, Tipo de usuário, Localização e newsletter. Envia para login.html.
- login.html — Interface de login e atalho para cadastro.
- perfil.html — Visão estática de histórico e “Meus livros”.

## Tecnologias
- HTML5 semântico, CSS3 modular (um único style.css).
- JavaScript leve para carrossel (script.js).
- Google Fonts (Poppins, Merriweather) e ícones Boxicons.
- Imagens em Public/.

## Estrutura do projeto
```
LivroAmigo/
├── index.html
├── livros.html
├── eventos.html
├── cadastro.html
├── login.html
├── perfil.html
├── style.css
├── script.js
├── README.md
└── Public/
    ├── 1984Livro.jpg
    ├── capitalLivro.webp
    ├── metamorfeseLivro.jpg
    ├── imagem fundo.jpg
    ├── imagem fundo criança.jpg
    ├── fundo imagem.jpg
    └── ChatGPT Image 8 de set. de 2025, 17_44_16.png
```

## Como rodar localmente
- Windows (VS Code):
  1. Abra a pasta no VS Code.
  2. Extensão recomendada: Live Server (Ritwick Dey).
  3. Clique com o botão direito em index.html > Open with Live Server.
- Sem extensões: clique duas vezes em index.html.

## Publicação no GitHub Pages
1. GitHub > Settings do repositório.
2. Aba “Pages” > Source: Deploy from a branch.
3. Branch: main (ou master) | Folder: /root.
4. Save. Aguarde o link “Your site is published at …”.
5. Teste as páginas: /, /livros.html, /eventos.html, /cadastro.html, /login.html, /perfil.html.

## Validação W3C (HTML e CSS)
- HTML: https://validator.w3.org/
  - Use “Validate by URL” após publicar no Pages ou “Validate by File Upload” localmente.
- CSS: https://jigsaw.w3.org/css-validator/
  - Valide o style.css pelo endereço do GitHub Pages ou upload.
- Dica: após ajustes, recarregue com Ctrl+F5 para limpar cache.

## Acessibilidade aplicada
- Skip link para conteúdo principal e foco visível em links/botões.
- Navegação por teclado, contraste revisado e tipografia legível.
- Imagens com alt adequado; logotipo com alt descritivo.
- Semântica: header, main, section, nav, footer, headings hierárquicos.

## Integrantes
- Pedro Lucas
  - GitHub: https://github.com/peluca2007
  - LinkedIn: https://www.linkedin.com/in/pedro-lucas-sales-larini-7a885b1a4/

Se houver mais integrantes, adicione-os aqui e no rodapé do index.html.

## Licença
Projeto comunitário, uso livre para fins educacionais e sociais.
