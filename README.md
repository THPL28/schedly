# 🗓️ Schedly - Gestão Inteligente de Agendamentos

Schedly é uma plataforma SaaS (Software as a Service) de alta performance projetada para profissionais e empresas que buscam automatizar sua agenda, reduzir cancelamentos e oferecer uma experiência de agendamento premium aos seus clientes.

![Schedly Design](https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=1200)

## 🚀 Diferenciais do Serviço

- **Interface Premium:** Design inspirado no Google Agenda, com visualização limpa e intuitiva.
- **Agendamento Inteligente:** Algoritmo que evita sobreposições e respeita seus horários de trabalho.
- **Páginas Públicas Personalizadas:** URL única para seus clientes agendarem horários sem atrito.
- **Painel de Controle Completo:** Gestão de clientes, histórico de serviços e métricas de desempenho.
- **Segurança Robusta:** Autenticação via JWT e criptografia de senhas.

## 🛠️ Stack Tecnológica

O Schedly foi construído com as tecnologias mais modernas do ecossistema JavaScript:

- **Frontend:** [Next.js o1](https://nextjs.org/) (App Router), React 19.
- **Estilização:** CSS Moderno com Variáveis (Baseado em UI/UX Premium).
- **Banco de Dados:** [Prisma ORM](https://www.prisma.io/) com PostgreSQL/MySQL.
- **Autenticação:** Cookies de sessão seguros com `jose` (JWT).
- **Ícones:** [Lucide React](https://lucide.dev/).

## 🚦 Como Iniciar (Desenvolvimento)

### Pré-requisitos
- Node.js 20+
- Banco de Dados (PostgreSQL, MySQL ou SQLite)

### Instalação

1. Clone o repositório:
```bash
git clone git@github.com:THPL28/schedly.git
cd schedly
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz:
```env
DATABASE_URL="sua_url_do_banco"
SESSION_SECRET="sua_chave_secreta_aleatoria"
```

4. Prepare o banco de dados:
```bash
npx prisma generate
npx prisma db push
```

5. Rode o servidor:
```bash
npm run dev
```

## ☁️ Deploy via Vercel

O projeto está otimizado para deploy imediato na Vercel:

1. Importe o repositório no dashboard da Vercel.
2. Adicione as variáveis de ambiente `DATABASE_URL` e `SESSION_SECRET`.
3. O script de `postinstall` cuidará da geração do Prisma Client automaticamente.

## 📄 Licença

Este projeto é um serviço proprietário. Todos os direitos reservados.

---
Construído com ❤️ para profissionais de excelência.
