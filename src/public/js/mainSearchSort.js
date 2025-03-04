
// document.addEventListener("DOMContentLoaded", function () {
//     const tripsData = <%- JSON.stringify(exactMatchTrips) %>;

//     document.getElementById('sort-options').addEventListener('change', function () {
//         const selectedSort = this.value;
//         let sortedTrips = [...tripsData];

//         if (selectedSort === "price-low-high") {
//             sortedTrips.sort((a, b) => a.totalCost - b.totalCost);
//         } else if (selectedSort === "price-high-low") {
//             sortedTrips.sort((a, b) => b.totalCost - a.totalCost);
//         } else if (selectedSort === "rating-high-low") {
//             sortedTrips.sort((a, b) => b.averageRating - a.averageRating);
//         } else if (selectedSort === "rating-low-high") {
//             sortedTrips.sort((a, b) => a.averageRating - b.averageRating);
//         }

//         // Update the UI with sorted trips
//         const container = document.querySelector('.cards-container');
//         container.innerHTML = '';

//         sortedTrips.forEach((trip, i) => {
//             const tripCard = `
//                 <div class="card-container">
//                     <div class="card-img">
//                         ${trip.tripImages && trip.tripImages.length > 0 && trip.tripImages[0].path 
//                             ? `<div class="trip-image">
//                                 <img src="${trip.tripImages[0].path}" alt="Trip Image">
//                                </div>`
//                             : `<p>No images available for this trip</p>`
//                         }
//                         <div class="heart-container">
//                             ${trip.user 
//                                 ? `<i class="${trip.userWishlist.includes(trip._id.toString()) 
//                                     ? 'fa-solid fa-heart wishlist-active' 
//                                     : 'fa-regular fa-heart'} wishlist-icon" data-id="${trip._id}" style="cursor: pointer;"></i>` 
//                                 : `<i class="fa-regular fa-heart wishlist-icon redirect-i" data-id="${trip._id}"></i>`}
//                         </div>
//                     </div>
//                     <div class="card-body">
//                         <div class="route">
//                             <img src="../images/route.svg" alt="">
//                             <h3 class="card-title">
//                                 <a href="/tour/${trip._id}">
//                                     ${trip.location}
//                                 </a>
//                                 <p>
//                                     ${trip.departure 
//                                         ? new Date(trip.departure).toLocaleDateString('en-US', { month: 'long', day: '2-digit' }) + ' ~ ' 
//                                         : 'date not available'}
//                                     ${trip.endDate 
//                                         ? new Date(trip.endDate).toLocaleDateString('en-US', { month: 'long', day: '2-digit' }) 
//                                         : ''}
//                                 </p>
//                             </h3>
//                         </div>
//                         <div class="title-container">
//                             <h4 class="trip-title">${trip.title}</h4>
//                         </div>
//                         <div class="ratio-container">
//                             <p class="maleRatio">Male: ${trip.maleRatio}%</p>
//                             <p class="femaleRatio">Female: ${trip.femaleRatio}%</p>
//                         </div>
//                         <div class="rating-container">
//                             <div class="rate rat1">
//                                 ${[5, 4, 3, 2, 1].map(star => `
//                                     <input type="radio" id="locStar${star}-${i}" name="locationRating-${i}" value="${star}" 
//                                         ${trip.averageRating >= star ? 'checked' : ''} disabled />
//                                     <label for="locStar${star}-${i}">${star} stars</label>
//                                 `).join('')}
//                             </div>
//                             <p>${trip.averageRating}</p>
//                         </div>
//                         <div class="card-bottom">
//                             <div class="days-container">
//                                 <h4 class="days">${trip.totalDays} days</h4>
//                             </div>
//                             <div class="price-container">
//                                 ${trip.totalCost 
//                                     ? `<span>FROM</span> &nbsp;<b>${trip.totalCost.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</b>` 
//                                     : 'Price Not Available'}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             `;
//             container.innerHTML += tripCard;
//         });
//     });
// });


console.log("📊 Initial Trips Data:", tripsData.map(trip => ({
    id: trip._id,
    title: trip.title,
    rating: trip.averageRating
})));
