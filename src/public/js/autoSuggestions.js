
// $(document).ready(function() {
//     console.log("Document is ready, initializing autocomplete...");

//     let locations = {};

//     // Load the locations data from the JSON file
//     $.getJSON('locations.json', function(data) {
//         locations = data;
//         console.log("Locations data loaded:", locations);
//     }).fail(function() {
//         console.error("Failed to load JSON file.");
//     });

//     // Autocomplete for States and Cities
//     $("#startingLocation").autocomplete({
//         source: function(request, response) {
//             let results = [];
//             let stateMatches = [];
//             let cityMatches = [];

//             // Search states and cities
//             $.each(locations, function(state, cities) {
//                 if (state.toLowerCase().startsWith(request.term.toLowerCase())) {
//                     stateMatches.push({ label: state, category: "States" });
//                     $.each(cities, function(index, city) {
//                         cityMatches.push({ label: city, category: state });
//                     });
//                 } else {
//                     $.each(cities, function(index, city) {
//                         if (city.toLowerCase().startsWith(request.term.toLowerCase())) {
//                             cityMatches.push({ label: city, category: state });
//                         }
//                     });
//                 }
//             });

//             // Combine state and city matches, showing states first
//             results = stateMatches.concat(cityMatches);
//             response(results);
//         },
//         minLength: 1,
//         focus: function(event, ui) {
//             $("#startingLocation").val(ui.item.label);
//             return false;
//         },
//         select: function(event, ui) {
//             $("#startingLocation").val(ui.item.label);
//             return false;
//         }
//     }).autocomplete("instance")._renderItem = function(ul, item) {
//         // Customize the appearance of each suggestion item
//         return $("<li>")
//             .append("<div><strong>" + item.label + "</strong><br><small>" + item.category + "</small></div>")
//             .appendTo(ul);
//     };
// });



$(document).ready(function() {
    console.log("Document is ready, initializing autocomplete...");

    let locations = {};

    // Load the locations data from the JSON file
    $.getJSON('locations.json', function(data) {
        locations = data;
        console.log("Locations data loaded:", locations);
    }).fail(function() {
        console.error("Failed to load JSON file.");
    });

    // Function to initialize autocomplete for an input field
    function initializeAutocomplete(inputSelector) {
        $(inputSelector).autocomplete({
            source: function(request, response) {
                let results = [];
                let stateMatches = [];
                let cityMatches = [];

                // Search states and cities
                $.each(locations, function(state, cities) {
                    if (state.toLowerCase().startsWith(request.term.toLowerCase())) {
                        stateMatches.push({ label: state, category: "States" });
                        $.each(cities, function(index, city) {
                            cityMatches.push({ label: city, category: state });
                        });
                    } else {
                        $.each(cities, function(index, city) {
                            if (city.toLowerCase().startsWith(request.term.toLowerCase())) {
                                cityMatches.push({ label: city, category: state });
                            }
                        });
                    }
                });

                // Combine state and city matches, showing states first
                results = stateMatches.concat(cityMatches);
                response(results);
            },
            minLength: 1,
            focus: function(event, ui) {
                $(inputSelector).val(ui.item.label);
                return false;
            },
            select: function(event, ui) {
                $(inputSelector).val(ui.item.label);
                return false;
            }
        }).autocomplete("instance")._renderItem = function(ul, item) {
            // Customize the appearance of each suggestion item
            return $("<li>")
                .append("<div><strong>" + item.label + "</strong><br><small>" + item.category + "</small></div>")
                .appendTo(ul);
        };
    }

    // Apply autocomplete to both Starting Location and Destination Location
    initializeAutocomplete("#startingLocation");
    initializeAutocomplete("#destinationLocation");
    initializeAutocomplete("#secondaryDestination"); 
})









// $(document).ready(function() {
//     console.log("Document is ready, initializing autocomplete...");

//     let locations = {};

//     // Load the locations data from the JSON file
//     $.getJSON('locations.json', function(data) {
//         locations = data;
//         console.log("Locations data loaded:", locations);
//     }).fail(function() {
//         console.error("Failed to load JSON file.");
//     });

//     // Autocomplete for States
//     $("#startingLocation").autocomplete({
//         source: function(request, response) {
//             let results = [];

//             // Search only states
//             $.each(locations, function(state, cities) {
//                 if (state.toLowerCase().startsWith(request.term.toLowerCase())) {
//                     results.push({ label: state, category: "States", cities: cities });
//                 }
//             });

//             response(results);
//         },
//         minLength: 1,
//         focus: function(event, ui) {
//             $("#startingLocation").val(ui.item.label);
//             return false;
//         },
//         select: function(event, ui) {
//             $("#startingLocation").val(ui.item.label);
//             return false;
//         }
//     }).autocomplete("instance")._renderItem = function(ul, item) {
//         // Customize the appearance of each suggestion item
//         let li = $("<li>")
//             .append("<div><strong>" + item.label + "</strong></div>")
//             .appendTo(ul);

//         // Hover event to show cities
//         li.hover(function() {
//             console.log("Hovered over state:", item.label);

//             // Ensure only one city list is shown at a time
//             $(".city-list").remove();

//             let citiesList = $("<ul>").addClass("city-list");
//             $.each(item.cities, function(index, city) {
//                 citiesList.append("<li>" + city + "</li>");
//             });

//             // Append the cities list to the current `li`
//             $(this).append(citiesList);

//         }, function() {
//             // Remove the cities list when not hovering
//             $(this).find(".city-list").remove();
//         });

//         return li;
//     };
// });




