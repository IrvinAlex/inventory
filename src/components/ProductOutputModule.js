import React, { useState } from 'react';

function ProductOutputModule({ products, onRemoveQuantity, onError }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantityToRemove, setQuantityToRemove] = useState('');

  const handleProductChange = (e) => {
    const productId = parseInt(e.target.value);
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product || null);
    setQuantityToRemove('');
  };

  const removeInventory = (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      onError('Selecciona un producto primero');
      return;
    }

    const quantity = parseInt(quantityToRemove);
    if (isNaN(quantity)) {
      onError('Ingresa una cantidad válida');
      return;
    }

    if (quantity <= 0) {
      onError('La cantidad debe ser mayor a 0');
      return;
    }

    if (quantity > selectedProduct.quantity) {
      onError('No hay suficiente inventario para realizar esta operación');
      return;
    }

    onRemoveQuantity(selectedProduct.id, quantity);
    setQuantityToRemove('');
    setSelectedProduct(null);
  };

  return (
    <div className="module-container output-module">
      <div className="module-header">
        <h2>Salida de Productos</h2>
      </div>

      <div className="output-content">
        <div className="product-table">
          <h3>Lista de Productos Disponibles</h3>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Disponibles</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className={selectedProduct?.id === product.id ? 'selected-row' : ''}>
                  <td>{product.name}</td>
                  <td>{product.description}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>{product.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="output-form-container">
          <div className="remove-inventory-form">
            <h3>Registrar Salida</h3>
            <form onSubmit={removeInventory}>
              <div className="form-group">
                <label>Seleccionar Producto:</label>
                <select 
                  className="product-select"
                  value={selectedProduct ? selectedProduct.id : ''}
                  onChange={handleProductChange}
                >
                  <option value="">Seleccione un producto</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id} disabled={product.quantity === 0}>
                      {product.name} - Disponible: {product.quantity}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Cantidad a Retirar:</label>
                <input 
                  type="number" 
                  value={quantityToRemove} 
                  onChange={(e) => setQuantityToRemove(e.target.value)}
                  placeholder="Cantidad"
                  min="1"
                  max={selectedProduct ? selectedProduct.quantity : 1}
                  disabled={!selectedProduct}
                />
              </div>
              {selectedProduct && (
                <div className="inventory-info">
                  <p>Producto: <strong>{selectedProduct.name}</strong></p>
                  <p>Inventario actual: <strong>{selectedProduct.quantity}</strong></p>
                  {quantityToRemove && !isNaN(parseInt(quantityToRemove)) && (
                    <p>Inventario resultante: <strong>{selectedProduct.quantity - parseInt(quantityToRemove)}</strong></p>
                  )}
                </div>
              )}
              <button 
                type="submit" 
                className="remove-btn" 
                disabled={!selectedProduct}
              >
                Registrar Salida
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductOutputModule;
