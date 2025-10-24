# Livro Amigo — Biblioteca Comunitária

Site estático para conectar doadores, leitores e voluntários. Inclui páginas de início, catálogo de livros, eventos, cadastro, login e perfil.

## Estrutura
- `index.html`: página inicial com carrossel e destaques.
- `livros.html`: catálogo de livros.
- `eventos.html`: lista de eventos.
- `cadastro.html`: formulário de cadastro.
- `login.html`: página de login (demo).
- `perfil.html`: visão geral do usuário.
- `Public/`: imagens utilizadas no site.
- `style.css`: estilos globais e componentes (hero, cards, carrossel etc.).
- `script.js`: carrossel da home (auto-play, setas, pontos, acessível).

## Rodando localmente
Basta abrir `index.html` no navegador.

## Publicando no GitHub Pages
1. No GitHub, vá em Settings → Pages.
2. Em "Build and deployment", escolha "Deploy from a branch".
3. Selecione `main` e a pasta `/ (root)`.
4. Salve. A URL ficará algo como:
   `https://peluca2007.github.io/LivroAmigo-main/`

Dicas:
- Use caminhos relativos (já estão configurados) e respeite maiúsculas/minúsculas.
- Evite nomes de arquivos com espaços e acentos se notar falhas de carregamento.

## Acessibilidade
- Páginas com skip-link, landmarks (`role="main"`), focos visíveis.
- Formulários com dicas (`aria-describedby`).

## Licença
Projeto comunitário, uso livre para fins educacionais e sociais.
