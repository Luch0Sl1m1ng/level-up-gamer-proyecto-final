import axios from 'axios';

const API_URL = 'http://98.88.249.13:3000';

class AuthService {
    
    login(usuario) {
        return axios.post(API_URL + "/login", usuario)
            .then(response => {
                if (response.data.token) {
                    // Guardamos el token en la memoria del navegador
                    localStorage.setItem("user", JSON.stringify(response.data));
                }
                return response.data;
            });
    }

    logout() {
        localStorage.removeItem("user");
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem("user"));
    }
}

export default new AuthService();
