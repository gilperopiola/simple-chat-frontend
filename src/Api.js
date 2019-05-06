import axios from 'axios';

const URL_BASE = 'http://localhost:8000';

export default {
    login(credentials) {
        return axios.post(URL_BASE + '/login', credentials, {});
    },

    getRooms() {
        axios.defaults.headers.common['Authorization'] = localStorage.getItem('token');
        return axios.get(URL_BASE + '/rooms', {});
    },

    getUser(id) {
        axios.defaults.headers.common['Authorization'] = localStorage.getItem('token');
        return axios.get(URL_BASE + '/user/' + id, {});
    },

    getRoomMessages(id, since) {
        axios.defaults.headers.common['Authorization'] = localStorage.getItem('token');
        return axios.get(URL_BASE + '/room/' + id + "?since=" + since, {});
    },

    sendMessageToRoom(id, message) {
        axios.defaults.headers.common['Authorization'] = localStorage.getItem('token');
        return axios.post(URL_BASE + '/room/' + id, message, {});
    },

    sendCommand(command) {
        axios.defaults.headers.common['Authorization'] = localStorage.getItem('token');
        return axios.post(URL_BASE + '/command', command, {});
    }
};
