document.getElementById('filterToggle').addEventListener('click', function() {
    const filterContent = document.querySelector('.you-type-filter-content');
    filterContent.classList.toggle('filter-hide');

    // Opposite logic for rotation
    if (this.style.transform === 'rotate(0deg)') {
        this.style.transform = 'rotate(180deg)';
    } else {
        this.style.transform = 'rotate(0deg)';
    }
});

document.getElementById('priceFilterToggle').addEventListener('click', function() {
    const filterContent = document.querySelector('.price-filter-container');
    filterContent.classList.toggle('filter-hide');

    // Opposite logic for rotation
    if (this.style.transform === 'rotate(0deg)') {
        this.style.transform = 'rotate(180deg)';
    } else {
        this.style.transform = 'rotate(0deg)';
    }
});




// Language Filter Toggle
const languageToggle = document.getElementById('languageToggle');
const languagesFilterContainer = document.querySelector('.languages-filter-container');

// Initially hide language filter and set toggle arrow to 0deg
languagesFilterContainer.classList.add('filter-hide');
languageToggle.style.transform = 'rotate(0deg)';

languageToggle.addEventListener('click', () => {
    languagesFilterContainer.classList.toggle('filter-hide');

    const currentRotation = getComputedStyle(languageToggle).transform;

    if (currentRotation === 'none' || currentRotation === 'matrix(1, 0, 0, 1, 0, 0)') {
        languageToggle.style.transform = 'rotate(180deg)';
    } else {
        languageToggle.style.transform = 'rotate(0deg)';
    }
});

// Days Filter Toggle
const daysToggle = document.getElementById('daysToggle');
const daysFilterContainer = document.querySelector('.days-filter-container');

// Initially hide days filter and set toggle arrow to 0deg
daysFilterContainer.classList.add('filter-hide');
daysToggle.style.transform = 'rotate(0deg)';

daysToggle.addEventListener('click', () => {
    daysFilterContainer.classList.toggle('filter-hide');

    const currentRotation = getComputedStyle(daysToggle).transform;

    if (currentRotation === 'none' || currentRotation === 'matrix(1, 0, 0, 1, 0, 0)') {
        daysToggle.style.transform = 'rotate(180deg)';
    } else {
        daysToggle.style.transform = 'rotate(0deg)';
    }
});








//full tile click

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".card-container").forEach(card => {
        card.addEventListener("click", function (event) {
            // Prevent triggering when clicking on heart icon or other interactive elements
            if (!event.target.closest(".wishlist-icon, .rating-container input, a")) {
                const tripId = this.getAttribute("data-id");
                if (tripId) {
                    window.location.href = `/tour/${tripId}`;
                }
            }
        });
    });
});
