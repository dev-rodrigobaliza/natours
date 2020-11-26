/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
    const response = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/auth/login',
      data: {
        email: email,
        password: password,
      },
    });
    if (response.data.status === 'success') {
      showAlert('success', 'logged in successfully!');
      window.setTimeout(() => {
        if (window.location.search.substr(1) === 'next=me') {
          location.assign('/me');
        } else {
          location.assign('/');
        }
      }, 1000);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};

export const logout = async () => {
  try {
    const response = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/auth/logout',
    });
    if (response.data.status === 'success') location.reload(true);
  } catch (error) {
    console.log({ error });
    showAlert('error', 'Error logging out, try again!');
  }
};
