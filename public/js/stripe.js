/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

const stripe = Stripe('process.env.STRIPE_KEY_PUBLIC');

export const bookTour = async (tourId) => {
  try {
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    await stripe.redirectToCheckout({
      sessionId: session.data.data.id,
    });
  } catch (error) {
    showAlert('error', error);
  }
};
