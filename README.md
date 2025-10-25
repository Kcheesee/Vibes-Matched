# 🎵 Vibes Matched

> **AI-Powered Workout Music Matching** - Automatically match your music to your workout intensity using real-time heart rate monitoring.

<div align="center">

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)

</div>

---

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Integration Guides](#integration-guides)
- [Screenshots](#screenshots)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**Vibes Matched** intelligently matches your music to your workout intensity by analyzing your heart rate in real-time. Using Spotify/Apple Music audio features and machine learning, the app learns which songs work best for different workout zones and creates personalized playlists that adapt to your performance.

### The Problem
- Generic workout playlists don't match your actual intensity
- Manually changing songs mid-workout disrupts your flow
- Hard to find songs that match specific heart rate zones

### The Solution
Vibes Matched automatically:
- Tracks your heart rate during workouts
- Analyzes song tempo (BPM) and energy levels
- Learns which songs increase/decrease your heart rate
- Creates dynamic playlists that match your workout zones

---

## ✨ Features

### 🏃 Workout Tracking
- **Real-time Heart Rate Monitoring** - Live BPM tracking during workouts
- **Custom Workout Profiles** - Create profiles with target heart rate zones
- **Workout History** - View detailed stats, heart rate graphs, and song history
- **Multiple Workout Types** - HIIT, Cardio, Strength, Yoga, and custom profiles

### 🎧 Music Intelligence
- **Song Library** - 40+ test songs organized by intensity zones (Zone 1-5)
- **Personalized Playlists** - Auto-generated based on your workout history
- **Hype & Cooldown Songs** - Separate playlists for pumping up or winding down
- **BPM-Synced Animations** - Visual feedback that pulses with your heart rate

### 🎨 Beautiful V2 Design
- **Theme System** - Automatic dark/light mode with burnt orange accent
- **Waveform Backgrounds** - Animated SVG waves on every screen
- **Glassmorphism** - Modern frosted glass UI components
- **Smooth Animations** - React Native Animated API for buttery performance

### 👥 Social Features
- **Friends** - See what your friends are listening to during workouts
- **Activity Feed** - Share workout achievements
- **Leaderboards** - Compare stats with friends (coming soon)

---

## 🛠 Tech Stack

### Frontend (Mobile App)
- **React Native** - Cross-platform mobile development
- **Expo SDK 54** - Managed React Native workflow
- **TypeScript** - Type-safe components and services
- **React Navigation** - Stack and tab navigation
- **Expo Linear Gradient** - Gradient backgrounds
- **Expo Blur** - Glassmorphism effects
- **Expo Haptics** - Tactile feedback (iOS)

### Backend (API)
- **Python 3.9+** - Backend language
- **Flask** - RESTful API framework
- **Flask-JWT-Extended** - Authentication & authorization
- **SQLAlchemy** - ORM for database operations
- **SQLite** - Lightweight database (easily upgradable to PostgreSQL)
- **Flask-CORS** - Cross-origin resource sharing

### Music Services (Planned)
- **Spotify Web API** - Song metadata & audio features
- **Apple Music API** - iOS native integration
- **Spotipy** - Python Spotify client

### Health/Fitness (Planned)
- **Apple HealthKit** - iOS heart rate monitoring
- **Google Fit** - Android fitness data
- **React Native Health** - Cross-platform health data access

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 16+ and npm
- **Python** 3.9+
- **Expo CLI** (install globally: `npm install -g expo-cli`)
- **iOS Simulator** (macOS) or **Android Emulator**
- **Physical device** recommended for heart rate testing

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/vibes-matched.git
cd vibes-matched
```

#### 2. Setup Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python
>>> from app import create_app, db
>>> app = create_app()
>>> with app.app_context():
...     db.create_all()
...
>>> exit()

# Seed test songs (optional but recommended)
python seed_playlists.py

# Start backend server
PORT=5001 python run.py
```

Backend will run on `http://localhost:5001`

#### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start Expo development server
npx expo start
```

#### 4. Configure API URL

Update `frontend/src/services/api.js`:

```javascript
const API_BASE_URL = 'http://YOUR_LOCAL_IP:5001/api';
// Example: 'http://192.168.1.100:5001/api'
```

To find your local IP:
- **macOS**: `ipconfig getifaddr en0`
- **Windows**: `ipconfig` (look for IPv4 Address)
- **Linux**: `hostname -I`

#### 5. Run on Device/Simulator

- **iOS**: Press `i` in Expo terminal or scan QR code with Expo Go
- **Android**: Press `a` in Expo terminal or scan QR code with Expo Go
- **Physical Device**: Install **Expo Go** app and scan QR code

### First Time Setup

1. **Register Account**: Create a new user account in the app
2. **Explore Song Library**: Navigate to "Your Playlists" to see test songs
3. **Start Workout**: Choose a workout profile and start tracking
4. **View History**: Check out your workout details and stats

---

## 📁 Project Structure

```
vibes-matched/
├── frontend/                 # React Native mobile app
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── BottomNav.tsx
│   │   │   ├── Waveform.tsx
│   │   │   ├── WorkoutCard.tsx
│   │   │   └── StatCard.tsx
│   │   ├── screens/         # App screens (V2 design)
│   │   │   ├── HomeScreenV2.tsx
│   │   │   ├── WorkoutStartScreenV2.tsx
│   │   │   ├── WorkoutTrackingScreenV2.tsx
│   │   │   ├── WorkoutDetailsScreenV2.tsx
│   │   │   ├── TopSongsScreenV2.tsx
│   │   │   ├── MusicSyncScreenV2.tsx
│   │   │   └── CreateProfileScreenV2.tsx
│   │   ├── navigation/      # React Navigation setup
│   │   ├── services/        # API clients & utilities
│   │   │   └── api.js       # Axios HTTP client
│   │   ├── theme/           # Design system & theme
│   │   │   └── index.ts     # Colors, typography, spacing
│   │   └── constants/       # App-wide constants
│   ├── assets/              # Images, fonts, icons
│   ├── app.json             # Expo configuration
│   └── package.json         # Dependencies
│
├── backend/                 # Flask REST API
│   ├── app/
│   │   ├── models/          # SQLAlchemy database models
│   │   │   ├── user.py      # User authentication
│   │   │   ├── song.py      # Song metadata & audio features
│   │   │   ├── workout.py   # Workout sessions & heart rate data
│   │   │   └── workout_profile.py
│   │   ├── routes/          # API endpoints
│   │   │   ├── auth.py      # Login/Register
│   │   │   ├── workouts.py  # Workout tracking & songs
│   │   │   ├── profiles.py  # Workout profiles
│   │   │   ├── social.py    # Friends & activity feed
│   │   │   └── spotify.py   # Spotify integration
│   │   ├── utils/           # Helper functions
│   │   └── __init__.py      # Flask app factory
│   ├── instance/            # SQLite database (gitignored)
│   ├── requirements.txt     # Python dependencies
│   ├── run.py              # App entry point
│   └── seed_playlists.py   # Generate test song data
│
└── docs/                   # Documentation
    ├── MUSIC_INTEGRATION.md       # Spotify/Apple Music setup
    ├── HEALTH_FITNESS_INTEGRATION.md  # HealthKit/Google Fit
    └── API.md              # API endpoint reference (coming soon)
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:5001/api
```

### Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <access_token>
```

### Key Endpoints

#### Auth
- `POST /auth/register` - Create new account
- `POST /auth/login` - Get access token
- `POST /auth/refresh` - Refresh access token

#### Workouts
- `POST /workouts/start` - Start new workout session
- `POST /workouts/<id>/heart-rate` - Log heart rate reading
- `POST /workouts/<id>/end` - End workout session
- `GET /workouts/history` - Get user's workout history
- `GET /workouts/<id>` - Get workout details
- `GET /workouts/top-songs` - Get personalized top songs
- `GET /workouts/songs/library` - Get song library by zones

#### Profiles
- `GET /profiles` - Get all workout profiles
- `POST /profiles` - Create custom profile
- `GET /profiles/<id>` - Get profile details

#### Social
- `POST /social/friends/add` - Send friend request
- `GET /social/friends` - Get friends list
- `GET /social/feed` - Get activity feed

For detailed API documentation, see `docs/API.md` (coming soon).

---

## 🔗 Integration Guides

### Music Services
See [docs/MUSIC_INTEGRATION.md](docs/MUSIC_INTEGRATION.md) for detailed setup:
- Spotify Web API integration
- Apple Music API integration
- Platform-specific configuration (iOS/Android)

### Health & Fitness
See [docs/HEALTH_FITNESS_INTEGRATION.md](docs/HEALTH_FITNESS_INTEGRATION.md) for:
- Apple HealthKit setup
- Google Fit integration
- Apple Watch, Fitbit, and Garmin support
- Real-time heart rate monitoring

---

## 📸 Screenshots

*Coming soon - Add screenshots of your app here!*

---

## 🗺 Roadmap

### ✅ Phase 1: MVP (COMPLETE!)
- [x] User authentication
- [x] Workout tracking with heart rate
- [x] Song library with BPM zones
- [x] Personalized hype & cooldown playlists
- [x] V2 Design system
- [x] Bottom navigation
- [x] Social features foundation

### 🚧 Phase 2: Music Integration (In Progress)
- [ ] Spotify API connection
- [ ] Apple Music API connection
- [ ] Real-time "Now Playing" sync
- [ ] Playlist creation/modification
- [ ] Audio feature analysis

### 🔮 Phase 3: Smart Features (Planned)
- [ ] Apple HealthKit integration
- [ ] Google Fit integration
- [ ] Apple Watch app
- [ ] Machine learning recommendations
- [ ] Automatic song matching during workouts
- [ ] Offline mode with cached songs

### 🎯 Phase 4: Social & Gamification
- [ ] Friend challenges
- [ ] Leaderboards
- [ ] Workout streaks
- [ ] Achievement badges
- [ ] Share to social media

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Development Guidelines
- Use TypeScript for frontend components
- Follow existing code style
- Add comments for complex logic
- Test on both iOS and Android
- Update documentation for new features

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with ❤️ using React Native and Flask
- Design inspiration from modern fitness apps
- Burnt orange color scheme 🔥
- Test song data generated for demonstration purposes

---

## 📧 Contact

**Project Link**: [https://github.com/yourusername/vibes-matched](https://github.com/yourusername/vibes-matched)

---

<div align="center">

**Made with 🎵 and ❤️ by the Vibes Matched Team**

⭐ Star this repo if you found it helpful!

</div>
