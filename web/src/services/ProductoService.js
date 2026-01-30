import axios from 'axios';

const API_URL = 'http://54.242.30.23:3000/productos';

class ProductoService {
    
    getAllProductos() {
        return axios.get(API_URL);
    }

    createProducto(producto) {
        return axios.post(API_URL, producto);
    }

    getProductoById(id) {
        return axios.get(`${API_URL}/${id}`);
    }

    updateProducto(id, producto) {
        return axios.put(`${API_URL}/${id}`, producto);
    }

    deleteProducto(id) {
        return axios.delete(`${API_URL}/${id}`);
    }
}

export default new ProductoService();
