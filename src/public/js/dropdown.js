// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const accountIcon = document.querySelector('.account-icon');
    const accountContainer = document.querySelector('.account-container');
    const closeButton = document.querySelector('#close');

    // Function to hide the account container
    const hideAccountContainer = () => {
        accountContainer.classList.add('acc-hide');
    };

    // Function to show the account container
    const showAccountContainer = () => {
        accountContainer.classList.remove('acc-hide');
    };

    // Event listener for the account icon
    accountIcon.addEventListener('click', () => {
        showAccountContainer();
    });

    // Event listener for the close button
    closeButton.addEventListener('click', () => {
        hideAccountContainer();
    });
});
