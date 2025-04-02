import { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import axios from 'axios';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Check for existing token in localStorage on component mount
    const storedToken = localStorage.getItem('authToken');
    const storedUserData = localStorage.getItem('userData');
    
    if (storedToken && storedUserData) {
      const userData = JSON.parse(storedUserData);
      setToken(storedToken);
      setUserRole(userData.rol);
      setUserData(userData);
      setIsAuthenticated(true);
      document.body.classList.add('dashboard-active');
    }
  }, []);

  useEffect(() => {
    // Add or remove dashboard-active class based on authentication state
    if (isAuthenticated) {
      document.body.classList.add('dashboard-active');
    } else {
      document.body.classList.remove('dashboard-active');
    }
    
    // Cleanup function
    return () => {
      document.body.classList.remove('dashboard-active');
    };
  }, [isAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Call the backend authentication API
      const response = await axios.post('http://localhost:8001/auth/login', {
        correo: username,
        contrasena: password
      });

      // Handle the specific response format
      if (response.data && response.data.token && response.data.usuario) {
        const { token } = response.data;
        const userData = response.data.usuario;
        
        // Store in state
        setToken(token);
        setUserRole(userData.rol);
        setUserData(userData);
        setIsAuthenticated(true);
        
        // Store in localStorage for persistence
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        setError('');
      } else {
        setError('Respuesta inválida del servidor');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response && err.response.status === 401) {
        setError('Credenciales incorrectas');
      } else {
        // Fallback to mock authentication for development/testing
        handleMockLogin();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback mock login for development/testing
  const handleMockLogin = () => {
    if (username === 'admin' && password === 'admin123') {
      const mockToken = 'mock-admin-token-123';
      const mockUserData = {
        id: 1,
        nombre: 'Admin Test',
        rol: 'Administrador',
        correo: 'admin@test.com'
      };
      
      setToken(mockToken);
      setUserRole('Administrador');
      setUserData(mockUserData);
      setIsAuthenticated(true);
      
      localStorage.setItem('authToken', mockToken);
      localStorage.setItem('userData', JSON.stringify(mockUserData));
      
      setError('');
    } else if (username === 'almacenista' && password === 'almacen123') {
      const mockToken = 'mock-warehouse-token-123';
      const mockUserData = {
        id: 2,
        nombre: 'Almacenista Test',
        rol: 'Almacenista',
        correo: 'almacenista@test.com'
      };
      
      setToken(mockToken);
      setUserRole('Almacenista');
      setUserData(mockUserData);
      setIsAuthenticated(true);
      
      localStorage.setItem('authToken', mockToken);
      localStorage.setItem('userData', JSON.stringify(mockUserData));
      
      setError('');
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  const handleLogout = async () => {
    try {
      // Call the backend logout endpoint
      await axios.post('http://localhost:8001/auth/logout', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear authentication state and storage regardless of API response
      setIsAuthenticated(false);
      setUserRole('');
      setToken('');
      setUserData(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    }
  };

  if (isAuthenticated && userData) {
    return (
      <Dashboard 
        onLogout={handleLogout}
        userRole={userRole}
        userName={userData.nombre}
        token={token}
        userData={userData}
      />
    );
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Bienvenido</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <input 
              type="text" 
              placeholder="Correo" 
              className="login-input" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <input 
              type="password" 
              placeholder="Contraseña" 
              className="login-input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <button 
            type="submit" 
            className={`login-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Procesando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
