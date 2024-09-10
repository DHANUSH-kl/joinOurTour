document.addEventListener('DOMContentLoaded', () => {
    const wishlistIcons = document.querySelectorAll('.wishlist-icon');
    const userId = "<%= user ? user._id : null %>"; // User ID fetched from backend
    let wishlist = []; // Initialize the wishlist variable

    // Fetch the initial wishlist on page load
    fetchUserWishlist();

    wishlistIcons.forEach(icon => {
        icon.addEventListener('click', function () {
            // If user is not signed in, prevent the action
            if (!userId) {
                // Optionally, show a message or disable interaction here
                return;
            }

            const tripId = this.getAttribute('data-id');
            const isActive = this.classList.contains('wishlist-active');

            // Toggle the heart icon state
            this.classList.toggle('fa-solid', !isActive);
            this.classList.toggle('fa-regular', isActive);
            this.classList.toggle('wishlist-active', !isActive);

            // Add or remove trip from the wishlist array
            if (!isActive) {
                wishlist.push(tripId);
            } else {
                wishlist = wishlist.filter(id => id !== tripId);
            }

            // Update the wishlist in the backend
            updateWishlist(tripId, !isActive);
        });
    });

    // Function to update wishlist on the server
    function updateWishlist(tripId, addToWishlist) {
        fetch('/update-wishlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tripId, addToWishlist })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Wishlist updated successfully on the server.');
            } else {
                console.error('Failed to update wishlist on the server:', data.message);
            }
        })
        .catch(error => {
            console.error('Error sending wishlist to the server:', error);
        });
    }

    // Function to fetch the user's wishlist and update UI
    function fetchUserWishlist() {
        if (!userId) return;

        // Fetch the user's wishlist from the server
        fetch(`/user-wishlist?userId=${userId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success && Array.isArray(data.wishlist)) {
                    data.wishlist.forEach(id => {
                        const icon = document.querySelector(`.wishlist-icon[data-id="${id}"]`);
                        if (icon) {
                            icon.classList.add('fa-solid', 'wishlist-active');
                            icon.classList.remove('fa-regular');
                        }
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching user wishlist:', error);
            });
    }
});
