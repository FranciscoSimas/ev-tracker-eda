# EV Tracker EDA

**Last update:** 22/09/2026

Web app to log EV charging sessions, track cost and energy over time, and manage vehicles and tariffs.

## About

I built this app to keep charging costs under control, with configurable base price, VAT and charging losses. You can register sessions, follow monthly stats and charts, and manage more than one vehicle. Login and data live on Supabase. Deploy is on Vercel.

## Main Features

- Auth (email/password + Google)
- Charging session log (kWh, battery %, losses)
- Multiple vehicles
- Tariffs (base price, VAT, loss %)
- Monthly stats and cost/energy charts
- Edit charging sessions

## Technologies Used

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

### Backend
- Supabase (Auth + PostgreSQL)
- Vercel (deploy)

## Project Structure

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

## Contributing

This is a personal project. Suggestions are welcome, but I am not looking for active contributors right now.

## License

Personal and educational use.

## Links

- **Repository:** https://github.com/FranciscoSimas/ev-tracker-eda
