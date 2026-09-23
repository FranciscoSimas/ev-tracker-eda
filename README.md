# **Last update:** 23/09/2026

# ⚡ EV Tracker EDA

Web app to log EV charging sessions, track cost and energy over time, and compare with a fuel car.

## 📖 About

I built this app to keep charging costs under control. You set base price, VAT and charging losses, register sessions, follow monthly stats and charts, and manage more than one vehicle. There is also a simple EV vs fuel cost comparison. Login and data live on Supabase. Deploy is on Lovable.

## ✨ Main Features

- 🔐 Auth (email/password + Google)
- 🔋 Charging sessions (kWh, battery %, losses)
- ✏️ Edit sessions
- 🚗 Multiple vehicles (add and edit)
- 💶 Tariffs (base price, VAT, loss %)
- 📅 Month navigation on the home screen
- 📊 Charts (monthly cost and energy, sessions, weekday average, cumulative)
- 📈 History grouped by month
- ⚖️ EV vs fuel cost comparison

## 🛠️ Technologies Used

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

## 📁 Project Structure

```
ev-tracker-eda/
├── public/           # Static assets
├── src/
│   ├── components/   # UI + EV components
│   ├── hooks/        # Auth and data hooks
│   ├── integrations/ # Supabase client
│   ├── lib/          # Types and helpers
│   ├── pages/        # App pages
│   ├── App.tsx
│   └── main.tsx
├── supabase/         # Migrations / config
├── .env.example
└── package.json
```

## 🤝 Contributing

This is a personal project. Suggestions are welcome, but I am not looking for active contributors right now.

## 📄 License

Personal and educational use.

## 🔗 Links

- **Repository:** https://github.com/FranciscoSimas/ev-tracker-eda
- **Live app:** https://ev-tracker-eda.lovable.app
