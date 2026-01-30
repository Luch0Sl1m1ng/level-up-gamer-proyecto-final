import axios from 'axios';

const API_URL = 'http://54.242.30.23:3000';

class AuthService {
    
    login(usuario) {
        return axios.post(API_URL + "/login", usuario)
            .then(response => {
                if (response.data.token) {

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
