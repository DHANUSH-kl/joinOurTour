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
                alert('Please sign in to manage your wishlist.');
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
                    wishlist = data.wishlist; // Update the wishlist array
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









// redirects



document.addEventListener('DOMContentLoaded', function () {
    // Select all wishlist icons
    const wishlistIcons = document.querySelectorAll('.redirect-i');

    wishlistIcons.forEach(function (icon) {
        icon.addEventListener('click', function () {
            // Check if the user is signed in (you may replace this with your actual authentication logic)
            const isLoggedIn = false; // Replace this with your logic

            if (!isLoggedIn) {
                // If user is not signed in, redirect to sign-in page
                window.location.href = '/user/signin';
            } else {
                // Handle the wishlist functionality for signed-in users here
            }
        });
    });
});











document.addEventListener("DOMContentLoaded", function () {
    const detailsButtons = document.querySelectorAll(".details-btn");

    detailsButtons.forEach(button => {
        button.addEventListener("click", function () {
            const li = this.closest(".rb-item");
            const stopDetails = li.querySelector(".stop-details");

            // Toggle visibility of details
            if (li.classList.contains("active")) {
                li.classList.remove("active");
                stopDetails.style.display = "none";
                this.classList.remove("active");
            } else {
                document.querySelectorAll(".rb-item").forEach(item => {
                    item.classList.remove("active");
                    item.querySelector(".stop-details").style.display = "none";
                    item.querySelector(".details-btn").classList.remove("active");
                });

                li.classList.add("active");
                stopDetails.style.display = "block";
                this.classList.add("active");
            }
        });
    });

    // Show More / Show Less functionality
    document.querySelectorAll(".show-more-btn").forEach(button => {
        button.addEventListener("click", function () {
            const descriptionText = this.previousElementSibling;

            if (descriptionText.classList.contains("expanded")) {
                descriptionText.classList.remove("expanded");
                this.textContent = "Show More";
            } else {
                descriptionText.classList.add("expanded");
                this.textContent = "Show Less";
            }
        });
    });
});
