import axios from 'axios';
import { showAlert } from './alerts';

export const reviewTour = async (review, rating, tourId) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `http://localhost:8000/api/v1/tours/${tourId}/reviews`,
      data: {
        review,
        rating,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Review submitted successfully!');
    }
  } catch (error) {
    showAlert(
      'error',
      error.response.data.message || 'Review failed! Try again',
    );
  }
};
