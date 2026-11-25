/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId, selectedDate) => {
  try {
    // 1) Get checkout session from endpoint
    const session = await axios({
      method: 'GET',
      url: `http://localhost:8000/api/v1/bookings/checkout-session/${tourId}/${selectedDate}`,
    });

    // 2) Create checkout form + charge credit card
    if (session.data) {
      window.location.href = session.data.session.url;
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
