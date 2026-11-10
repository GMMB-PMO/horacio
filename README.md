# Central de Ajuda — instalação e administração

## O que está incluído
Site responsivo estático com busca por palavras-chave (inclui texto da resposta), filtro por categoria, página individual por dúvida, data de atualização e links de materiais. Conteúdo de demonstração é fictício. Não há autenticação ou backend.

## Publicar gratuitamente no GitHub Pages
1. Crie uma conta gratuita no GitHub, se ainda não tiver.
2. Crie um repositório **público** chamado `central-ajuda`.
3. Envie para a raiz do repositório `index.html`, `styles.css`, `app.js`, `config.js` e `dados.json` (e opcionalmente este README).
4. Abra **Settings > Pages**; em **Build and deployment**, escolha **Deploy from a branch**, branch `main`, pasta `/(root)`; salve.
5. Aguarde a publicação. O endereço será semelhante a `https://SEU-USUARIO.github.io/central-ajuda/`.
6. Abra o endereço em computador e celular. Qualquer pessoa que conheça o endereço poderá acessar.

## Administrar pelo Google Sheets (sem programação)
1. No Google Sheets, crie uma planilha e uma aba chamada `Perguntas`.
2. Na linha 1, use **exatamente** estes cabeçalhos (nesta ordem): `id,pergunta,resposta,categoria,palavras,atualizacao,materiais`.
3. Importe o arquivo `modelo-perguntas.csv` (Arquivo > Importar > Upload) ou copie as linhas da planilha de exemplo.
4. Use um identificador `id` único e estável em cada linha. Não altere o ID de perguntas existentes: os links individuais dependem dele.
5. Publique a aba no formato CSV: **Arquivo > Compartilhar > Publicar na Web**, selecione a aba `Perguntas`, formato **Valores separados por vírgulas (.csv)** e publique. Copie a URL fornecida.
6. No GitHub, abra `config.js`, clique no ícone de edição e cole a URL entre as aspas de `csvUrl`. Salve (commit). Exemplo: `window.CENTRAL_CONFIG = { csvUrl: "https://docs.google.com/spreadsheets/d/e/.../pub?output=csv", titulo: "Central de Ajuda" };`.
7. A partir daí, adicione, edite ou exclua linhas na planilha. As alterações aparecerão no portal quando o CSV publicado for atualizado e a página for recarregada. Pode haver atraso de cache/publicação do Google.
8. Para novas categorias, basta digitar o novo nome na coluna `categoria`. As categorias aparecem automaticamente.

### Padrão de preenchimento
- `resposta`: texto simples; use quebras de linha. Linhas começando por `1.`, `2.`, etc. viram lista numerada. Não há suporte a HTML arbitrário, por segurança.
- `materiais`: links públicos em formato `Nome do material::https://exemplo.com/arquivo.pdf`; para múltiplos, separe com ` | `. Pode incluir imagens e documentos **por links**, não uploads internos. Imagens embutidas na resposta não são implementadas nesta versão; use links para imagens.
- `palavras`: palavras e sinônimos separados por espaços.
- `atualizacao`: data em `DD/MM/AAAA`.
- `id`: texto único, como `HOR-001`.

## Importar de Excel
Abra seu arquivo Excel no Google Sheets, ajuste os nomes das colunas ao padrão e publique a aba como CSV. A importação é feita pelo Google Sheets; o site não recebe arquivos Excel diretamente.

## Segurança e limites
**Importante:** GitHub Pages gratuito exige repositório público neste fluxo; Google Sheets publicado como CSV é acessível publicamente. Não use para conteúdo confidencial, dados pessoais, credenciais, documentos restritos ou links com acesso indevido. Os colaboradores não precisam de login, mas editores devem ter permissão na planilha. A proteção administrativa é feita pelas permissões do Google Sheets e do GitHub. A disponibilidade depende dos limites e políticas dos serviços gratuitos. Para conteúdo realmente interno, use hospedagem e controle de acesso corporativos, o que altera o requisito de acesso anônimo.

## Personalizar
- Nome e textos: `index.html`.
- Paleta e layout: variáveis no início de `styles.css`.
- Ícones e categorias iniciais: objeto `ICONS` em `app.js`.
- Exemplos locais: `dados.json` (usado quando `csvUrl` está vazio).

## Teste local
Para testar o site antes de publicar, execute na pasta: `python -m http.server 8000` e abra `http://localhost:8000`. Abrir `index.html` diretamente pelo explorador pode bloquear a leitura de `dados.json`.


## Conteúdo oficial inicial — Horácio
A base `dados.json` e o CSV foram atualizados com 20 perguntas e respostas derivadas do documento `GMMB_PMO-PRO_Horácio_26.11.06.pdf` (emissão 06/11/2026). As respostas preservam as orientações do guia. Antes de publicar, valide se o conteúdo continua vigente com o responsável pelo processo. O guia não forneceu uma URL legível para o link de acesso à plataforma, por isso nenhum endereço foi inventado.
