# 🎌 OtakuTrack - Anime & TV Series Tracker

<div align="center">

**A comprehensive full-stack MERN application for tracking anime and TV series with advanced social features, detailed analytics, and personalized recommendations.**

[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-green.svg)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18-blue.svg)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Database Models](#-database-models)
- [Frontend Components](#-frontend-components)
- [Authentication & Security](#-authentication--security)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**OtakuTrack** is a modern, feature-rich platform designed for anime and TV series enthusiasts. Built with the MERN stack (MongoDB, Express.js, React, Node.js), it provides a seamless experience for tracking your favorite shows, engaging with a vibrant community, and gaining insights into your viewing habits.

### Key Highlights

- 🎬 **Comprehensive Show Tracking** - Track episodes, manage watchlists, and monitor your progress
- 👥 **Social Community Features** - Join clubs, participate in discussions, create polls, and connect with fans
- 📊 **Advanced Analytics** - Visualize your viewing patterns, genre preferences, and engagement metrics
- 🎨 **Modern UI/UX** - Beautiful, responsive design with dark/light theme support
- 🔐 **Secure Authentication** - JWT-based authentication with role-based access control
- ⚡ **Real-time Updates** - Live data updates for polls, comments, and notifications

---

## ✨ Features

### 🎬 Core Functionality

#### Show Management
- **Browse & Search**: Advanced search with filters for genre, year, status, and type
- **Show Details**: Comprehensive information including episodes, streaming links, ratings, and reviews
- **Episode Tracking**: Individual episode progress with air dates and descriptions
- **Streaming Links**: Multiple platform support (Crunchyroll, Netflix, Hulu, Amazon Prime, etc.)
- **Show Categories**: TV Series, Movies, OVA, Special, ONA
- **Status Tracking**: Ongoing, Completed, Upcoming, Hiatus, Cancelled

#### Watchlist System
- **5 Status Types**: 
  - 📺 Watching
  - ✅ Completed
  - ⏸️ On Hold
  - ❌ Dropped
  - 📅 Plan to Watch
- **Progress Tracking**: Current episode, rewatch count, completion percentage
- **Personal Notes**: Add private notes and ratings for each show
- **Watch Time Tracking**: Monitor time spent watching each show
- **Episode Completion**: Track individual episode completion status

#### Reviews & Ratings
- **User Reviews**: Write detailed reviews with titles and comments
- **Rating System**: 1-10 rating scale with average calculations
- **Spoiler Protection**: Mark reviews as spoilers with episode/season tracking
- **Helpful Voting**: Like/dislike system for review helpfulness
- **Edit History**: Track review modifications and timestamps
- **Moderation**: Report inappropriate reviews with admin approval workflows

### 🏛️ Social Features

#### Clubs System
- **9 Club Categories**:
  - General
  - Genre-specific
  - Show-specific
  - Seasonal
  - Discussion
  - Fan Art
  - Cosplay
  - Gaming
  - Other

- **Club Management**:
  - Create and customize clubs with avatars and banners
  - Role-based permissions (Admin, Moderator, Member)
  - Member limits and privacy controls (Public/Private)
  - Club rules and spoiler-free zones
  - Related show associations

- **Discussions**:
  - Create posts with titles, content, and tags
  - Threaded comments system
  - Like/unlike posts
  - Spoiler protection with show/episode tracking
  - Rich text content (up to 5000 characters)

- **Polls**:
  - Single and multiple-choice polls
  - Real-time voting results
  - Poll expiration dates
  - Vote tracking with timestamps
  - Visual analytics and charts

### 📊 Analytics & Insights

#### Personal Statistics
- **Watch History**:
  - Total episodes watched
  - Total watch time (in minutes)
  - Shows by status breakdown
  - Completion rates and drop rates

- **Genre Analysis**:
  - Most-watched genres with counts
  - Genre preference visualization
  - Interactive charts using Recharts

- **Activity Tracking**:
  - Weekly activity breakdown
  - Monthly activity trends
  - Last activity timestamp
  - Engagement score calculation

- **Community Engagement**:
  - Club posts and likes
  - Poll votes
  - Reviews posted
  - Comments contributed

#### Global Analytics (Admin)
- Platform-wide user statistics
- Most-watched shows
- Top genres across the platform
- Daily/Weekly/Monthly active users
- Recent activity feed

### 🔧 Admin Features

- **User Management**:
  - View all users with filtering
  - Ban/unban users
  - Role management (User, Moderator, Admin)
  - Activity monitoring

- **Content Moderation**:
  - Review flagged content
  - Approve/reject clubs
  - Manage reviews and ratings
  - Content approval workflows

- **System Analytics**:
  - Comprehensive admin dashboard
  - Real-time platform metrics
  - User engagement statistics
  - Performance monitoring

### 🔔 Additional Features

- **Reminders**: Set episode reminders with email and in-app notifications
- **Theme Support**: Seamless dark/light mode switching with system preference detection
- **Responsive Design**: Mobile-first approach with perfect tablet and desktop experience
- **Toast Notifications**: Real-time user feedback with React Hot Toast
- **Loading States**: Skeleton loaders and loading spinners for better UX
- **Error Handling**: Comprehensive error management with user-friendly messages

---

## 🛠️ Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 16+ | JavaScript runtime environment |
| **Express.js** | 4.18.2 | Web application framework |
| **MongoDB** | 8.0.3 | NoSQL database |
| **Mongoose** | 8.0.3 | MongoDB ODM |
| **JWT** | 9.0.2 | Authentication tokens |
| **bcryptjs** | 2.4.3 | Password hashing |
| **Express Validator** | 7.0.1 | Input validation |
| **CORS** | 2.8.5 | Cross-origin resource sharing |
| **Multer** | 1.4.5 | File upload handling |
| **Nodemailer** | 6.9.7 | Email functionality |
| **Cron** | 3.1.6 | Scheduled tasks |
| **Axios** | 1.11.0 | HTTP client |
| **dotenv** | 16.3.1 | Environment variables |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI library with hooks and concurrent features |
| **React Router DOM** | 6.8.1 | Client-side routing |
| **Tailwind CSS** | 3.4.17 | Utility-first CSS framework |
| **React Query** | 3.39.3 | Data fetching and state management |
| **React Icons** | 4.12.0 | Comprehensive icon library |
| **React Hot Toast** | 2.4.1 | Toast notifications |
| **Recharts** | 2.8.0 | Data visualization charts |
| **Axios** | 1.6.0 | HTTP client |
| **PostCSS** | 8.4.35 | CSS processing |
| **Autoprefixer** | 10.4.17 | CSS vendor prefixing |

### Development Tools

- **Nodemon** (3.0.2) - Development server auto-restart
- **Concurrently** (8.2.2) - Run multiple commands simultaneously
- **React Scripts** (5.0.1) - Create React App build tools

---

## 🏗️ Project Architecture

### Directory Structure

```
OtakuTrack/
├── backend/                      # Node.js + Express.js + MongoDB
│   ├── config/                   # Configuration files
│   │   └── db.js                # MongoDB connection setup
│   ├── controllers/              # Business logic (7 controllers)
│   │   ├── adminController.js   # Admin operations (17.2 KB)
│   │   ├── analyticsController.js # Analytics & statistics (31.8 KB)
│   │   ├── authController.js    # Authentication & user management (6.1 KB)
│   │   ├── clubController.js    # Club operations (30.7 KB)
│   │   ├── reviewController.js  # Review management (11.4 KB)
│   │   ├── showController.js    # Show operations (7.8 KB)
│   │   └── watchlistController.js # Watchlist management (10.9 KB)
│   ├── middleware/               # Custom middleware
│   │   ├── adminMiddleware.js   # Admin authorization
│   │   ├── authMiddleware.js    # JWT authentication & role checks
│   │   └── errorMiddleware.js   # Error handling
│   ├── models/                   # MongoDB schemas (7 models)
│   │   ├── Analytics.js         # User & global analytics schemas
│   │   ├── Club.js              # Club, post, and poll schemas
│   │   ├── Reminder.js          # Episode reminder schema
│   │   ├── Review.js            # Review schema
│   │   ├── Show.js              # Show, episode, and streaming link schemas
│   │   ├── User.js              # User schema with preferences
│   │   └── Watchlist.js         # Watchlist schema
│   ├── routes/                   # API endpoints (7 route files)
│   │   ├── adminRoutes.js       # Admin endpoints
│   │   ├── analyticsRoutes.js   # Analytics endpoints
│   │   ├── authRoutes.js        # Authentication endpoints
│   │   ├── clubRoutes.js        # Club endpoints
│   │   ├── reviewRoutes.js      # Review endpoints
│   │   ├── showRoutes.js        # Show endpoints
│   │   └── watchlistRoutes.js   # Watchlist endpoints
│   ├── utils/                    # Helper functions
│   │   ├── generateToken.js     # JWT token generation
│   │   ├── recommendationEngine.js # Show recommendation logic
│   │   ├── seedAnalytics.js     # Analytics seeding utility
│   │   ├── seedClubs.js         # Club seeding utility
│   │   └── seedData.js          # Show data seeding utility
│   ├── .env                      # Environment variables (not in git)
│   ├── env.example               # Environment variables template
│   ├── package.json              # Backend dependencies
│   ├── seed.js                   # Main seeding script
│   ├── seedAnalytics.js          # Analytics seeding script
│   ├── seedClubs.js              # Club seeding script
│   ├── runAnalyticsSeed.js       # Analytics seed runner
│   └── server.js                 # Express server entry point
├── frontend/                     # React.js + Tailwind CSS
│   ├── public/                   # Static assets
│   │   └── index.html           # HTML template
│   ├── src/
│   │   ├── api/                 # API service functions (7 modules)
│   │   │   ├── adminApi.js      # Admin API calls (7.8 KB)
│   │   │   ├── analyticsApi.js  # Analytics API calls (4.3 KB)
│   │   │   ├── authApi.js       # Authentication API calls (2.6 KB)
│   │   │   ├── clubApi.js       # Club API calls (4.3 KB)
│   │   │   ├── reviewApi.js     # Review API calls (2.1 KB)
│   │   │   ├── showApi.js       # Show API calls (2.3 KB)
│   │   │   └── watchlistApi.js  # Watchlist API calls (2.0 KB)
│   │   ├── components/          # Reusable UI components (11 components)
│   │   │   ├── AdminRoute.js    # Admin route protection (1.8 KB)
│   │   │   ├── AnalyticsChart.js # Chart visualization (9.5 KB)
│   │   │   ├── ClubCard.js      # Club preview card (1.4 KB)
│   │   │   ├── Navbar.js        # Navigation bar (16.4 KB)
│   │   │   ├── PollCard.js      # Poll display and voting (11.1 KB)
│   │   │   ├── PollResultsModal.js # Poll results modal (6.4 KB)
│   │   │   ├── PostCard.js      # Discussion post card (12.1 KB)
│   │   │   ├── PrivateRoute.js  # Private route protection (0.9 KB)
│   │   │   ├── ReviewBox.js     # Review display and creation (8.2 KB)
│   │   │   ├── ShowCard.js      # Show preview card (19.0 KB)
│   │   │   └── WatchlistTabs.js # Watchlist tab navigation (2.1 KB)
│   │   ├── context/             # React context providers
│   │   │   ├── AuthContext.js   # Authentication state (6.6 KB)
│   │   │   └── ThemeContext.js  # Theme state (4.3 KB)
│   │   ├── data/                # Static data and constants
│   │   ├── pages/               # Application pages (11 pages)
│   │   │   ├── AdminDashboard.js # Admin panel (47.7 KB)
│   │   │   ├── Analytics.js     # User analytics page (27.7 KB)
│   │   │   ├── ClubDetail.js    # Individual club page (31.4 KB)
│   │   │   ├── ClubEdit.js      # Club creation/editing (15.2 KB)
│   │   │   ├── Clubs.js         # Club discovery page (17.9 KB)
│   │   │   ├── Home.js          # Landing page (12.1 KB)
│   │   │   ├── Login.js         # Login page (6.9 KB)
│   │   │   ├── Register.js      # Registration page (11.4 KB)
│   │   │   ├── Search.js        # Advanced search page (16.2 KB)
│   │   │   ├── ShowDetails.js   # Show details page (27.9 KB)
│   │   │   └── Watchlist.js     # Watchlist page (3.5 KB)
│   │   ├── App.js               # Main application component
│   │   ├── index.css            # Global styles (7.7 KB)
│   │   └── index.js             # React entry point
│   ├── build/                   # Production build output
│   ├── package.json             # Frontend dependencies
│   ├── postcss.config.js        # PostCSS configuration
│   └── tailwind.config.js       # Tailwind CSS configuration
├── package.json                 # Root package configuration
├── package-lock.json            # Dependency lock file
└── README.md                    # This file

Total Files: 60+ files across backend and frontend
Total Code: ~250 KB of source code
```

### Architecture Patterns

#### Backend Architecture
- **MVC Pattern**: Model-View-Controller separation
- **RESTful API**: Standard HTTP methods and status codes
- **Middleware Chain**: Authentication → Validation → Business Logic → Response
- **Error Handling**: Centralized error middleware
- **Database**: MongoDB with Mongoose ODM

#### Frontend Architecture
- **Component-Based**: Reusable React components
- **Context API**: Global state management (Auth, Theme)
- **React Query**: Server state management and caching
- **React Router**: Client-side routing with protected routes
- **Utility-First CSS**: Tailwind CSS for styling

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** - Comes with Node.js

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/otakutrack.git
cd otakutrack
```

#### 2. Install All Dependencies

**Option A: Install all at once (Recommended)**
```bash
npm run install-all
```

**Option B: Install separately**
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

#### 3. Environment Configuration

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp env.example .env
```

Update the `.env` file with your configuration:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/otakutrack

# JWT Secret (use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here_change_this

# Server Port
PORT=5000

# Node Environment
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

#### 4. Start MongoDB

**Windows:**
```bash
# If MongoDB is installed as a service
net start MongoDB

# Or run manually
mongod
```

**macOS/Linux:**
```bash
# If MongoDB is installed as a service
sudo systemctl start mongod

# Or run manually
mongod --dbpath /path/to/data/directory
```

#### 5. Seed the Database (Optional but Recommended)

Populate the database with sample data:

```bash
# From the backend directory
cd backend

# Seed shows and users
npm run seed

# Seed clubs with posts and polls
node seedClubs.js

# Seed analytics data
node seedAnalytics.js
```

This will create:
- Sample anime/TV shows with episodes and streaming links
- Test user accounts
- Sample clubs with discussions and polls
- Analytics data for testing

#### 6. Start the Application

**Option A: Start both frontend and backend concurrently (Recommended)**
```bash
# From the root directory
npm run dev
```

**Option B: Start separately**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

#### 7. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000 (in development mode)

### Default Test Accounts

After seeding, you can use these accounts:

**Admin Account:**
- Email: `admin@otakutrack.com`
- Password: `admin123`

**Regular User:**
- Email: `user@otakutrack.com`
- Password: `user123`

---

## 📚 API Documentation

### Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-domain.com/api`

### Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### API Endpoints

#### Authentication Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/register` | Public | Register a new user |
| POST | `/auth/login` | Public | Login and get JWT token |
| GET | `/auth/profile` | Private | Get current user profile |
| PUT | `/auth/profile` | Private | Update user profile |
| PUT | `/auth/change-password` | Private | Change user password |

**Register User**
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Login User**
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Shows Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/shows` | Public | Get all shows with filtering |
| GET | `/shows/:id` | Public | Get show by ID |
| GET | `/shows/popular` | Public | Get popular shows |
| GET | `/shows/trending` | Public | Get trending shows |
| GET | `/shows/genre/:genre` | Public | Get shows by genre |
| GET | `/shows/search?q=query` | Public | Search shows |

**Query Parameters for GET /shows:**
- `genre`: Filter by genre
- `type`: Filter by type (TV, Movie, OVA, etc.)
- `status`: Filter by status (Ongoing, Completed, etc.)
- `year`: Filter by year
- `sort`: Sort by (rating, popularity, year)
- `limit`: Number of results (default: 20)
- `page`: Page number (default: 1)

#### Watchlist Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/watchlist` | Private | Get user's watchlist |
| POST | `/watchlist` | Private | Add show to watchlist |
| PUT | `/watchlist/:id` | Private | Update watchlist item |
| DELETE | `/watchlist/:id` | Private | Remove from watchlist |
| PUT | `/watchlist/:id/episode` | Private | Update episode progress |

**Add to Watchlist**
```json
POST /api/watchlist
{
  "showId": "show_id_here",
  "status": "Watching",
  "progress": {
    "currentEpisode": 5,
    "totalEpisodes": 12
  },
  "rating": 8
}
```

#### Clubs Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/clubs` | Private | Get all clubs with search and filters |
| POST | `/clubs` | Private | Create new club |
| GET | `/clubs/:id` | Private | Get club by ID with posts and polls |
| PUT | `/clubs/:id` | Private | Update club (admin only) |
| DELETE | `/clubs/:id` | Private | Delete club (admin only) |
| POST | `/clubs/:id/join` | Private | Join club |
| POST | `/clubs/:id/leave` | Private | Leave club |
| POST | `/clubs/:id/posts` | Private | Create post in club |
| PUT | `/clubs/:clubId/posts/:postId` | Private | Update post |
| DELETE | `/clubs/:clubId/posts/:postId` | Private | Delete post |
| POST | `/clubs/:clubId/posts/:postId/comments` | Private | Add comment to post |
| POST | `/clubs/:clubId/posts/:postId/like` | Private | Like/unlike post |
| POST | `/clubs/:id/polls` | Private | Create poll in club |
| POST | `/clubs/:clubId/polls/:pollId/vote` | Private | Vote on poll |

**Create Club**
```json
POST /api/clubs
{
  "name": "Naruto Fans Club",
  "description": "A club for all Naruto fans",
  "category": "Show",
  "relatedShow": "show_id_here",
  "isPrivate": false,
  "rules": ["Be respectful", "No spoilers without tags"]
}
```

**Create Poll**
```json
POST /api/clubs/:id/polls
{
  "question": "Who is your favorite character?",
  "options": [
    { "text": "Naruto" },
    { "text": "Sasuke" },
    { "text": "Sakura" }
  ],
  "isMultipleChoice": false,
  "endDate": "2024-12-31"
}
```

#### Reviews Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/reviews/show/:showId` | Public | Get reviews for a show |
| POST | `/reviews` | Private | Create review |
| PUT | `/reviews/:id` | Private | Update review |
| DELETE | `/reviews/:id` | Private | Delete review |
| POST | `/reviews/:id/helpful` | Private | Mark review as helpful |

**Create Review**
```json
POST /api/reviews
{
  "showId": "show_id_here",
  "rating": 9,
  "title": "Amazing anime!",
  "comment": "This is one of the best anime I've ever watched...",
  "isSpoiler": false
}
```

#### Analytics Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/analytics/user` | Private | Get user analytics |
| GET | `/analytics/user/:userId` | Admin | Get specific user analytics |
| GET | `/analytics/global` | Admin | Get global platform analytics |
| POST | `/analytics/update` | Private | Update user analytics |

#### Admin Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/admin/users` | Admin | Get all users |
| PUT | `/admin/users/:id/ban` | Admin | Ban user |
| PUT | `/admin/users/:id/unban` | Admin | Unban user |
| PUT | `/admin/users/:id/role` | Admin | Update user role |
| GET | `/admin/clubs` | Admin | Get all clubs |
| PUT | `/admin/clubs/:id/approve` | Admin | Approve club |
| DELETE | `/admin/clubs/:id` | Admin | Delete club |
| GET | `/admin/reviews` | Admin | Get all reviews |
| DELETE | `/admin/reviews/:id` | Admin | Delete review |
| GET | `/admin/stats` | Admin | Get platform statistics |

---

## 💾 Database Models

### User Model

**Schema**: `models/User.js`

```javascript
{
  name: String (required, max 50 chars),
  email: String (required, unique, validated),
  password: String (required, hashed, min 6 chars),
  preferences: {
    favoriteGenres: [String],
    favoriteTags: [String],
    theme: String (light/dark),
    notifications: {
      email: Boolean,
      inApp: Boolean
    }
  },
  role: String (user/admin/moderator),
  avatar: String,
  isActive: Boolean,
  timestamps: true
}
```

**Methods**:
- `matchPassword(enteredPassword)`: Compare password with hashed password

**Middleware**:
- Pre-save hook to hash password with bcrypt

### Show Model

**Schema**: `models/Show.js`

```javascript
{
  title: String (required, max 200 chars),
  originalTitle: String,
  description: String (required, max 2000 chars),
  type: String (TV/Movie/OVA/Special/ONA),
  status: String (Ongoing/Completed/Upcoming/Hiatus/Cancelled),
  genres: [String] (22 predefined genres),
  tags: [String],
  episodes: [{
    number: Number,
    title: String,
    description: String,
    duration: Number,
    airDate: Date,
    thumbnail: String
  }],
  totalEpisodes: Number,
  season: String (Spring/Summer/Fall/Winter),
  year: Number (1900 - current+10),
  rating: {
    average: Number (0-10),
    count: Number
  },
  streamingLinks: [{
    platform: String,
    url: String,
    region: String
  }],
  poster: String (required),
  banner: String,
  trailer: String,
  studio: String,
  source: String (Manga/Light Novel/Original/etc.),
  ageRating: String (G/PG/PG-13/R/R+/Unknown),
  duration: Number (default 24 minutes),
  isPopular: Boolean,
  isRecommended: Boolean,
  timestamps: true
}
```

**Virtuals**:
- `episodeCount`: Number of episodes
- `streamingLinksCount`: Number of streaming platforms
- `tagsCount`: Number of tags
- `genresCount`: Number of genres

**Indexes**:
- Text index on title, description, genres, and tags for search

### Watchlist Model

**Schema**: `models/Watchlist.js`

```javascript
{
  userId: ObjectId (ref: User, required),
  showId: ObjectId (ref: Show, required),
  status: String (Watching/Completed/On Hold/Dropped/Plan to Watch),
  progress: {
    currentEpisode: Number (min 0),
    totalEpisodes: Number,
    rewatchCount: Number
  },
  rating: Number (0-10),
  notes: String (max 500 chars),
  startDate: Date,
  finishDate: Date,
  lastWatched: Date,
  isPrivate: Boolean,
  tags: [String],
  timestamps: true
}
```

**Indexes**:
- Compound unique index on userId and showId

**Virtuals**:
- `completionPercentage`: Calculated progress percentage
- `timeSpent`: Days between start and finish dates

### Club Model

**Schema**: `models/Club.js`

```javascript
{
  name: String (required, unique, max 100 chars),
  description: String (required, max 1000 chars),
  avatar: String,
  banner: String,
  category: String (General/Genre/Show/Seasonal/Discussion/Fan Art/Cosplay/Gaming/Other),
  relatedShow: ObjectId (ref: Show),
  members: [{
    userId: ObjectId (ref: User),
    role: String (member/moderator/admin),
    joinedAt: Date
  }],
  posts: [{
    title: String (max 200 chars),
    content: String (max 5000 chars),
    author: ObjectId (ref: User),
    isSpoiler: Boolean,
    spoilerFor: {
      showId: ObjectId,
      episodeNumber: Number
    },
    likes: [{
      userId: ObjectId,
      timestamp: Date
    }],
    comments: [{
      userId: ObjectId,
      content: String (max 1000 chars),
      timestamp: Date
    }],
    tags: [String],
    timestamps: true
  }],
  polls: [{
    question: String (max 200 chars),
    options: [{
      text: String,
      votes: [{
        userId: ObjectId,
        timestamp: Date
      }]
    }],
    isActive: Boolean,
    endDate: Date,
    createdBy: ObjectId (ref: User),
    isMultipleChoice: Boolean,
    timestamps: true
  }],
  rules: [String],
  isPrivate: Boolean,
  isSpoilerFree: Boolean,
  maxMembers: Number (default 1000),
  tags: [String],
  isActive: Boolean,
  createdBy: ObjectId (ref: User, required),
  timestamps: true
}
```

**Virtuals**:
- `memberCount`: Number of members
- `postCount`: Number of posts

**Indexes**:
- Text index on name, description, and tags

### Review Model

**Schema**: `models/Review.js`

```javascript
{
  userId: ObjectId (ref: User, required),
  showId: ObjectId (ref: Show, required),
  rating: Number (1-10, required),
  title: String (max 100 chars),
  comment: String (max 2000 chars),
  isSpoiler: Boolean,
  spoilerFor: {
    episode: Number,
    season: Number
  },
  helpful: [{
    userId: ObjectId,
    isHelpful: Boolean,
    timestamp: Date
  }],
  isApproved: Boolean,
  tags: [String],
  timestamps: true
}
```

**Indexes**:
- Compound unique index on userId and showId

### Analytics Model

**Schema**: `models/Analytics.js`

Two schemas: `UserAnalytics` and `GlobalAnalytics`

**UserAnalytics**:
```javascript
{
  userId: ObjectId (ref: User, required, unique),
  episodesWatched: Number,
  totalWatchTime: Number (minutes),
  showsInWatchlist: Number,
  completedShows: Number,
  watchingShows: Number,
  onHoldShows: Number,
  droppedShows: Number,
  planToWatchShows: Number,
  reviewsPosted: Number,
  commentsPosted: Number,
  clubPosts: Number,
  clubLikes: Number,
  clubsJoined: Number,
  favoriteGenres: [{
    genre: String,
    count: Number
  }],
  lastActivity: Date,
  weeklyActivity: {
    episodesWatched: Number,
    showsAdded: Number,
    reviewsPosted: Number,
    clubPosts: Number,
    pollVotes: Number
  },
  monthlyActivity: { ... },
  timestamps: true
}
```

**Virtuals**:
- `engagementScore`: Calculated engagement metric
- `avgEpisodesPerDay`: Average episodes per day since joining

**GlobalAnalytics**:
```javascript
{
  totalUsers: Number,
  totalShows: Number,
  totalEpisodesTracked: Number,
  totalWatchTime: Number,
  totalReviews: Number,
  totalClubs: Number,
  mostWatchedShows: [{
    showId: ObjectId,
    title: String,
    watchCount: Number
  }],
  topGenres: [{
    genre: String,
    count: Number
  }],
  dailyActiveUsers: Number,
  weeklyActiveUsers: Number,
  monthlyActiveUsers: Number,
  recentActivity: [{
    type: String,
    userId: ObjectId,
    showId: ObjectId,
    timestamp: Date
  }],
  timestamps: true
}
```

### Reminder Model

**Schema**: `models/Reminder.js`

```javascript
{
  userId: ObjectId (ref: User, required),
  showId: ObjectId (ref: Show, required),
  episodeNumber: Number,
  reminderDate: Date (required),
  notificationType: String (email/inApp/both),
  isActive: Boolean,
  isSent: Boolean,
  timestamps: true
}
```

---

## 🎨 Frontend Components

### Design System

**Tailwind Configuration**: `frontend/tailwind.config.js`

#### Custom Color Palette
- **Primary**: Blue shades (50-900)
- **Secondary**: Amber shades (50-900)
- **Accent**: Pink shades (50-900)
- **Success**: Green shades (50-900)
- **Danger**: Red shades (50-900)
- **Warning**: Amber shades (50-900)
- **Info**: Blue shades (50-900)

#### Custom Animations
- `fade-in`: Fade in with upward motion (0.5s)
- `slide-in`: Slide in from left (0.3s)
- `bounce-gentle`: Gentle bounce effect (0.6s)

#### Custom Shadows
- `soft`: Subtle shadow for cards
- `medium`: Medium depth shadow
- `strong`: Strong depth shadow

#### Typography
- Font Family: Inter (Google Fonts)

### Core Components

#### 1. Navbar (`components/Navbar.js`)
**Size**: 16.4 KB

**Features**:
- Responsive navigation with mobile menu
- Theme toggle (dark/light mode)
- User authentication status
- Profile dropdown
- Active route highlighting
- Mobile hamburger menu

#### 2. ShowCard (`components/ShowCard.js`)
**Size**: 19.0 KB

**Features**:
- Show poster with fallback
- Rating display with stars
- Genre badges
- Status indicator
- Add to watchlist button
- Hover effects and animations
- Responsive grid layout

#### 3. WatchlistTabs (`components/WatchlistTabs.js`)
**Size**: 2.1 KB

**Features**:
- 5 status tabs (Watching, Completed, On Hold, Dropped, Plan to Watch)
- Active tab highlighting
- Count badges for each status
- Responsive design

#### 4. ClubCard (`components/ClubCard.js`)
**Size**: 1.4 KB

**Features**:
- Club avatar and banner
- Member count
- Category badge
- Join/Leave button
- Privacy indicator

#### 5. PostCard (`components/PostCard.js`)
**Size**: 12.1 KB

**Features**:
- Post title and content
- Author information
- Like/Unlike functionality
- Comment system with threading
- Spoiler protection
- Timestamp display
- Edit/Delete options (for author)

#### 6. PollCard (`components/PollCard.js`)
**Size**: 11.1 KB

**Features**:
- Poll question display
- Multiple/Single choice options
- Vote submission
- Real-time results
- Visual progress bars
- Vote count display
- Expiration date

#### 7. PollResultsModal (`components/PollResultsModal.js`)
**Size**: 6.4 KB

**Features**:
- Modal overlay
- Detailed vote breakdown
- Percentage calculations
- Visual charts
- Close button

#### 8. ReviewBox (`components/ReviewBox.js`)
**Size**: 8.2 KB

**Features**:
- Review creation form
- Rating input (1-10)
- Spoiler toggle
- Character count
- Review display
- Helpful voting
- Edit/Delete options

#### 9. AnalyticsChart (`components/AnalyticsChart.js`)
**Size**: 9.5 KB

**Features**:
- Recharts integration
- Multiple chart types (Bar, Line, Pie, Area)
- Responsive design
- Custom tooltips
- Legend display
- Color customization
- Dark mode support

#### 10. PrivateRoute (`components/PrivateRoute.js`)
**Size**: 0.9 KB

**Features**:
- Authentication check
- Redirect to login
- Protected route wrapper

#### 11. AdminRoute (`components/AdminRoute.js`)
**Size**: 1.8 KB

**Features**:
- Admin role check
- Redirect to home
- Admin-only route wrapper

### Pages

#### 1. Home (`pages/Home.js`)
**Size**: 12.1 KB

**Features**:
- Hero section with call-to-action
- Trending shows carousel
- Popular shows grid
- Genre filters
- Search bar
- Responsive layout

#### 2. Login (`pages/Login.js`)
**Size**: 6.9 KB

**Features**:
- Email/Password form
- Form validation
- Error handling
- Remember me option
- Link to registration
- Loading state

#### 3. Register (`pages/Register.js`)
**Size**: 11.4 KB

**Features**:
- Name/Email/Password form
- Password confirmation
- Form validation
- Error handling
- Link to login
- Loading state
- Genre preferences selection

#### 4. Watchlist (`pages/Watchlist.js`)
**Size**: 3.5 KB

**Features**:
- Tabbed interface by status
- Show cards grid
- Progress tracking
- Quick actions (update status, rating)
- Empty state handling

#### 5. ShowDetails (`pages/ShowDetails.js`)
**Size**: 27.9 KB

**Features**:
- Full show information
- Episode list with progress
- Streaming links
- Add to watchlist
- Reviews section
- Rating system
- Trailer embed
- Related shows

#### 6. Clubs (`pages/Clubs.js`)
**Size**: 17.9 KB

**Features**:
- Club discovery grid
- Search functionality
- Category filters
- Create club button
- Join/Leave actions
- Pagination

#### 7. ClubDetail (`pages/ClubDetail.js`)
**Size**: 31.4 KB

**Features**:
- Club header with banner
- Member list
- Posts feed
- Polls section
- Create post/poll
- Comment system
- Like functionality
- Admin controls

#### 8. ClubEdit (`pages/ClubEdit.js`)
**Size**: 15.2 KB

**Features**:
- Club creation/editing form
- Avatar/Banner upload
- Category selection
- Rules management
- Privacy settings
- Member limit
- Related show selection

#### 9. Analytics (`pages/Analytics.js`)
**Size**: 27.7 KB

**Features**:
- Personal statistics dashboard
- Watch time charts
- Genre preference visualization
- Activity timeline
- Engagement metrics
- Weekly/Monthly breakdowns
- Interactive charts

#### 10. Search (`pages/Search.js`)
**Size**: 16.2 KB

**Features**:
- Advanced search form
- Multiple filters (genre, type, status, year)
- Sort options
- Results grid
- Pagination
- Loading states

#### 11. AdminDashboard (`pages/AdminDashboard.js`)
**Size**: 47.7 KB

**Features**:
- Platform statistics
- User management table
- Club moderation
- Review moderation
- Ban/Unban users
- Role management
- Content approval
- Analytics charts

### Context Providers

#### 1. AuthContext (`context/AuthContext.js`)
**Size**: 6.6 KB

**Features**:
- User authentication state
- Login/Logout functions
- Token management
- User profile data
- Loading states
- Error handling

#### 2. ThemeContext (`context/ThemeContext.js`)
**Size**: 4.3 KB

**Features**:
- Dark/Light theme state
- Theme toggle function
- System preference detection
- LocalStorage persistence
- CSS class management

---

## 🔐 Authentication & Security

### JWT Authentication

**Token Generation**: `backend/utils/generateToken.js`

```javascript
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};
```

### Password Security

- **Hashing Algorithm**: bcrypt with 10 salt rounds
- **Pre-save Hook**: Automatic password hashing before saving to database
- **Password Comparison**: Secure comparison using bcrypt.compare()

### Middleware Protection

**Authentication Middleware**: `backend/middleware/authMiddleware.js`

1. **protect**: Verify JWT token and attach user to request
2. **admin**: Check if user has admin role
3. **moderator**: Check if user has moderator or admin role
4. **ownerOrAdmin**: Check if user owns resource or is admin

### Role-Based Access Control (RBAC)

**User Roles**:
- **User**: Default role, access to basic features
- **Moderator**: Can moderate content, manage clubs
- **Admin**: Full access to all features and admin panel

### Security Best Practices

1. **Password Requirements**:
   - Minimum 6 characters
   - Hashed with bcrypt (10 salt rounds)
   - Never stored in plain text

2. **JWT Tokens**:
   - 30-day expiration
   - Stored in localStorage (frontend)
   - Sent in Authorization header

3. **Input Validation**:
   - Express Validator for all inputs
   - Email format validation
   - String length limits
   - Type checking

4. **CORS Configuration**:
   - Whitelist frontend URL
   - Credentials support
   - Secure headers

5. **Error Handling**:
   - No sensitive data in error messages
   - Centralized error middleware
   - Proper HTTP status codes

6. **Database Security**:
   - Mongoose schema validation
   - Unique constraints
   - Index optimization

---

## 🚀 Deployment

### Environment Variables

**Production `.env` Configuration**:

```env
# MongoDB (use MongoDB Atlas for production)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/otakutrack?retryWrites=true&w=majority

# JWT Secret (use a strong random string)
JWT_SECRET=your_production_jwt_secret_key_here

# Server Configuration
PORT=5000
NODE_ENV=production

# Frontend URL
FRONTEND_URL=https://your-domain.com

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
```

### Backend Deployment

#### Option 1: Heroku

1. **Install Heroku CLI**:
```bash
npm install -g heroku
```

2. **Login to Heroku**:
```bash
heroku login
```

3. **Create Heroku App**:
```bash
cd backend
heroku create your-app-name
```

4. **Set Environment Variables**:
```bash
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://your-frontend-url.com
```

5. **Deploy**:
```bash
git push heroku main
```

#### Option 2: DigitalOcean/AWS/VPS

1. **Setup Server**:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
# Follow MongoDB installation guide for your OS

# Install PM2 (Process Manager)
sudo npm install -g pm2
```

2. **Clone and Setup**:
```bash
git clone https://github.com/yourusername/otakutrack.git
cd otakutrack/backend
npm install --production
```

3. **Configure Environment**:
```bash
nano .env
# Add your production environment variables
```

4. **Start with PM2**:
```bash
pm2 start server.js --name otakutrack-backend
pm2 save
pm2 startup
```

5. **Setup Nginx (Reverse Proxy)**:
```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

6. **SSL with Let's Encrypt**:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.your-domain.com
```

### Frontend Deployment

#### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Build Frontend**:
```bash
cd frontend
npm run build
```

3. **Deploy**:
```bash
vercel --prod
```

4. **Configure Environment**:
   - Add `REACT_APP_API_URL` in Vercel dashboard
   - Set to your backend URL

#### Option 2: Netlify

1. **Build Frontend**:
```bash
cd frontend
npm run build
```

2. **Deploy via Netlify CLI**:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

3. **Configure**:
   - Set build command: `npm run build`
   - Set publish directory: `build`
   - Add environment variables in Netlify dashboard

#### Option 3: Static Hosting (S3, Firebase, etc.)

1. **Build Frontend**:
```bash
cd frontend
npm run build
```

2. **Upload `build` folder** to your hosting provider

3. **Configure**:
   - Set up routing for SPA
   - Add environment variables
   - Configure CORS

### Database Deployment

#### MongoDB Atlas (Recommended)

1. **Create Account**: https://www.mongodb.com/cloud/atlas
2. **Create Cluster**: Choose free tier or paid plan
3. **Configure Network Access**: Add your server IP or 0.0.0.0/0 for development
4. **Create Database User**: Set username and password
5. **Get Connection String**: Copy connection string
6. **Update `.env`**: Set `MONGODB_URI` to your connection string

### Docker Deployment (Optional)

**Backend Dockerfile**:
```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

**Frontend Dockerfile**:
```dockerfile
FROM node:16-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Docker Compose**:
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  mongodb:
    image: mongo:5
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

**Deploy with Docker Compose**:
```bash
docker-compose up -d
```

---

## 🤝 Contributing

We welcome contributions to OtakuTrack! Here's how you can help:

### Getting Started

1. **Fork the Repository**
2. **Clone Your Fork**:
```bash
git clone https://github.com/your-username/otakutrack.git
cd otakutrack
```

3. **Create a Branch**:
```bash
git checkout -b feature/your-feature-name
```

4. **Make Your Changes**
5. **Test Your Changes**
6. **Commit Your Changes**:
```bash
git add .
git commit -m "Add: your feature description"
```

7. **Push to Your Fork**:
```bash
git push origin feature/your-feature-name
```

8. **Create a Pull Request**

### Contribution Guidelines

- **Code Style**: Follow existing code style and conventions
- **Comments**: Add comments for complex logic
- **Testing**: Test your changes thoroughly
- **Documentation**: Update README if needed
- **Commit Messages**: Use clear, descriptive commit messages

### Areas for Contribution

- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- ⚡ Performance optimizations
- 🧪 Test coverage
- 🌐 Internationalization (i18n)

---

## 📝 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2024 OtakuTrack Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

### Technologies & Libraries

- **[React](https://reactjs.org/)** - A JavaScript library for building user interfaces
- **[Node.js](https://nodejs.org/)** - JavaScript runtime built on Chrome's V8 engine
- **[Express.js](https://expressjs.com/)** - Fast, unopinionated, minimalist web framework
- **[MongoDB](https://www.mongodb.com/)** - The most popular NoSQL database
- **[Mongoose](https://mongoosejs.com/)** - Elegant MongoDB object modeling for Node.js
- **[Tailwind CSS](https://tailwindcss.com/)** - A utility-first CSS framework
- **[Recharts](https://recharts.org/)** - A composable charting library built on React components
- **[React Query](https://react-query.tanstack.com/)** - Powerful asynchronous state management
- **[React Router](https://reactrouter.com/)** - Declarative routing for React
- **[React Icons](https://react-icons.github.io/react-icons/)** - Popular icons as React components
- **[React Hot Toast](https://react-hot-toast.com/)** - Smoking hot React notifications
- **[JWT](https://jwt.io/)** - JSON Web Tokens for secure authentication
- **[bcrypt](https://www.npmjs.com/package/bcryptjs)** - Library to help hash passwords

### Inspiration

- **MyAnimeList** - For anime tracking inspiration
- **AniList** - For modern UI/UX design patterns
- **Kitsu** - For community features inspiration

---

## 📞 Support & Contact

### Get Help

- 📧 **Email**: support@otakutrack.com
- 💬 **Discord**: [Join our community](https://discord.gg/otakutrack)
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/otakutrack/issues)
- 📖 **Documentation**: [Wiki](https://github.com/yourusername/otakutrack/wiki)

### FAQ

**Q: How do I reset my password?**
A: Use the "Forgot Password" link on the login page.

**Q: Can I import my watchlist from other platforms?**
A: This feature is planned for a future release.

**Q: How do I report a bug?**
A: Open an issue on GitHub with detailed steps to reproduce.

**Q: Can I contribute to the project?**
A: Yes! See the [Contributing](#-contributing) section.

---

## 🎯 Roadmap

### Version 2.0 (Planned)

- [ ] **Mobile App** - React Native mobile application
- [ ] **Advanced Recommendations** - ML-based recommendation engine
- [ ] **Social Features**:
  - [ ] Friend system
  - [ ] Activity feed
  - [ ] Direct messaging
  - [ ] User profiles
- [ ] **Content Features**:
  - [ ] Manga tracking
  - [ ] Light novel tracking
  - [ ] Character database
  - [ ] Voice actor database
- [ ] **Technical Improvements**:
  - [ ] GraphQL API
  - [ ] Real-time notifications (WebSockets)
  - [ ] Progressive Web App (PWA)
  - [ ] Offline support
  - [ ] API rate limiting
  - [ ] Caching optimization
- [ ] **Internationalization**:
  - [ ] Multi-language support
  - [ ] RTL language support
  - [ ] Localized content
- [ ] **Integrations**:
  - [ ] MyAnimeList import/export
  - [ ] AniList sync
  - [ ] Streaming platform integration
  - [ ] Social media sharing

### Version 1.5 (In Progress)

- [x] Club system with polls
- [x] Advanced analytics
- [x] Admin dashboard
- [ ] Email notifications
- [ ] User badges and achievements
- [ ] Advanced search filters
- [ ] Export watchlist data

---

## 📊 Project Statistics

- **Total Lines of Code**: ~15,000+
- **Backend Files**: 30+
- **Frontend Files**: 30+
- **Database Models**: 7
- **API Endpoints**: 50+
- **React Components**: 11
- **Pages**: 11
- **Development Time**: 200+ hours

---

## 🌟 Features at a Glance

| Feature | Status | Description |
|---------|--------|-------------|
| User Authentication | ✅ | JWT-based login/register |
| Show Tracking | ✅ | Browse and search anime/TV shows |
| Watchlist | ✅ | Track shows with 5 status types |
| Episode Progress | ✅ | Monitor episode completion |
| Reviews & Ratings | ✅ | Rate and review shows |
| Clubs | ✅ | Create and join fan clubs |
| Discussions | ✅ | Engage in club discussions |
| Polls | ✅ | Create and vote on polls |
| Analytics | ✅ | Personal viewing statistics |
| Admin Dashboard | ✅ | Platform management |
| Dark Mode | ✅ | Theme switching |
| Responsive Design | ✅ | Mobile, tablet, desktop |
| Reminders | 🚧 | Episode reminders (in progress) |
| Email Notifications | 🚧 | Email alerts (planned) |
| Mobile App | 📅 | React Native app (planned) |
| Social Features | 📅 | Friends, messaging (planned) |

**Legend**: ✅ Complete | 🚧 In Progress | 📅 Planned

---

<div align="center">

**Built with ❤️ for the anime and TV series community**

*OtakuTrack - Where every episode matters, every review counts, and every fan belongs.*

---

**[⬆ Back to Top](#-otakutrack---anime--tv-series-tracker)**

</div>