/* eslint-disable */
import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './mapbox';
import { updateAccount } from './updateAccount';
import { bookTour } from './stripe';

const mapBox = document.getElementById('map');
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

const bookButton = document.getElementById('book-tour');
if (bookButton) {
  bookButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.target.textContent = 'Processing...';
    //const tourId = event.target.dataset.tourId;
    const { tourId } = event.target.dataset; //mesma coisa que na linha de cima mas mais moderno ES6...
    bookTour(tourId);
  });
}

const loginForm = document.querySelector('.form--login');
if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

const userDataForm = document.querySelector('.form-user-data');
if (userDataForm) {
  userDataForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    console.log(document.getElementById('photo').files);
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    await updateAccount(form, 'data');
  });
}

const userPasswordForm = document.querySelector('.form-user-password');
if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const password = document.getElementById('password-current').value;
    const passwordNew = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    const data = {
      password: password,
      passwordNew: passwordNew,
      passwordConfirm: passwordConfirm,
    };
    await updateAccount(data, 'password');
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

const logoutButton = document.querySelector('.nav__el--logout');
if (logoutButton) logoutButton.addEventListener('click', logout);
