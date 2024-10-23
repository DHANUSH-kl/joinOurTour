
document.addEventListener('DOMContentLoaded', () => {
    const tripTotalCost = <%= trip.totalCost %>; // Rendered on the server-side
    
    // Initial ticket counts
    let adultCount = 1;
    let youthCount = 1;
    let childrenCount = 1;

    // DOM elements for ticket counts
    const adultCountEl = document.getElementById('ticket-count-adult');
    const youthCountEl = document.getElementById('ticket-count-youth');
    const childrenCountEl = document.getElementById('ticket-count-children');

    // DOM element for total amount
    const totalAmountEl = document.getElementById('total-amount');

    // Function to update the total price
    function updateTotal() {
        const total = (adultCount * tripTotalCost) + (youthCount * tripTotalCost * 0.75) + (childrenCount * tripTotalCost * 0.5);
        totalAmountEl.textContent = total.toLocaleString('en-IN');
    }

    // Event listeners for Adult Tickets
    document.getElementById('increase-adult').addEventListener('click', () => {
        adultCount++;
        adultCountEl.textContent = adultCount;
        updateTotal();
    });

    document.getElementById('decrease-adult').addEventListener('click', () => {
        if (adultCount > 1) {
            adultCount--;
            adultCountEl.textContent = adultCount;
            updateTotal();
        }
    });

    // Event listeners for Youth Tickets
    document.getElementById('increase-youth').addEventListener('click', () => {
        youthCount++;
        youthCountEl.textContent = youthCount;
        updateTotal();
    });

    document.getElementById('decrease-youth').addEventListener('click', () => {
        if (youthCount > 1) {
            youthCount--;
            youthCountEl.textContent = youthCount;
            updateTotal();
        }
    });

    // Event listeners for Children Tickets
    document.getElementById('increase-children').addEventListener('click', () => {
        childrenCount++;
        childrenCountEl.textContent = childrenCount;
        updateTotal();
    });

    document.getElementById('decrease-children').addEventListener('click', () => {
        if (childrenCount > 1) {
            childrenCount--;
            childrenCountEl.textContent = childrenCount;
            updateTotal();
        }
    });

    // Initial total calculation
    updateTotal();
});
