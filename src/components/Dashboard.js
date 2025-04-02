import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';
import axios from 'axios';
import InventoryModule from './InventoryModule';
import ProductOutputModule from './ProductOutputModule';
import HistoryModule from './HistoryModule';

function Dashboard({ onLogout, userRole, userName, token, userData }) {
  const [products, setProducts] = useState([]);
  const [activeModule, setActiveModule] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser] = useState({ 
    id: userData?.id || 0,
    name: userName || 'Usuario',
    role: userRole || ''
  });

  // Set default module based on user role
  useEffect(() => {
    if (userRole === 'Administrador') {
      setActiveModule('inventory');
    } else if (userRole === 'Almacenista') {
      setActiveModule('outputProducts');
    }
  }, [userRole]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:8001/productos', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data) {
          // Map API response to our product model if needed
          const mappedProducts = response.data.map(product => ({
            id: product.id,
            name: product.nombre,
            description: product.descripcion,
            price: product.precio,
            quantity: product.cantidad,
            active: product.activo
          }));
          setProducts(mappedProducts);
          setError('');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Error al cargar los productos. Intente nuevamente más tarde.');
        
        // Fallback to demo data if API fails
        loadDemoData();
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchProducts();
    } else {
      // Load demo data if no token available (should not happen in production)
      loadDemoData();
    }
  }, [token]);

  // Load initial demo data as fallback
  const loadDemoData = () => {
    const initialProducts = [
      { id: 1, name: 'Laptop HP', description: 'Laptop HP 15"', price: 12000, quantity: 5, active: true },
      { id: 2, name: 'Monitor Dell', description: 'Monitor Dell 24"', price: 3500, quantity: 10, active: true },
      { id: 3, name: 'Teclado Logitech', description: 'Teclado inalámbrico', price: 800, quantity: 20, active: true },
      { id: 4, name: 'Mouse Gamer', description: 'Mouse RGB', price: 600, quantity: 15, active: false },
    ];
    setProducts(initialProducts);

    const initialMovements = [
      { 
        id: 1, 
        type: 'entrada', 
        productId: 1, 
        productName: 'Laptop HP', 
        quantity: 5, 
        date: new Date(2023, 9, 15, 14, 30), 
        userId: 1, 
        userName: 'admin' 
      },
      { 
        id: 2, 
        type: 'entrada', 
        productId: 2, 
        productName: 'Monitor Dell', 
        quantity: 10, 
        date: new Date(2023, 9, 16, 10, 15), 
        userId: 1, 
        userName: 'admin' 
      },
      { 
        id: 3, 
        type: 'salida', 
        productId: 1, 
        productName: 'Laptop HP', 
        quantity: 2, 
        date: new Date(2023, 9, 17, 9, 45), 
        userId: 1, 
        userName: 'admin' 
      },
    ];
    setMovements(initialMovements);
  };

  // Functions to handle product management
  const addProduct = async (newProduct) => {
    try {
      const productToSend = {
        nombre: newProduct.name,
        descripcion: newProduct.description,
        precio: newProduct.price,
        // Backend will set cantidad=0 and activo=true by default
      };
      
      const response = await axios.post('http://localhost:8001/productos', productToSend, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data) {
        // Map response to our product model
        const addedProduct = {
          id: response.data.id,
          name: response.data.nombre,
          description: response.data.descripcion,
          price: response.data.precio,
          quantity: response.data.cantidad,
          active: response.data.activo
        };
        
        setProducts([...products, addedProduct]);
        showSuccessMessage('Producto agregado correctamente');
      }
    } catch (err) {
      console.error('Error adding product:', err);
      showErrorMessage(err.response?.data?.mensaje || 'Error al agregar el producto');
    }
  };

  const updateProductQuantity = async (productId, quantity) => {
    try {
      const inventarioDTO = {
        productoId: productId,
        usuarioId: currentUser.id,
        cantidad: quantity
      };
      
      const response = await axios.post('http://localhost:8001/productos/entrada', inventarioDTO, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.producto) {
        // Update the local product state
        const updatedProducts = products.map(product => {
          if (product.id === productId) {
            return {
              ...product,
              quantity: response.data.producto.cantidad
            };
          }
          return product;
        });
        
        setProducts(updatedProducts);
        
        // Register the movement
        const product = products.find(p => p.id === productId);
        const newMovement = {
          id: Date.now(),
          type: 'entrada',
          productId,
          productName: product.name,
          quantity,
          date: new Date(),
          userId: currentUser.id,
          userName: currentUser.name
        };
        setMovements([...movements, newMovement]);
        
        showSuccessMessage('Inventario actualizado correctamente');
      }
    } catch (err) {
      console.error('Error updating inventory:', err);
      showErrorMessage(err.response?.data?.mensaje || 'Error al actualizar el inventario');
    }
  };

  const removeProductQuantity = async (productId, quantity) => {
    try {
      const inventarioDTO = {
        productoId: productId,
        usuarioId: currentUser.id,
        cantidad: quantity
      };
      
      const response = await axios.post('http://localhost:8001/productos/salida', inventarioDTO, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.producto) {
        // Update the local product state
        const updatedProducts = products.map(product => {
          if (product.id === productId) {
            return {
              ...product,
              quantity: response.data.producto.cantidad
            };
          }
          return product;
        });
        
        setProducts(updatedProducts);
        
        // Register the movement
        const product = products.find(p => p.id === productId);
        const newMovement = {
          id: Date.now(),
          type: 'salida',
          productId,
          productName: product.name,
          quantity,
          date: new Date(),
          userId: currentUser.id,
          userName: currentUser.name
        };
        setMovements([...movements, newMovement]);
        
        showSuccessMessage('Salida de inventario registrada correctamente');
      }
    } catch (err) {
      console.error('Error removing inventory:', err);
      showErrorMessage(err.response?.data?.mensaje || 'Error al registrar la salida del inventario');
    }
  };

  const toggleProductStatus = async (productId) => {
    try {
      const product = products.find(p => p.id === productId);
      const endpoint = product.active 
        ? `http://localhost:8001/productos/${productId}/baja` 
        : `http://localhost:8001/productos/${productId}/activar`;
      
      const response = await axios.put(endpoint, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.producto) {
        const updatedProducts = products.map(product => {
          if (product.id === productId) {
            return {
              ...product,
              active: response.data.producto.activo
            };
          }
          return product;
        });
        
        setProducts(updatedProducts);
        showSuccessMessage(response.data.mensaje || 'Estado del producto actualizado');
      }
    } catch (err) {
      console.error('Error toggling product status:', err);
      showErrorMessage(err.response?.data?.mensaje || 'Error al actualizar el estado del producto');
    }
  };

  // Helper functions for showing messages
  const showErrorMessage = (message) => {
    setError(message);
    setSuccess('');
    setTimeout(() => setError(''), 3000);
  };

  const showSuccessMessage = (message) => {
    setSuccess(message);
    setError('');
    setTimeout(() => setSuccess(''), 3000);
  };

  // Role-based navigation options
  const getNavigationOptions = () => {
    if (userRole === 'Administrador') {
      return (
        <>
          <li 
            className={activeModule === 'inventory' ? 'active' : ''} 
            onClick={() => setActiveModule('inventory')}
          >
            Inventario
          </li>
          <li
            className={activeModule === 'history' ? 'active' : ''} 
            onClick={() => setActiveModule('history')}
          >
            Historial de Movimientos
          </li>
        </>
      );
    } else if (userRole === 'Almacenista') {
      return (
        <li 
          className={activeModule === 'outputProducts' ? 'active' : ''} 
          onClick={() => setActiveModule('outputProducts')}
        >
          Salida de Productos
        </li>
      );
    }
    return null;
  };

  const getRoleName = () => {
    return userRole || 'Usuario'; // Return the role directly, it's already formatted correctly
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Sistema de Inventario</h1>
        <div className="user-info">
          <div className="user-role-badge">{getRoleName()}</div>
          <span>Usuario: {currentUser.name}</span>
          <button className="logout-button" onClick={onLogout}>
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="dashboard-container">
        <aside className="sidebar">
          <h2>Módulos</h2>
          <ul>
            {getNavigationOptions()}
          </ul>
        </aside>

        <main className="main-content">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Cargando datos...</p>
            </div>
          ) : (
            <>
              {activeModule === 'inventory' && userRole === 'Administrador' && (
                <InventoryModule 
                  products={products}
                  onAddProduct={addProduct}
                  onUpdateQuantity={updateProductQuantity}
                  onToggleStatus={toggleProductStatus}
                  onError={showErrorMessage}
                  userRole={userRole}
                  token={token}
                />
              )}

              {activeModule === 'outputProducts' && userRole === 'Almacenista' && (
                <ProductOutputModule 
                  products={products.filter(product => product.active)} 
                  onRemoveQuantity={removeProductQuantity}
                  onError={showErrorMessage}
                  token={token}
                />
              )}

              {activeModule === 'history' && userRole === 'Administrador' && (
                <HistoryModule 
                  movements={movements}
                  token={token}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
