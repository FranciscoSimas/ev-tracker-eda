# **Último update:** 23/09/2026

# ⚡ EV Tracker EDA

App web para registar sessões de carregamento EV, acompanhar custo e energia ao longo do tempo, e comparar com um carro a combustão.

## 📖 Sobre

Fiz esta app para controlar o custo dos carregamentos. Configuras preço base, IVA e perdas, registas sessões, vês estatísticas e gráficos do mês, e geres mais do que um veículo. Também há uma comparação simples EV vs combustão. O login e os dados ficam no Supabase. O deploy é no Lovable.

## ✨ Funcionalidades Principais

- 🔐 Autenticação (email/password + Google)
- 🔋 Sessões de carregamento (kWh, % bateria, perdas)
- ✏️ Edição de sessões
- 🚗 Vários veículos (adicionar e editar)
- 💶 Tarifas (preço base, IVA, % perdas)
- 📅 Navegação por mês no ecrã inicial
- 📊 Gráficos (custo e energia por mês, sessões, média por dia da semana, acumulado)
- 📈 Histórico agrupado por mês
- ⚖️ Comparação EV vs combustão

## 🛠️ Tecnologias Utilizadas

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Recharts

### Backend
- Supabase (Auth + PostgreSQL)
- Lovable (hosting)

## 📁 Estrutura do Projeto

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

## 🤝 Contribuir

Este é um projeto pessoal. Sugestões são bem-vindas, mas neste momento não estou à procura de contribuidores ativos.

## 📄 Licença

Uso pessoal e educacional.

## 🔗 Links

- **Repositório:** https://github.com/FranciscoSimas/ev-tracker-eda
- **App:** https://ev-tracker-eda.lovable.app
