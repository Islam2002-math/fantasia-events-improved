# 🎉 Fantasia Events - Professional Edition

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=flat&logo=Prisma&logoColor=white)](https://prisma.io/)

A professional-grade event management web application with advanced features including AI-powered recommendations, secure authentication, payment processing, and comprehensive testing.

## ✨ Key Features

### 🔐 **Security & Authentication**
- Iron-session based secure authentication
- CSRF protection with middleware
- Input validation with Zod schemas
- Environment variable protection
- Rate limiting and security headers

### 🎪 **Event Management**
- Create, edit, and manage events
- Advanced search and filtering
- Category and tag system
- Event scheduling and capacity management
- QR code generation for tickets

### 🤖 **AI Integration**
- Personalized event recommendations
- AI-powered chat assistant
- Smart content suggestions
- Automated categorization

### 💳 **Payment System**
- Stripe integration for secure payments
- Multiple payment methods support
- Refund and cancellation handling
- Invoice generation and tracking

### 🗺️ **Geolocation & Maps**
- Google Maps integration
- Location-based event discovery
- Venue mapping and directions
- GPS-based check-in system

### 📱 **Modern UI/UX**
- Responsive design with Tailwind CSS
- Dark/light theme support
- Toast notifications system
- Progressive Web App features
- Accessibility compliance (WCAG 2.1)

## 🏗️ Architecture

### **Technology Stack**
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Neon recommended)
- **Styling**: Tailwind CSS, Lucide React icons
- **Authentication**: Iron Session
- **Payments**: Stripe
- **Testing**: Vitest, Playwright
- **Code Quality**: ESLint, Prettier, Husky

### **Project Structure**
```
fantasia-events-improved/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── (auth)/         # Authentication pages
│   │   ├── (dashboard)/    # Protected dashboard pages
│   │   ├── api/            # API endpoints
│   │   └── globals.css     # Global styles
│   ├── components/         # Reusable React components
│   │   ├── ui/            # Base UI components
│   │   ├── forms/         # Form components
│   │   └── layouts/       # Layout components
│   ├── lib/               # Core utilities and configurations
│   │   ├── auth/          # Authentication logic
│   │   ├── db/            # Database utilities
│   │   └── validation/    # Zod schemas
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── prisma/                # Database schema and migrations
├── public/                # Static assets
├── tests/                 # Test suites
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── e2e/              # End-to-end tests
├── docs/                  # Additional documentation
└── scripts/               # Build and deployment scripts
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- PostgreSQL database (Neon recommended)
- Git

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/fantasia-events-improved.git
   cd fantasia-events-improved
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration values
   ```

4. **Database setup**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed  # Optional: seed with sample data
   ```

5. **Development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🔧 Configuration

### **Required Environment Variables**
```env
DATABASE_URL="postgresql://..."
SESSION_SECRET="your-32-char-secret"
```

### **Optional Features**
```env
# Payments
STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_SECRET_KEY="sk_..."

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-password"

# Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-key"

# AI Features
OPENAI_API_KEY="sk-..."
```

## 🧪 Testing

### **Unit Tests**
```bash
npm run test           # Run once
npm run test:watch     # Watch mode
npm run test:coverage  # With coverage
```

### **End-to-End Tests**
```bash
npm run test:e2e       # Headless
npm run test:e2e:ui    # Interactive UI
```

## 🛠️ Development Workflow

### **Code Quality**
```bash
npm run lint           # Check for issues
npm run lint:fix       # Auto-fix issues
npm run format         # Format code
npm run type-check     # TypeScript check
npm run validate       # Run all checks
```

### **Git Hooks**
Pre-commit hooks automatically run:
- ESLint fixes
- Prettier formatting
- Type checking
- Unit tests

### **Database Management**
```bash
npm run prisma:studio    # Open Prisma Studio
npm run prisma:generate  # Generate client
npm run db:migrate       # Run migrations
npm run db:seed         # Seed database
```

## 🔒 Security Features

- **Session Management**: Secure iron-session implementation
- **CSRF Protection**: Built-in Next.js middleware
- **Input Validation**: Zod schema validation
- **SQL Injection Prevention**: Prisma ORM protection
- **XSS Protection**: React's built-in escaping
- **Security Headers**: Comprehensive security middleware
- **Rate Limiting**: API endpoint protection
- **Environment Security**: Secure environment variable handling

## 🚀 Deployment

### **Vercel (Recommended)**
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### **Docker Deployment**
```bash
npm run docker:build
npm run docker:run
```

### **Manual Deployment**
```bash
npm run build
npm start
```

## 📊 Monitoring & Analytics

- **Error Tracking**: Sentry integration ready
- **Performance**: Built-in Next.js analytics
- **Security Scanning**: Automated dependency auditing
- **Code Coverage**: Comprehensive test coverage reporting

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Process**
1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Run quality checks
5. Submit a pull request

## 📝 Documentation

- [API Documentation](docs/api.md)
- [Database Schema](docs/database.md)
- [Security Guide](docs/security.md)
- [Deployment Guide](docs/deployment.md)
- [Troubleshooting](TROUBLESHOOTING.md)

## 🐛 Issue Reporting

Found a bug or have a feature request? Please check our [issue templates](.github/ISSUE_TEMPLATE/) and create a new issue.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Prisma for the excellent ORM
- Stripe for secure payment processing
- All contributors and community members

---

**Built with ❤️ by the Fantasia Events Team**

For support, email us at support@fantasia-events.com or join our [Discord community](https://discord.gg/fantasia-events).