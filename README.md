# MMT Cause Quest - Volun-Tourism Platform

A full-stack web application that combines volunteering with tourism, allowing users to create and participate in meaningful activities while traveling.

## 🚀 Tech Stack

### Frontend
- **React 18** with **Vite** for fast development and building
- **Material-UI (MUI)** for beautiful, responsive UI components
- **React Router** for client-side routing
- **React Query** for efficient data fetching and state management
- **React Hook Form** for form handling
- **Axios** for API communication
- **Socket.io Client** for real-time features

### Backend
- **Node.js** with **Express.js** framework
- **SQLite** database for data persistence
- **JWT** for authentication
- **Multer** for file uploads
- **Socket.io** for real-time communication
- **bcryptjs** for password hashing

## 📋 Prerequisites

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- **Git**

## 🛠️ Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd MMT-Cause-Quest
```

### 2. Install Dependencies

```bash
# Install all dependencies for both client and server
npm run install-deps

# Or install manually:
npm install                    # Root dependencies
cd client && npm install      # Client dependencies
cd ../server && npm install   # Server dependencies
```

### 3. Environment Setup

#### Server Environment
```bash
cd server
cp .env.example .env
# Edit .env file with your configuration
```

#### Client Environment
```bash
cd client
cp .env.example .env
# Edit .env file with your configuration
```

### 4. Database Setup

The SQLite database will be automatically created when you first run the server. Sample data is included.

### 5. Start Development Servers

```bash
# Start both client and server concurrently
npm run dev

# Or start them separately:
npm run server  # Starts backend on http://localhost:5000
npm run client  # Starts frontend on http://localhost:3000
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🏗️ Building for Production

### Frontend Build
```bash
cd client
npm run build
```

### Preview Production Build
```bash
cd client
npm run preview
```

## 🌐 AWS Amplify Deployment

This project is configured for AWS Amplify hosting with full-stack deployment.

### 1. Prerequisites
- AWS Account with Amplify access
- GitHub/GitLab repository

### 2. Amplify Setup
1. Go to AWS Amplify Console
2. Click "New app" → "Host web app"
3. Connect your Git repository
4. Amplify will automatically detect the `amplify.yml` configuration

### 3. Environment Variables

Set these environment variables in Amplify Console:

#### Frontend Variables
- `VITE_API_URL`: Your backend API URL
- `VITE_APP_TITLE`: MMT Cause Quest
- `VITE_NODE_ENV`: production

#### Backend Variables
- `NODE_ENV`: production
- `JWT_SECRET`: Your secure JWT secret
- `PORT`: 5000 (or Amplify assigned port)

### 4. Build Settings

The project includes an `amplify.yml` file with optimized build settings:
- Frontend builds from the `client` directory
- Backend deploys from the `server` directory
- Caching enabled for `node_modules`

## 📂 Project Structure

```
MMT-Cause-Quest/
├── client/                 # React frontend (Vite)
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context providers
│   │   ├── App.js         # Main App component
│   │   └── main.jsx       # Vite entry point
│   ├── package.json
│   └── vite.config.js     # Vite configuration
├── server/                # Node.js backend
│   ├── config/           # Database configuration
│   ├── models/           # Data models
│   ├── uploads/          # File uploads directory
│   ├── index-db.js       # Main server file
│   └── package.json
├── amplify.yml           # AWS Amplify build configuration
├── package.json          # Root package.json
└── README.md
```

## 🔧 Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend
- `npm run client` - Start frontend only
- `npm run server` - Start backend only
- `npm run build` - Build frontend for production
- `npm run install-deps` - Install all dependencies

### Client Scripts
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Server Scripts
- `npm run dev` - Start with nodemon (development)
- `npm start` - Start production server
- `npm test` - Run tests

## 🌟 Features

- **User Authentication** - Secure login/register with JWT
- **Activity Management** - Create and browse volunteer activities
- **Real-time Communication** - Socket.io integration
- **File Uploads** - Image upload for activities
- **Responsive Design** - Mobile-first approach with Material-UI
- **User Profiles** - Customizable user profiles
- **Leaderboard** - Gamification with points system
- **Trip Management** - Track and manage volunteer trips

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- File upload validation
- CORS configuration
- Rate limiting
- Input validation with express-validator

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Include relevant logs and error messages

## 🔮 Future Enhancements

- [ ] Mobile app with React Native
- [ ] Advanced search and filtering
- [ ] Payment integration
- [ ] Social media sharing
- [ ] Multilingual support
- [ ] Advanced analytics dashboard
