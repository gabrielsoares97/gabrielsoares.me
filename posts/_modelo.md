---
# Modelo de post. Arquivos que começam com _ não viram post.
# Para escrever um post novo: copie este arquivo e dê um nome sem acento e com hífens.
# O nome vira o endereço: posts/meu-post.md -> gabrielsoares.me/blog/meu-post/
#
# Depois rode no terminal, na pasta do site:
#   node gerar-blog.js --rascunhos   para ver a prévia no navegador
#   node gerar-blog.js               para gerar a versão de publicar (sem os rascunhos)
#
# titulo: aparece no Google e no topo do post (até uns 60 caracteres)
# descricao: aparece no Google e nos cards (até uns 155 caracteres)
# data: dia da publicação, no formato ano-mês-dia
# atualizado: opcional, se você revisar o post depois
# icone: um emoji para o card
# rascunho: true esconde o post; troque para false (ou apague a linha) para publicar
titulo: Título do post
descricao: Uma ou duas frases que resumem o post e convencem a pessoa a clicar.
data: 2026-10-28
icone: 📝
rascunho: true
---

Escreva aqui. Uma linha em branco separa um parágrafo do outro.

## Use ## para o título de cada parte

Com três ou mais títulos assim, o post ganha o quadro "Neste post" com atalhos.

### E ### para um subtítulo

- Listas com hífen.
- **Negrito**, *itálico* e [links](https://exemplo.com.br).
- Link para outro post: [texto do link](../nome-do-outro-post/)
- Link para a página inicial: [Monte sua missão](../../#contato)

1. Listas numeradas
2. também funcionam.

> Um parágrafo que começa com > vira um quadro de destaque, bom para dicas e resumos.
