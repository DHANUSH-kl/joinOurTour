
  document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card-container');

    // Get today's date (set to midnight to ignore time portion)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    cards.forEach(card => {
      const departureDateStr = card.getAttribute('data-departure');
      if (!departureDateStr) return;

      const departureDate = new Date(departureDateStr);
      departureDate.setHours(0, 0, 0, 0); // normalize to midnight too

      if (departureDate <= today) {
        // ✅ Show soldout image
        const soldoutImg = card.querySelector('.soldimg');
        if (soldoutImg) {
          soldoutImg.style.display = 'block';
        }

        // ✅ Add class
        card.classList.add('ongoingtrip');
      }
    });
  });
