const BASE_URL = 'http://54.90.162.162:3000';

export const callApi = async (endpoint, method = 'GET', body = null, token = null) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const config = { method, headers };
    if (body) config.body = JSON.stringify(body);
    const res = await fetch(`${BASE_URL}${endpoint}`, config);
    return res.json();
};