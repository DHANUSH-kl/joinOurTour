function submitSearch() {
    // Get the starting location
    const startingLocation = document.getElementById('startingLocation').value;

    // Get the destination location
    const destinationLocation = document.getElementById('destinationLocation').value;

    // Get the from date
    const fromDate = document.getElementById('fromDate').value;

    // Get the to date
    const toDate = document.getElementById('toDate').value;

    // Check if dates are selected
    if (!fromDate) {
        alert('Please select a start date.');
        return;
    }

    if (!toDate) {
        alert('Please select an end date.');
        return;
    }

    // Prepare the data to be sent
    const data = {
        startingLocation,
        destinationLocation,
        fromDate,
        toDate
    };

    console.log('Data to be sent:', data);

    // Create a form and submit it
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/mainSearch';

    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = data[key];
            form.appendChild(input);
        }
    }

    document.body.appendChild(form);
    form.submit();
}
