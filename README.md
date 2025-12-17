# Binary Options Trading Platform

A comprehensive, enterprise-grade binary options trading platform built with modern technologies and best practices.

## Architecture Overview

This platform consists of:
- **Frontend**: Next.js 14 with App Router, TypeScript, and Tailwind CSS
- **Backend**: Node.js with Express and TypeScript
- **Database**: MongoDB Atlas
- **Infrastructure**: AWS (ECS, RDS, ALB, S3) managed with Terraform
- **CI/CD**: GitHub Actions
- **Authentication**: JWT with refresh tokens
- **Real-time Updates**: WebSocket support for live trading data

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- React Query (Data Fetching)
- Socket.io Client (Real-time updates)
- Chart.js (Trading charts)

### Backend
- Node.js 18+
- Express.js
- TypeScript
- MongoDB with Mongoose
- JWT Authentication
- Socket.io (WebSocket)
- Bull (Job Queue)
- Winston (Logging)

### Infrastructure
- AWS ECS (Container orchestration)
- AWS Application Load Balancer
- AWS ElastiCache (Redis)
- AWS S3 (Static assets)
- AWS CloudWatch (Monitoring)
- MongoDB Atlas (Database)

### DevOps
- Docker & Docker Compose
- Terraform (IaC)
- GitHub Actions (CI/CD)
- Jest & Supertest (Testing)
- ESLint & Prettier (Code Quality)

## Project Structure

```
binary-options-platform/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   ├── utils/          # Utility functions
│   │   ├── types/          # TypeScript types
│   │   └── tests/          # Test files
│   ├── Dockerfile
│   └── package.json
├── frontend/               # Next.js application
│   ├── src/
│   │   ├── app/           # Next.js App Router
│   │   ├── components/    # React components
│   │   ├── lib/           # Utilities and helpers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── store/         # State management
│   │   └── types/         # TypeScript types
│   ├── public/            # Static assets
│   ├── Dockerfile
│   └── package.json
├── infrastructure/        # Terraform configurations
│   ├── modules/          # Reusable Terraform modules
│   ├── environments/     # Environment-specific configs
│   └── main.tf
├── .github/
│   └── workflows/        # GitHub Actions workflows
└── docs/
    ├── specifications/   # Technical specifications
    └── diagrams/        # Architecture diagrams
```

## Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- MongoDB Atlas account
- AWS account (for production deployment)
- Terraform 1.5+

### Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd clout
```

2. Set up environment variables:
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB Atlas connection string

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your API URL
```

3. Install dependencies:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

4. Start development servers:
```bash
# Using Docker Compose (recommended)
docker-compose up

# Or manually:
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

5. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- API Documentation: http://localhost:4000/api-docs

## Testing

### Backend Tests
```bash
cd backend
npm test                 # Run all tests
npm run test:unit       # Run unit tests
npm run test:integration # Run integration tests
npm run test:coverage   # Generate coverage report
```

### Frontend Tests
```bash
cd frontend
npm test                # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Generate coverage report
```

## Deployment

### AWS Deployment with Terraform

1. Configure AWS credentials:
```bash
aws configure
```

2. Initialize Terraform:
```bash
cd infrastructure
terraform init
```

3. Review and apply infrastructure:
```bash
terraform plan
terraform apply
```

### CI/CD Pipeline

The GitHub Actions pipeline automatically:
1. Runs tests on all pull requests
2. Builds Docker images
3. Deploys to staging on merge to `develop`
4. Deploys to production on merge to `main`

## API Documentation

Full API documentation is available at `/api-docs` when running the backend server.

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

#### Trading
- `GET /api/options` - List available options
- `POST /api/trades` - Create new trade
- `GET /api/trades` - Get user trades
- `GET /api/trades/:id` - Get specific trade
- `POST /api/trades/:id/close` - Close trade

#### User
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/balance` - Get account balance
- `POST /api/users/deposit` - Deposit funds
- `POST /api/users/withdraw` - Withdraw funds

## Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configuration
- Input validation and sanitization
- SQL injection protection
- XSS protection
- CSRF protection
- Security headers with Helmet.js
- Encrypted environment variables

## Monitoring and Logging

- Winston for structured logging
- CloudWatch for AWS monitoring
- Error tracking and alerting
- Performance metrics
- Audit logs for trading activities

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

This project is proprietary and confidential.

## Support

For support, please contact the development team or create an issue in the repository.
