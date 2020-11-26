/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const updateAccount = async (data, type) => {
  try {
    let url = '/api/v1/';
    url += type === 'password' ? 'auth/updatePassword' : 'users/updateMe';
    const response = await axios({
      method: 'PATCH',
      url: url,
      data: data,
    });
    if (response.data.status === 'success') {
      showAlert('success', 'account updated in successfully!');
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
