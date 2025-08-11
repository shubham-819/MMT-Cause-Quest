import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import components
import HomePage from './pages/HomePage';
import ActivityDetails from './pages/ActivityDetails';
import CreateActivity from './pages/CreateActivity';
import UserProfile from './pages/UserProfile';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyTrips from './pages/MyTrips';
import Navbar from './components/Navbar';

// Import context
import { AuthProvider } from './context/AuthContext';

// Create MUI theme matching MMT design
const theme = createTheme({
  palette: {
    primary: {
      main: '#0D99FF', // MMT blue gradient start
      light: '#52B0FE',
      dark: '#1768FF',
    },
    secondary: {
      main: '#CF381E', // MMT red
      light: '#FF6B47',
      dark: '#B8281A',
    },
    background: {
      default: 'linear-gradient(135deg, #0D99FF 0%, #1768FF 100%)',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"DM Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Bellefair", serif',
      fontWeight: 400,
    },
    h2: {
      fontFamily: '"Bellefair", serif',
      fontWeight: 400,
    },
    h3: {
      fontFamily: '"DM Sans", sans-serif',
      fontWeight: 900,
    },
    h4: {
      fontFamily: '"DM Sans", sans-serif',
      fontWeight: 800,
    },
    h5: {
      fontFamily: '"DM Sans", sans-serif',
      fontWeight: 700,
    },
    h6: {
      fontFamily: '"DM Sans", sans-serif',
      fontWeight: 700,
    },
    button: {
      fontFamily: '"DM Sans", sans-serif',
      fontWeight: 700,
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/activity/:id" element={<ActivityDetails />} />
              <Route path="/create-activity" element={<CreateActivity />} />
              <Route path="/profile/:id?" element={<UserProfile />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/my-trips" element={<MyTrips />} />
            </Routes>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
