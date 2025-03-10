


// Auto-hide flash messages after 3 seconds
setTimeout(() => {
    let flashMessages = document.querySelectorAll(".flash-message");
    flashMessages.forEach(msg => {
        msg.style.opacity = "0";
        setTimeout(() => msg.style.display = "none", 500); // Hide after fade-out
    });
}, 3000);