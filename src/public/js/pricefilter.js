// JavaScript code to toggle the filter content
document.getElementById('filterToggle').addEventListener('click', function() {
    const filterContent = document.querySelector('.you-type-filter-content');
    filterContent.classList.toggle('filter-hide');

     // Toggle the .invert class on the clicked image
     this.classList.toggle('invert');
});

// JavaScript code to toggle the filter content
document.getElementById('priceFilterToggle').addEventListener('click', function() {
    const filterContent = document.querySelector('.price-filter-container');
    filterContent.classList.toggle('filter-hide');

     // Toggle the .invert class on the clicked image
     this.classList.toggle('invert');
});




const rangeMin = document.querySelector(".range-min");
const rangeMax = document.querySelector(".range-max");
const progress = document.querySelector(".slider .progress");
const inputMin = document.querySelector(".input-min");
const inputMax = document.querySelector(".input-max");

function updateSlider() {
    let minVal = parseInt(rangeMin.value);
    let maxVal = parseInt(rangeMax.value);

    if (maxVal - minVal < 0) {
        if (event.target === rangeMin) {
            rangeMin.value = maxVal - 100;
        } else {
            rangeMax.value = minVal + 100;
        }
    } else {
        inputMin.value = minVal;
        inputMax.value = maxVal;
        let percentageMin = (minVal / rangeMin.max) * 100;
        let percentageMax = (maxVal / rangeMax.max) * 100;

        progress.style.left = percentageMin + "%";
        progress.style.right = 100 - percentageMax + "%";
    }
}

rangeMin.addEventListener("input", updateSlider);
rangeMax.addEventListener("input", updateSlider);

inputMin.addEventListener("input", () => {
    rangeMin.value = inputMin.value;
    updateSlider();
});

inputMax.addEventListener("input", () => {
    rangeMax.value = inputMax.value;
    updateSlider();
});

// Initialize the slider to start at min and max values
rangeMin.value = 0;
rangeMax.value = 0;
updateSlider();
