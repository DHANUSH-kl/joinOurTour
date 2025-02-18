



// function submitSecondarySearch() {
//     // Get the destination
//     const destination = document.getElementById('secondaryDestination').value;

//     // Get the selected categories
//     const selectedCategories = Array.from(document.querySelectorAll('.categoryCheckbox:checked'))
//                                      .map(cb => cb.value);

//     // Get the price range
//     const minPrice = document.getElementById('minPrice').value;
//     const maxPrice = document.getElementById('maxPrice').value;

//     // Get the dates
//     const fromdte = document.getElementById('fromdte').value;
//     const todte = document.getElementById('todte').value;

//     // Get the number of days
//     const minDays = document.getElementById('minDays').value;
//     const maxDays = document.getElementById('maxDays').value;

//      // Get the selected languages
//      const selectedLanguages = Array.from(document.querySelectorAll('.languageCheckbox:checked'))
//      .map(cb => cb.value);


//     // Prepare the data to be sent
//     const data = {
//         destination,
//         categories: selectedCategories,
//         minPrice,
//         maxPrice,
//         fromdte,
//         todte,
//         languages:selectedLanguages,
//         minDays,
//         maxDays
//     };

//     console.log('Data to be sent:', data);

//     // Create a form and submit it
//     const form = document.createElement('form');
//     form.method = 'POST';
//     form.action = '/mainSearch';

    

//     for (const key in data) {
//         if (data.hasOwnProperty(key)) {
//             if (Array.isArray(data[key])) {
//                 // If the value is an array (like categories), create a hidden input for each item
//                 data[key].forEach(value => {
//                     const input = document.createElement('input');
//                     input.type = 'hidden';
//                     input.name = key; // Keep the same name to treat as an array on server-side
//                     input.value = value;
//                     form.appendChild(input);
//                 });
//             } else {
//                 const input = document.createElement('input');
//                 input.type = 'hidden';
//                 input.name = key;
//                 input.value = data[key];
//                 form.appendChild(input);
//             }
//         }
//     }

//     document.body.appendChild(form);
//     form.submit();
// }



// //dates







// //responsive code 




// document.addEventListener("DOMContentLoaded", function () {
//     const filterContainer = document.querySelector(".mb-filter-container");
//     const editFilterBtn = document.querySelector(".mb-filters h3");
//     const closeFilterBtn = document.querySelector(".filter-close-btn");

//     editFilterBtn.addEventListener("click", function () {
//         filterContainer.classList.add("open-filter");
//     });

//     closeFilterBtn.addEventListener("click", function () {
//         filterContainer.classList.remove("open-filter");
//     });
// });


// function openFilterPopup() {
//     document.getElementById('filterPopup').style.display = 'flex';
//     document.body.style.overflow = 'hidden'; // Optional: Disable scrolling on main content
//   }
  
//   function closeFilterPopup() {
//     document.getElementById('filterPopup').style.display = 'none';
//     document.body.style.overflow = ''; // Enable scrolling back
//   }
  