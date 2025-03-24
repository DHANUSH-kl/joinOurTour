let counter = 1; // Start from 1

// Get ticket price from the data attribute
const tripData = document.getElementById("tripData");
const ticketPrice = parseInt(tripData.dataset.cost, 10); 

const counterElement = document.getElementById("counter");
const totalAmountElement = document.getElementById("totalAmount");
const incrementButton = document.getElementById("increment");
const decrementButton = document.getElementById("decrement");
const totalAmountInput = document.getElementById("totalAmountInput");
const numTicketsInput = document.getElementById("numTicketsInput");

// Function to update the total amount and ticket count
function updateTotal() {
    const total = counter * ticketPrice;
    totalAmountElement.textContent = `₹${total.toLocaleString('en-IN')}`;
    totalAmountInput.value = total; // Update hidden input with total amount
    numTicketsInput.value = counter; // Update hidden input with ticket count
}

// Set initial values
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