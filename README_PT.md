# EV Tracker EDA

**Último update:** 22/09/2026

App web para registar sessões de carregamento EV, acompanhar custo e energia ao longo do tempo, e gerir veículos e tarifas.

## Sobre

Fiz esta app para controlar o custo dos carregamentos, com preço base, IVA e perdas configuráveis. Dá para registar sessões, ver estatísticas e gráficos do mês, e gerir mais do que um veículo. O login e os dados ficam no Supabase. O deploy é no Vercel.

## Funcionalidades Principais

- Autenticação (email/password + Google)
- Registo de sessões (kWh, % bateria, perdas)
- Vários veículos
- Tarifas (preço base, IVA, % perdas)
- Estatísticas do mês e gráficos de custo/energia
- Edição de sessões

## Tecnologias Utilizadas

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

### Backend
- Supabase (Auth + PostgreSQL)
- Vercel (deploy)

## Estrutura do Projeto

```
ev-tracker-eda/
├── public/           # Ficheiros estáticos
├── src/
│   ├── components/   # UI + componentes EV
│   ├── hooks/        # Auth e dados
│   ├── integrations/ # Cliente Supabase
│   ├── lib/          # Tipos e helpers
│   ├── pages/        # Páginas da app
│   ├── App.tsx
│   └── main.tsx
├── supabase/         # Migrações / config
├── .env.example
└── package.json
```

## Contribuir

Este é um projeto pessoal. Sugestões são bem-vindas, mas neste momento não estou à procura de contribuidores ativos.

## Licença

Uso pessoal e educacional.

## Links

- **Repositório:** https://github.com/FranciscoSimas/ev-tracker-eda
