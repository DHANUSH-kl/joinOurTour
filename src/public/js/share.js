document.addEventListener("DOMContentLoaded", function () {
    const shareBtn = document.getElementById("shareBtn");
    const modal = document.getElementById("customShareModal");
    const copyLinkBtn = document.getElementById("copyLink");
    const closeShareBtn = document.getElementById("closeShare");

    // ✅ Get trip URL from the data attribute
    const tripUrl = shareBtn.getAttribute("data-trip-url");

    // Set social media share links
    document.getElementById("whatsappShare").href = `https://wa.me/?text=${encodeURIComponent(tripUrl)}`;
    document.getElementById("facebookShare").href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(tripUrl)}`;
    document.getElementById("twitterShare").href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(tripUrl)}&text=Check+out+this+amazing+trip!`;

    shareBtn.addEventListener("click", async function () {
        const shareData = {
            title: "Check out this trip!",
            text: "Take a look at this amazing trip!",
            url: tripUrl
        };

        // ✅ Native Share API (for mobile & modern browsers)
        if (navigator.share) {
            try {
                await navigator.share(shareData);
                return; // ❌ Prevents modal from appearing after native share
            } catch (error) {
                console.log("Error sharing:", error);
            }
        }

        // ❌ If navigator.share fails or is unsupported, open the custom modal
        modal.classList.remove("hidden");
    });

    // ✅ Copy to Clipboard
    copyLinkBtn.addEventListener("click", async function () {
        try {
            await navigator.clipboard.writeText(tripUrl);
            copyLinkBtn.textContent = "✅ Copied!";
            setTimeout(() => { copyLinkBtn.textContent = "Copy Link"; }, 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    });

    // ✅ Close Share Modal
    closeShareBtn.addEventListener("click", function () {
        modal.classList.add("hidden");
    });

    // ✅ Close modal when clicking outside
    window.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.classList.add("hidden");
        }
    });
});
