# Flashess - Chess Training Platform

## Overview
Flashess is a comprehensive chess training platform built with Next.js 14, React 18, and .NET 9.0. The application features advanced training modes, custom exercise creation, vision training capabilities, and a complete opening tree system. Currently hosted at [flashess.eu](https://flashess.eu) with backend running on Microsoft Azure.

### Current Status
- **Frontend**: Live at flashess.eu
- **Backend**: Deployed on Microsoft Azure
- **Database**: SQLite (production-ready, can be migrated to PostgreSQL)

## Features

### Training Modes
- **Interactive Training**: Full chess training with real-time move validation
- **Random Mode**: Automatic random exercise selection
- **Vision Training**: Enhanced board visualization showing attacked squares
- **Hint Mode**: Get hints for difficult positions
- **Auto-start Moves**: Skip opening moves for faster training
- **Mistake Review**: Analyze and review incorrect moves
- **Move History Navigation**: Browse through game history with arrow keys

### User Authentication
- **Standard Registration/Login**: Email and password authentication
- **Google OAuth**: Sign in with Google account
- **Apple Sign-In**: Apple ID authentication
- **SMS Verification**: Phone number login with SMS codes
- **JWT Tokens**: Secure authentication with refresh tokens
- **Cross-device Sync**: Manage exercises across all your devices

### Data Storage
- **Local Storage**: Exercises always saved locally (works offline)
- **Backend Sync**: Optional cloud sync when logged in
- **Public Exercises**: Share your exercises with the community

### Creation Mode
- **PGN Import**: Load games from Lichess and other platforms
- **Custom Position Builder**: Create exercises from any board position
- **Opening Tree Integration**: Real-time theoretical move suggestions
- **Move History Management**: Full game analysis with variation support
- **Vision Mode**: Enhanced board visualization for position analysis
- **Square Marking**: Right-click to mark important squares
- **Dual Storage**: Local storage + cloud synchronization

### Opening Tree System
The opening tree provides:
- **Real-time Analysis**: Shows theoretical moves for any position
- **Variation Explorer**: Deep dive into opening variations
- **Statistics**: Win rates, draw rates, and evaluations
- **Main Line Highlighting**: Identifies principal variations
- **Configurable Depth**: Adjust tree depth (2-5 moves)

### UI Components
- **Responsive Design**: Works on desktop and mobile
- **Modern Interface**: Clean, intuitive user experience
- **Custom Scrollbars**: Consistent styling across browsers
- **Interactive Elements**: Hover effects and transitions

## Technical Stack

### Backend (.NET 9.0)
- **Framework**: ASP.NET Core 9.0 Web API
- **ORM**: Entity Framework Core 9.0
- **Database**: SQLite (production-ready, migratable to PostgreSQL/MySQL)
- **Authentication**: JWT Bearer tokens with multiple OAuth providers
- **Security**: BCrypt password hashing, CORS configuration
- **Documentation**: Swagger/OpenAPI
- **Hosting**: Microsoft Azure

### Frontend (Next.js 14)
- **Framework**: Next.js 14 with App Router
- **React**: React 18 with TypeScript
- **Styling**: Tailwind CSS 4.x with custom design system
- **Chess Engine**: chess.js for game logic and PGN parsing
- **Board Component**: react-chessboard with custom styling
- **State Management**: React hooks + localStorage + API integration
- **Animations**: Framer Motion for smooth transitions
- **Hosting**: flashess.eu domain

## Project Structure

```
Flashess/
├── Flashess-Backend/              # .NET 9.0 Web API
│   ├── Controllers/               # API Controllers
│   │   ├── AuthController.cs      # Authentication endpoints
│   │   └── ExercisesController.cs # Exercise management
│   ├── Models/                    # Entity Framework models
│   │   ├── User.cs               # User model
│   │   ├── Exercise.cs           # Exercise model
│   │   └── PhoneVerification.cs  # SMS verification
│   ├── Services/                  # Business logic
│   │   ├── AuthService.cs        # Authentication service
│   │   ├── OAuthService.cs       # OAuth integrations
│   │   └── ExerciseService.cs    # Exercise operations
│   ├── DTOs/                     # Data transfer objects
│   └── Program.cs                # Application startup
│
└── Flashess-Client/               # Next.js Frontend
    ├── app/                       # Next.js App Router
    │   ├── home-page.tsx          # Landing page
    │   ├── training-page/         # Training interface
    │   ├── creation-page/         # Exercise creation
    │   ├── login-page/            # Authentication
    │   ├── register-page/         # User registration
    │   └── layout.tsx             # Root layout
    ├── components/                # React components
    │   ├── TrainingBoard.tsx      # Chess board component
    │   ├── ExerciseList.tsx       # Exercise management
    │   ├── RightPanel.tsx         # Training controls
    │   ├── VisionMode.tsx         # Board visualization
    │   ├── MoveHistory.tsx        # Game history
    │   └── ...
    ├── utils/                     # Utilities and data
    │   ├── api.ts                 # API client
    │   ├── exercises.ts           # Exercise logic
    │   ├── exercises.json         # Opening database
    │   └── apiConfig.ts           # API configuration
    └── public/                    # Static assets
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend będzie dostępny na `http://localhost:3000`.

### Backend Setup (.NET 9.0)

```bash
cd Flashess-Backend
dotnet restore
dotnet run
```

Backend będzie dostępny na `http://localhost:5000`.

**Note**: Frontend działa w pełni funkcjonalnie z localStorage nawet bez backendu. Backend dodaje synchronizację między urządzeniami i ćwiczenia publiczne.

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - Standard login
- `POST /auth/google` - Google OAuth login
- `POST /auth/apple` - Apple Sign-In
- `POST /auth/phone/send-code` - Send SMS verification
- `POST /auth/phone/verify` - Verify SMS code

### Exercises
- `POST /exercises` - Create exercise (authenticated)
- `GET /exercises/my` - Get user's exercises (authenticated)
- `GET /exercises/public` - Get public exercises
- `GET /exercises/{id}` - Get specific exercise (authenticated)
- `PATCH /exercises/{id}` - Update exercise (authenticated)
- `DELETE /exercises/{id}` - Delete exercise (authenticated)

### Usage

#### Creation Mode
1. Navigate to the Creation Page
2. Use the Opening Tree to explore theoretical moves
3. Create custom exercises from PGN or current position
4. Save and manage your exercises

#### Opening Tree
- **Tree Depth**: Adjust how many moves ahead to show
- **Main Lines**: Yellow badges indicate principal variations
- **Statistics**: View win rates and evaluations for each move
- **Expandable Nodes**: Click arrows to explore deeper variations

#### Custom Exercises
- **PGN Input**: Paste standard chess notation
- **Move History**: Track your analysis progress
- **Exercise Management**: Save, load, and delete custom exercises
- **Local Storage**: Exercises are always saved locally
- **Backend Sync**: When logged in, exercises are also saved to backend
- **Public Exercises**: Option to make exercises public for all users

## Opening Database

The application includes a comprehensive database of chess openings:
- **Main Openings**: e4, d4, Nf3, c4, g3, b3, f4
- **Variations**: Multiple sub-variations for each opening
- **Statistics**: Realistic win rates and evaluations
- **Depth**: Up to 10+ moves in complex variations

## Current Status

### Fully Functional
- Standard user registration and login (email/password)
- Complete exercise management (CRUD operations)
- Public and private exercise sharing
- Cross-device exercise synchronization
- Full training mode with all features
- Exercise creation mode
- Vision Mode and Hint Mode
- Opening tree system with database
- Offline mode with localStorage
- Responsive design for all devices

### Not Yet Implemented
- Google OAuth integration (requires Google Client ID configuration)
- Apple Sign-In integration (requires Apple Client ID configuration)
- SMS login (requires SMS service integration)
- Automatic position evaluation (Stockfish integration)
- Online multiplayer mode

### In Development
- Performance optimizations
- Unit and integration tests
- Expanded opening database
- Detailed user statistics and analytics

## Development

### Adding New Openings
1. Edit `utils/openings.json`
2. Follow the existing structure
3. Include win rates, draw rates, and evaluations
4. Add sub-variations as needed

### Customizing the UI
- Modify Tailwind classes in components
- Update color scheme in `app/global.css`
- Adjust component layouts as needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Infrastructure

### Production Hosting
- **Frontend**: Deployed at [flashess.eu](https://flashess.eu)
- **Backend**: Hosted on Microsoft Azure
- **Database**: SQLite (production-ready, scalable to PostgreSQL)
- **CDN**: Optimized asset delivery

### Development Tools
- **Version Control**: Git with feature branches
- **CI/CD**: Automated deployment pipelines
- **Monitoring**: Application performance tracking
- **Security**: JWT authentication, HTTPS encryption

## Acknowledgments

- **Chess Logic**: chess.js for game rules and PGN parsing
- **Board Visualization**: react-chessboard for interactive chess board
- **Styling**: Tailwind CSS for responsive design system
- **Animations**: Framer Motion for smooth UI transitions
- **Backend Framework**: ASP.NET Core for robust API development
- **Hosting**: Microsoft Azure for reliable cloud infrastructure 
