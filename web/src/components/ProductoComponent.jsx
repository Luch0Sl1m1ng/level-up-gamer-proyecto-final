import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductoService from '../services/ProductoService';

const ProductoComponent = () => {
    const [nombre, setNombre] = useState('');
    const [precio, setPrecio] = useState('');
    const navigate = useNavigate();
    const { id } = useParams();

    const saveOrUpdateProducto = (e) => {
        e.preventDefault();
        const producto = { nombre, precio };

        if (id) {
            ProductoService.updateProducto(id, producto).then(() => navigate('/productos'));
        } else {
            ProductoService.createProducto(producto).then(() => navigate('/productos'));
        }
    };

    useEffect(() => {
        if (id) {
            ProductoService.getProductoById(id).then((response) => {
                setNombre(response.data.nombre);
                setPrecio(response.data.precio);
            });
        }
    }, [id]);

    return (
        <div className="container mt-5">
            <div className="card col-md-6 offset-md-3">
                <h2 className="text-center">{id ? "Editar" : "Agregar"} Producto</h2>
                <div className="card-body">
                    <form>
                        <div className="form-group mb-2">
                            <label>Nombre:</label>
                            <input type="text" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                        </div>
                        <div className="form-group mb-2">
                            <label>Precio:</label>
                            <input type="number" className="form-control" value={precio} onChange={(e) => setPrecio(e.target.value)} />
                        </div>
                        <button className="btn btn-success" onClick={(e) => saveOrUpdateProducto(e)}>Guardar</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProductoComponent;
