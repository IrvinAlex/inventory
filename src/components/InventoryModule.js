import React, { useState } from 'react';

function InventoryModule({ products, onAddProduct, onUpdateQuantity, onToggleStatus, onError, userRole }) {
  const [showActive, setShowActive] = useState(true);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '' });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantityToAdd, setQuantityToAdd] = useState('');

  const addNewProduct = (e) => {
    e.preventDefault();
    // Only admin can add products
    if (userRole !== 'Administrador') {
      onError('No tienes permisos para realizar esta acción');
      return;
    }

    if (!newProduct.name || !newProduct.description || !newProduct.price) {
      onError('Todos los campos son obligatorios');
      return;
    }

    const newProductItem = {
      id: Date.now(),
      name: newProduct.name,
      description: newProduct.description,
      price: parseFloat(newProduct.price),
      quantity: 0,
      active: true,
    };

    onAddProduct(newProductItem);
    setNewProduct({ name: '', description: '', price: '' });
  };

  const updateInventory = (e) => {
    e.preventDefault();
    // Only admin can update inventory
    if (userRole !== 'Administrador') {
      onError('No tienes permisos para realizar esta acción');
      return;
    }

    if (!selectedProduct) {
      onError('Selecciona un producto primero');
      return;
    }

    const quantity = parseInt(quantityToAdd);
    if (isNaN(quantity)) {
      onError('Ingresa una cantidad válida');
      return;
    }

    if (quantity <= 0) {
      onError('La cantidad debe ser mayor a 0');
      return;
    }

    onUpdateQuantity(selectedProduct.id, quantity);
    setQuantityToAdd('');
    setSelectedProduct(null);
  };

  const filteredProducts = products.filter(product => product.active === showActive);

  return (
    <div className="module-container">
      <div className="inventory-header">
        <h2>Gestión de Inventario</h2>
        <div className="filter-buttons">
          <button 
            className={showActive ? 'active' : ''} 
            onClick={() => setShowActive(true)}
          >
            Productos Activos
          </button>
          <button 
            className={!showActive ? 'active' : ''} 
            onClick={() => setShowActive(false)}
          >
            Productos Inactivos
          </button>
        </div>
      </div>

      <div className="content-grid">
        <div className="product-list">
          <h3>Lista de Productos {showActive ? 'Activos' : 'Inactivos'}</h3>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.description}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>{product.quantity}</td>
                  <td>
                    {userRole === 'Administrador' && (
                      <div className="action-buttons">
                        <button 
                          className="select-btn"
                          onClick={() => setSelectedProduct(product)}
                          title="Seleccionar producto"
                        >
                          <i className="fas fa-hand-pointer btn-icon"></i>
                          Seleccionar
                        </button>
                        <button 
                          className={product.active ? 'deactivate-btn' : 'activate-btn'}
                          onClick={() => onToggleStatus(product.id)}
                          title={product.active ? "Dar de baja" : "Activar producto"}
                        >
                          {product.active ? (
                            <>
                              <i className="fas fa-ban btn-icon"></i>
                              Dar de Baja
                            </>
                          ) : (
                            <>
                              <i className="fas fa-check-circle btn-icon"></i>
                              Activar
                            </>
                          )}
                        </button>
                      </div>
                    )}
                    {userRole !== 'Administrador' && (
                      <span className="permission-message">Sin acciones disponibles</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {userRole === 'Administrador' && (
          <div className="forms-container">
            <div className="add-product-form">
              <h3>Agregar Nuevo Producto</h3>
              <form onSubmit={addNewProduct}>
                <div className="form-group">
                  <label>Nombre:</label>
                  <input 
                    type="text" 
                    value={newProduct.name} 
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="Nombre del producto"
                  />
                </div>
                <div className="form-group">
                  <label>Descripción:</label>
                  <input 
                    type="text" 
                    value={newProduct.description} 
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    placeholder="Descripción del producto"
                  />
                </div>
                <div className="form-group">
                  <label>Precio:</label>
                  <input 
                    type="number" 
                    value={newProduct.price} 
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    placeholder="Precio del producto"
                    min="0"
                  />
                </div>
                <button type="submit" className="add-btn">Agregar Producto</button>
              </form>
            </div>

            <div className="update-inventory-form">
              <h3>Entrada de Productos</h3>
              <form onSubmit={updateInventory}>
                <div className="form-group">
                  <label>Producto Seleccionado:</label>
                  <input 
                    type="text" 
                    value={selectedProduct ? selectedProduct.name : 'Ninguno seleccionado'} 
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Cantidad a Agregar:</label>
                  <input 
                    type="number" 
                    value={quantityToAdd} 
                    onChange={(e) => setQuantityToAdd(e.target.value)}
                    placeholder="Cantidad"
                    min="1"
                    disabled={!selectedProduct}
                  />
                </div>
                <button 
                  type="submit" 
                  className="update-btn" 
                  disabled={!selectedProduct}
                >
                  Actualizar Inventario
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InventoryModule;
