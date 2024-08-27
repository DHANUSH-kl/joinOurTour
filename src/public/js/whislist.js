document.addEventListener('DOMContentLoaded', () => {
    const wishlistIcons = document.querySelectorAll('.wishlist-icon');
    const userId = "<%= user ? user._id : null %>"; // Fetching the user ID if the user is signed in

    wishlistIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            // Check if the user is signed in
            if (!userId) {
                alert('Please sign in to add items to your wishlist.');
                return;
            }

            const tripId = this.getAttribute('data-id');

            // Toggle the heart icon color and state
            this.classList.toggle('fa-solid');
            this.classList.toggle('fa-regular');
            this.classList.toggle('wishlist-active');

            // Update the wishlist
            updateWishlist(tripId, this.classList.contains('wishlist-active'));
        });
    });

    // Fetch or initialize the wishlist from local storage
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    function updateWishlist(tripId, isAdding) {
        // Add or remove the trip ID from the wishlist array
        if (isAdding) {
            wishlist.push(tripId);
        } else {
            const index = wishlist.indexOf(tripId);
            if (index !== -1) wishlist.splice(index, 1);
        }

        // Update the wishlist in local storage
        localStorage.setItem('wishlist', JSON.stringify(wishlist));

        // Send the updated wishlist to the server
        sendWishlistToServer(wishlist);
    }

    function sendWishlistToServer(wishlist) {
        fetch('/update-wishlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ wishlist })
        })
        .then(response => {
            // Check if the response is in JSON format
            if (response.headers.get('content-type')?.includes('application/json')) {
                return response.json();
            } else {
                throw new Error('Server response is not in JSON format.');
            }
        })
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

    // Initialize the wishlist icons based on the current state of local storage
    wishlist.forEach(id => {
        const icon = document.querySelector(`.wishlist-icon[data-id="${id}"]`);
        if (icon) {
            icon.classList.add('fa-solid', 'wishlist-active');
            icon.classList.remove('fa-regular');
        }
    });
});
