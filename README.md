# gabrielsoares.me

Meu site pessoal e portfólio, com cara de jogo 8-bit. No ar em **[gabrielsoares.me](https://gabrielsoares.me)**.

![Tela inicial do site](prints/capa.jpg)

## O que tem nele

- **Ficha de personagem**: nível e barra de XP calculados pelos anos de carreira.
- **Seções como fases**: sobre, serviços, conquistas, projetos, jornada e inventário de ferramentas.
- **Conquistas secretas** para o visitante, salvas no navegador, com painel de troféus e botão para desafiar um amigo.
- **Moedas escondidas** pela página e um contador de likes compartilhado entre todos os visitantes.
- **Fase bônus "Bug em produção"**: um minijogo de nave desenhado em canvas.
- **Sons 8-bit** gerados na hora pela Web Audio API, sem arquivos de áudio.
- **Dia e noite**: nuvens de pixel no modo claro, estrelas no escuro.
- **SEO local**: dados estruturados (schema.org), sitemap e robots.txt.

## Como é feito

HTML, CSS e JavaScript puros, sem framework e sem etapa de build. Um pouco de PHP só para o contador de likes.

| Arquivo | Para que serve |
|---|---|
| `dados.js` | Todo o conteúdo do site (textos, projetos, conquistas, links). Editar aqui atualiza a página inteira. |
| `script.js` | Monta as seções a partir de `dados.js` e cuida das animações, sons, conquistas e do minijogo. |
| `ceu.js` | Céu de fundo (nuvens e estrelas) e botão dia/noite, usados na página inicial e no blog. |
| `style.css` | Visual, temas claro/escuro e cursor de pixel. |
| `api/likes.php` | Contador de likes. Grava o total em `api/likes.txt`, criado no primeiro acesso. |

## Rodando localmente

Qualquer servidor estático serve. Por exemplo:

```bash
npx serve .
```

O contador de likes precisa de PHP. Sem ele, o resto do site funciona normalmente. Para testar os likes:

```bash
php -S localhost:8000
```

## Licença

O código pode servir de referência e inspiração. Os textos, a foto e a marca Gabriel Soares são meus e não podem ser reutilizados.
