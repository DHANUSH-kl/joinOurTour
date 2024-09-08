document.addEventListener('DOMContentLoaded', () => {
    const wishlistIcons = document.querySelectorAll('.wishlist-icon');
    const userId = "<%= user ? user._id : null %>"; // Fetching the user ID if the user is signed in

    // Initialize the wishlist icons based on the user's saved wishlist
    fetchUserWishlist();

    wishlistIcons.forEach(icon => {
        icon.addEventListener('click', function () {
            // Check if the user is signed in
            if (!userId) {
                alert('Please sign in to add items to your wishlist.');
                return;
            }

            const tripId = this.getAttribute('data-id');
            const isActive = this.classList.contains('wishlist-active');

            // Toggle the heart icon color and state
            this.classList.toggle('fa-solid', !isActive);
            this.classList.toggle('fa-regular', isActive);
            this.classList.toggle('wishlist-active', !isActive);

            // Update the wishlist
            updateWishlist(tripId);
        });
    });

    function updateWishlist(tripId) {
        fetch('/update-wishlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tripId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Wishlist updated successfully on the server.');
            } else {
                console.error('Failed to update wishlist on the server.');
            }
        })
        .catch(error => {
            console.error('Error sending wishlist to the server:', error);
        });
    }

    function fetchUserWishlist() {
        if (!userId) return;

        // Fetch the user's wishlist from the server (you could pass this from the backend on page load as well)
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
