function submitSecondarySearch() {
    // Get the destination
    const destination = document.getElementById('secondaryDestination').value;

    // Get the selected categories
    const selectedCategories = Array.from(document.querySelectorAll('.categoryCheckbox:checked'))
                                     .map(cb => cb.value);

    // Get the price range
    const minPrice = document.getElementById('minPrice').value;
    const maxPrice = document.getElementById('maxPrice').value;

    // Prepare the data to be sent
    const data = {
        destination,
        categories: selectedCategories,
        minPrice,
        maxPrice
    };

    // Send the data to the server
    fetch('/secondarysearch', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}