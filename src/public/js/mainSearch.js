// function submitSearch() {
//     // Get the starting location
//     const startingLocation = document.getElementById('startingLocation').value;

//     // Get the destination location
//     const destinationLocation = document.getElementById('destinationLocation').value;

//     // Get the from date
//     const fromDate = document.getElementById('fromDate').value;

//     // Get the to date
//     const toDate = document.getElementById('toDate').value;



//     // Prepare the data to be sent
//     const data = {
//         startingLocation,
//         destinationLocation,
//         fromDate,
//         toDate
//     };

//     console.log('Data to be sent:', data);

//     // Create a form and submit it
//     const form = document.createElement('form');
//     form.method = 'POST';
//     form.action = '/mainSearch';

//     for (const key in data) {
//         if (data.hasOwnProperty(key)) {
//             const input = document.createElement('input');
//             input.type = 'hidden';
//             input.name = key;
//             input.value = data[key];
//             form.appendChild(input);
//         }
//     }

//     document.body.appendChild(form);
//     form.submit();
// }



// // destination sync


// // Get references to the input fields
// const destinationLocation = document.getElementById('destinationLocation');
// const secondaryDestination = document.getElementById('secondaryDestination');

// // Synchronize values from #destinationLocation to #secondaryDestination
// destinationLocation.addEventListener('input', (e) => {
//     secondaryDestination.value = e.target.value;
// });

// // Synchronize values from #secondaryDestination to #destinationLocation
// secondaryDestination.addEventListener('input', (e) => {
//     destinationLocation.value = e.target.value;
// });




// // dates sync 

// // Get references to the date input fields
// const fromDate = document.getElementById('fromDate');
// const toDate = document.getElementById('toDate');
// const fromdte = document.getElementById('fromdte');
// const todte = document.getElementById('todte');

// // Synchronize values from #fromDate to #fromdte
// fromDate.addEventListener('input', (e) => {
//     fromdte.value = e.target.value;
// });

// // Synchronize values from #fromdte to #fromDate
// fromdte.addEventListener('input', (e) => {
//     fromDate.value = e.target.value;
// });

// // Synchronize values from #toDate to #todte
// toDate.addEventListener('input', (e) => {
//     todte.value = e.target.value;
// });

// // Synchronize values from #todte to #toDate
// todte.addEventListener('input', (e) => {
//     toDate.value = e.target.value;
// });



function submitCombinedSearch() {
    // MAIN SEARCH DATA
    const startingLocation = document.getElementById('startingLocation').value;
    const destinationLocation = document.getElementById('destinationLocation').value;
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;

    // FILTER SEARCH DATA
    const destination = document.getElementById('secondaryDestination').value;

    const selectedCategories = Array.from(document.querySelectorAll('.categoryCheckbox:checked'))
                                     .map(cb => cb.value);

    const minPrice = document.getElementById('minPrice').value;
    const maxPrice = document.getElementById('maxPrice').value;

    const fromdte = document.getElementById('fromdte').value;
    const todte = document.getElementById('todte').value;

    const minDays = document.getElementById('minDays').value;
    const maxDays = document.getElementById('maxDays').value;

    const selectedLanguages = Array.from(document.querySelectorAll('.languageCheckbox:checked'))
                                    .map(cb => cb.value);

    // Combine data into a single object
    const data = {
        startingLocation,
        destinationLocation,
        fromDate,
        toDate,
        destination,
        categories: selectedCategories,
        minPrice,
        maxPrice,
        fromdte,
        todte,
        languages: selectedLanguages,
        minDays,
        maxDays
    };

    console.log('Combined Data to be sent:', data);

    // Create a form and submit it
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/mainSearch';

    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            if (Array.isArray(data[key])) {
                data[key].forEach(value => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = value;
                    form.appendChild(input);
                });
            } else {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = data[key];
                form.appendChild(input);
            }
        }
    }

    document.body.appendChild(form);
    form.submit();
}
