document.addEventListener("DOMContentLoaded", function () {
    const categoryLabels = document.querySelectorAll("#categoryInputs label");
    const seeMoreText = document.getElementById("seeMoreText");

    // Initially hide labels after the first 5 (visually, but keep flex layout intact)
    categoryLabels.forEach((label, index) => {
        if (index >= 5) {
            label.classList.add('hidden-category');
        }
    });

    window.toggleSeeMore = function () {
        const isExpanded = seeMoreText.getAttribute("data-expanded") === "true";

        if (isExpanded) {
            // Collapse to only show 5
            categoryLabels.forEach((label, index) => {
                if (index >= 5) {
                    label.classList.add('hidden-category');
                }
            });
            seeMoreText.textContent = "See More";
            seeMoreText.setAttribute("data-expanded", "false");
        } else {
            // Show all
            categoryLabels.forEach((label) => {
                label.classList.remove('hidden-category');
            });
            seeMoreText.textContent = "See Less";
            seeMoreText.setAttribute("data-expanded", "true");
        }
    };
});
