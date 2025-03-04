document.addEventListener("DOMContentLoaded", () => {
    console.log("Admin script loaded!");

    document.body.addEventListener("click", async (event) => {
        const target = event.target;

        // Revoke Access
        if (target.classList.contains("revoke")) {
            const userId = target.getAttribute("data-id");
            if (!userId) return console.error("❌ No user ID found!");

            if (!confirm("Are you sure you want to revoke agent access?")) return;

            try {
                const response = await fetch(`/admin/revoke-access/${userId}`, {
                    method: "PUT", // ✅ Changed to PUT
                    headers: { "Content-Type": "application/json" }
                });

                const data = await response.json();
                if (data.success) {
                    alert(data.message);
                    location.reload();
                } else {
                    alert("❌ Error: " + data.message);
                }
            } catch (error) {
                console.error("❌ Error revoking access:", error);
            }
        }

        // Suspend User
        if (target.classList.contains("suspend-btn")) {
            const userId = target.getAttribute("data-id");
            const inputField = document.querySelector(`.suspend-input[data-id="${userId}"]`);
            const days = inputField?.value.trim();

            if (!days || isNaN(days) || days <= 0) {
                alert("Please enter a valid number of days.");
                return;
            }

            if (!confirm(`Are you sure you want to suspend for ${days} days?`)) return;

            try {
                const response = await fetch(`/admin/suspend/${userId}`, {
                    method: "PUT", // ✅ Changed to PUT
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ days: parseInt(days) })
                });

                const data = await response.json();
                if (data.success) {
                    alert(data.message);
                    location.reload();
                } else {
                    alert("❌ Error: " + data.message);
                }
            } catch (error) {
                console.error("❌ Error suspending user:", error);
            }
        }

        // Lift Suspension
        if (target.classList.contains("lift")) {
            const userId = target.getAttribute("data-id");
            if (!userId) return;

            if (!confirm("Are you sure you want to lift the suspension?")) return;

            try {
                const response = await fetch(`/admin/lift-suspension/${userId}`, {
                    method: "PUT", // ✅ Changed to PUT
                    headers: { "Content-Type": "application/json" }
                });

                const data = await response.json();
                if (data.success) {
                    alert(data.message);
                    location.reload();
                } else {
                    alert("❌ Error: " + data.message);
                }
            } catch (error) {
                console.error("❌ Error lifting suspension:", error);
            }
        }
    });
});
