# 📱 Guia de Instalação PWA - Schedly

O Schedly agora é uma Progressive Web App (PWA) completa! Isso significa que você pode instalá-lo como um aplicativo nativo no seu dispositivo.

## 🚀 Como Instalar

### No Desktop (Chrome, Edge, Brave)

1. Acesse o site do Schedly
2. Procure pelo ícone de instalação na barra de endereços (ou menu)
3. Clique em "Instalar" ou "Adicionar à tela inicial"
4. O aplicativo será instalado e poderá ser aberto como um app nativo

### No Mobile (Android)

1. Abra o Schedly no Chrome ou outro navegador compatível
2. Toque no menu (três pontos) no canto superior direito
3. Selecione "Adicionar à tela inicial" ou "Instalar app"
4. Confirme a instalação
5. O ícone do Schedly aparecerá na sua tela inicial

### No iOS (iPhone/iPad)

1. Abra o Schedly no Safari
2. Toque no botão de compartilhar (quadrado com seta)
3. Role para baixo e toque em "Adicionar à Tela de Início"
4. Personalize o nome se desejar
5. Toque em "Adicionar"
6. O ícone do Schedly aparecerá na sua tela inicial

## ✨ Recursos PWA

- **Instalação**: Instale o app diretamente do navegador
- **Modo Offline**: Acesse páginas visitadas anteriormente mesmo sem internet
- **Atualizações Automáticas**: O app se atualiza automaticamente quando há novas versões
- **Experiência Nativa**: Interface que se comporta como um app nativo
- **Notificações Push**: (Em breve) Receba notificações sobre seus agendamentos

## 🛠️ Para Desenvolvedores

### Gerar Ícones PWA

Para gerar os ícones necessários para a PWA:

```bash
# Instalar dependência (se ainda não tiver)
npm install --save-dev sharp

# Gerar ícones
node scripts/generate-icons.js
```

Os ícones serão gerados na pasta `public/` com os tamanhos:
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

### Estrutura PWA

- `public/manifest.json` - Manifesto da PWA com configurações
- `public/sw.js` - Service Worker para cache e funcionalidade offline
- `src/app/offline/page.tsx` - Página exibida quando offline
- `src/components/pwa-register.tsx` - Componente que registra o Service Worker

### Testar PWA

1. Execute o projeto em modo de produção:
   ```bash
   npm run build
   npm start
   ```

2. Acesse via HTTPS (ou localhost para desenvolvimento)

3. Abra as DevTools (F12) e vá para a aba "Application"

4. Verifique:
   - Service Worker está registrado
   - Manifest está carregado
   - Cache está funcionando

### Requisitos para PWA

- ✅ HTTPS (ou localhost para desenvolvimento)
- ✅ Manifest.json válido
- ✅ Service Worker registrado
- ✅ Ícones em diferentes tamanhos
- ✅ Tema color configurado

## 📝 Notas

- O Service Worker usa estratégia "Network First" para navegação e "Cache First" para assets
- Páginas visitadas anteriormente ficam disponíveis offline
- O cache é atualizado automaticamente quando há novas versões
- A versão do cache é incrementada automaticamente quando necessário

## 🔧 Troubleshooting

### Service Worker não registra

- Verifique se está usando HTTPS (ou localhost)
- Limpe o cache do navegador
- Verifique o console para erros

### Ícones não aparecem

- Certifique-se de que os ícones foram gerados na pasta `public/`
- Verifique se os caminhos no `manifest.json` estão corretos
- Limpe o cache do navegador

### App não instala

- Verifique se todos os requisitos PWA estão atendidos
- Use um navegador compatível (Chrome, Edge, Safari)
- Verifique se o manifest.json está acessível

