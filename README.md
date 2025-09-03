# Idavang - Next.js with Vercel Postgres

A modern Next.js application with Vercel Postgres database integration, built with TypeScript and Tailwind CSS.

## Features

- ⚡️ Next.js 15 with App Router
- 🎨 Tailwind CSS for styling
- 🗄️ Vercel Postgres database integration
- 📝 TypeScript for type safety
- 🔧 ESLint for code quality
- 🚀 Ready for Vercel deployment

## Project Structure

```
src/
├── app/
│   ├── api/users/
│   │   └── route.ts          # API endpoints for user management
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── components/
│   └── UserManager.tsx       # User management component
└── lib/
    └── db.ts                 # Database utility functions
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Vercel account
- Git for version control

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run the development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Database Setup

#### Option 1: Deploy First (Recommended)

1. **Deploy to Vercel**
   - Push your code to GitHub
   - Connect the repository to Vercel
   - Deploy the project

2. **Add Vercel Postgres**
   - Go to your Vercel dashboard
   - Navigate to your project
   - Go to the "Storage" tab
   - Click "Create Database" → "Postgres"
   - Follow the setup wizard

3. **Connect Database**
   - Vercel will automatically add the environment variables
   - Redeploy your project
   - Your database is now ready!

#### Option 2: Local Development with Remote Database

1. **Create a Vercel Postgres database** (even without deploying)
2. **Get your connection string** from the Vercel dashboard
3. **Update `.env.local`** with your database credentials:
   ```env
   POSTGRES_URL="your-connection-string"
   # ... other variables from Vercel
   ```

## Database Schema

The application includes a simple users table:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

- `GET /api/users` - Fetch all users
- `POST /api/users` - Create a new user

## Environment Variables

When you connect Vercel Postgres, these variables are automatically added:

```env
POSTGRES_URL=""
POSTGRES_PRISMA_URL=""
POSTGRES_URL_NO_SSL=""
POSTGRES_URL_NON_POOLING=""
POSTGRES_USER=""
POSTGRES_HOST=""
POSTGRES_PASSWORD=""
POSTGRES_DATABASE=""
```

## Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Follow the deployment wizard
   - Add Vercel Postgres from the Storage tab

### Other Platforms

This project can be deployed on any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

Just make sure to set up your Postgres database and environment variables accordingly.

## Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Technologies Used

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Vercel Postgres
- **Database Client**: @vercel/postgres
- **Code Quality**: ESLint

## Free Tier Limits

**Vercel Postgres Free Tier:**
- 60MB storage
- 256MB RAM
- 1 database per team
- Perfect for small projects and prototypes

## Why Vercel Postgres?

Since you're already deploying on Vercel and have used up your Supabase free tier, Vercel Postgres is the perfect choice because:

1. **Seamless Integration** - Zero configuration needed
2. **Automatic Environment Variables** - No manual setup required
3. **Edge Runtime Compatible** - Fast global performance
4. **Built for Next.js** - Optimized for serverless functions
5. **Free Tier Available** - Great for development and small projects

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you have any questions or run into issues:

1. Check the [Next.js Documentation](https://nextjs.org/docs)
2. Check the [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
3. Open an issue in this repository

---

**Happy coding! 🚀**
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
