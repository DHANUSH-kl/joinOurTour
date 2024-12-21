function submitSearch() {
    // Get the starting location
    const startingLocation = document.getElementById('startingLocation').value;

    // Get the destination location
    const destinationLocation = document.getElementById('destinationLocation').value;

    // Get the from date
    const fromDate = document.getElementById('fromDate').value;

    // Get the to date
    const toDate = document.getElementById('toDate').value;



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



// destination sync


// Get references to the input fields
const destinationLocation = document.getElementById('destinationLocation');
const secondaryDestination = document.getElementById('secondaryDestination');

// Synchronize values from #destinationLocation to #secondaryDestination
destinationLocation.addEventListener('input', (e) => {
    secondaryDestination.value = e.target.value;
});

// Synchronize values from #secondaryDestination to #destinationLocation
secondaryDestination.addEventListener('input', (e) => {
    destinationLocation.value = e.target.value;
});




// dates sync 

// Get references to the date input fields
const fromDate = document.getElementById('fromDate');
const toDate = document.getElementById('toDate');
const fromdte = document.getElementById('fromdte');
const todte = document.getElementById('todte');

// Synchronize values from #fromDate to #fromdte
fromDate.addEventListener('input', (e) => {
    fromdte.value = e.target.value;
});

// Synchronize values from #fromdte to #fromDate
fromdte.addEventListener('input', (e) => {
    fromDate.value = e.target.value;
});

// Synchronize values from #toDate to #todte
toDate.addEventListener('input', (e) => {
    todte.value = e.target.value;
});

// Synchronize values from #todte to #toDate
todte.addEventListener('input', (e) => {
    toDate.value = e.target.value;
});
