import React, { useState, useEffect } from 'react';
import axios from 'axios';

function HistoryModule({ token }) {
  const [movements, setMovements] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Fetch movement history from API
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8001/historial', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Map the response to our format
        if (response.data) {
          const mappedMovements = response.data.map(item => ({
            id: item.id,
            type: item.tipo.toLowerCase(), // Converting "ENTRADA"/"SALIDA" to "entrada"/"salida"
            productId: item.producto?.id,
            productName: item.producto?.nombre,
            quantity: item.cantidad,
            date: parseApiDate(item.fecha),
            userId: item.usuario?.id,
            userName: item.usuario?.nombre,
            userRole: item.usuario?.rol?.nombre
          }));
          
          setMovements(mappedMovements);
          setError('');
        }
      } catch (err) {
        console.error("Error fetching movement history:", err);
        setError('Error al cargar el historial de movimientos');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, [token]);
  
  // Helper to parse the API date format [year, month, day, hour, minute, second]
  const parseApiDate = (dateArray) => {
    if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 6) {
      return new Date(); // fallback to current date
    }
    
    const [year, month, day, hour, minute, second] = dateArray;
    // Month in JS is 0-indexed, but API returns 1-indexed month
    return new Date(year, month - 1, day, hour, minute, second);
  };
  
  // Format date to display in a user-friendly way
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  // Filter movements based on selected type
  const filteredMovements = filterType === 'all' 
    ? movements 
    : movements.filter(movement => movement.type === filterType);
  
  // Sort movements by date (newest first)
  const sortedMovements = [...filteredMovements].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando historial de movimientos...</p>
      </div>
    );
  }

  return (
    <div className="module-container history-module">
      <div className="module-header">
        <h2>Historial de Movimientos</h2>
        <div className="filter-buttons">
          <button 
            className={filterType === 'all' ? 'active' : ''} 
            onClick={() => setFilterType('all')}
          >
            Todos
          </button>
          <button 
            className={filterType === 'entrada' ? 'active' : ''} 
            onClick={() => setFilterType('entrada')}
          >
            Entradas
          </button>
          <button 
            className={filterType === 'salida' ? 'active' : ''} 
            onClick={() => setFilterType('salida')}
          >
            Salidas
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="history-content">
        <div className="history-table">
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Fecha y Hora</th>
                <th>Usuario</th>
                <th>Rol</th>
              </tr>
            </thead>
            <tbody>
              {sortedMovements.length > 0 ? (
                sortedMovements.map(movement => (
                  <tr key={movement.id} className={`movement-${movement.type}`}>
                    <td>
                      <span className={`movement-badge ${movement.type}`}>
                        {movement.type === 'entrada' ? 'Entrada' : 'Salida'}
                      </span>
                    </td>
                    <td>{movement.productName}</td>
                    <td>{movement.quantity}</td>
                    <td>{formatDate(movement.date)}</td>
                    <td>{movement.userName}</td>
                    <td>{movement.userRole}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">No hay movimientos que mostrar</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="history-summary">
          <div className="summary-box">
            <h3>Resumen</h3>
            <div className="summary-stats">
              <div className="stat-card total">
                <div className="stat-icon">
                  <i className="fas fa-chart-bar"></i>
                </div>
                <div className="stat-content">
                  <span className="stat-label">Total de movimientos</span>
                  <span className="stat-value">{sortedMovements.length}</span>
                </div>
              </div>
              <div className="stat-card entrada">
                <div className="stat-icon">
                  <i className="fas fa-arrow-circle-down"></i>
                </div>
                <div className="stat-content">
                  <span className="stat-label">Entradas</span>
                  <span className="stat-value">{movements.filter(m => m.type === 'entrada').length}</span>
                </div>
              </div>
              <div className="stat-card salida">
                <div className="stat-icon">
                  <i className="fas fa-arrow-circle-up"></i>
                </div>
                <div className="stat-content">
                  <span className="stat-label">Salidas</span>
                  <span className="stat-value">{movements.filter(m => m.type === 'salida').length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HistoryModule;
