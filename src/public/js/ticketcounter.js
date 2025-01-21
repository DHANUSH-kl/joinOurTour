document.addEventListener("DOMContentLoaded", () => {
    let counter = 1; // Start from 1 instead of 0

    // Get ticket price from the data attribute
    const tripData = document.getElementById("tripData");
    const ticketPrice = parseInt(tripData.dataset.cost, 10); 

    const counterElement = document.getElementById("counter");
    const totalAmountElement = document.getElementById("totalAmount");
    const incrementButton = document.getElementById("increment");
    const decrementButton = document.getElementById("decrement");

    function updateTotal() {
        const total = counter * ticketPrice;
        totalAmountElement.textContent = `₹${total.toLocaleString('en-IN')}`;
    }

    // Set the initial values in the UI
    counterElement.textContent = counter;
    updateTotal();

    incrementButton.addEventListener("click", () => {
        counter++;
        counterElement.textContent = counter;
        updateTotal();
    });

    decrementButton.addEventListener("click", () => {
        if (counter > 1) { // Ensure it never goes below 1
            counter--;
            counterElement.textContent = counter;
            updateTotal();
        }
    });
});
    