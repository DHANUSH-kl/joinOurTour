function submitSecondarySearch() {
    // Get the destination
    const destinationInput = document.getElementById('secondaryDestination');
    const destination = destinationInput ? destinationInput.value : '';

    // Get the selected categories
    const selectedCategories = Array.from(document.querySelectorAll('.categoryCheckbox:checked'))
                                     .map(cb => cb.value);

    // Get the price range
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    const minPrice = minPriceInput ? minPriceInput.value : '';
    const maxPrice = maxPriceInput ? maxPriceInput.value : '';

    // Prepare the data to be sent
    const data = {
        destination,
        categories: selectedCategories,
        minPrice,
        maxPrice
    };

    console.log('Data to be sent:', data);

    // Send the data to the server
    fetch('/secondarysearch', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        console.log('Response received:', response);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        console.log('Clearing inputs...');

        // Clear the input fields after successful submission
        if (destinationInput) {
            console.log('Clearing destination input');
            destinationInput.value = '';
        }

        if (minPriceInput) {
            console.log('Clearing minPrice input');
            minPriceInput.value = '';
        }

        if (maxPriceInput) {
            console.log('Clearing maxPrice input');
            maxPriceInput.value = '';
        }

        // Clear the checkboxes
        document.querySelectorAll('.categoryCheckbox').forEach(cb => {
            console.log('Clearing checkbox:', cb.value);
            cb.checked = false;
        });

        console.log('Inputs should be cleared now.');
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
