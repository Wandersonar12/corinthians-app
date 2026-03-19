# Wanderson - Corinthians App

## Como publicar no Vercel

### Passo 1: GitHub
1. Acesse github.com e crie uma conta gratuita
2. Clique em "New repository"
3. Nome: `corinthians-app`
4. Clique "Create repository"
5. Suba os arquivos desta pasta

### Passo 2: Configurar chaves
Antes de subir, edite o arquivo `src/config.js`:
- `RAPIDAPI_KEY` — sua chave da API-Football (já tem!)
- `NEWS_API_KEY` — crie conta grátis em newsapi.org e cole aqui

### Passo 3: Vercel
1. Acesse vercel.com e crie conta com Google
2. Clique "Add New Project"
3. Selecione o repositório `corinthians-app` do GitHub
4. Clique "Deploy"
5. Pronto! URL: `corinthians-app.vercel.app`

### Passo 4: Salvar como app no celular
1. Abra a URL no Chrome do Android
2. Menu (3 pontinhos) → "Adicionar à tela inicial"
3. Confirme → vira ícone na tela inicial como app nativo!

## Funcionalidades automáticas
- ⚽ Jogo ao vivo com placar, gols e estatísticas (atualiza a cada 30s)
- 📋 Escalação antes do jogo (assim que sair)
- 📰 Notícias atualizadas em tempo real de múltiplos sites
- 👥 Elenco sempre atualizado com contratações e saídas
- 📊 Tabela de classificação ao vivo
