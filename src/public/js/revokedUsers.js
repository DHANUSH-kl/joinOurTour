document.addEventListener("DOMContentLoaded", async () => {
    const revokedTable = document.getElementById("revoked-table").querySelector("tbody");

    try {
        const response = await fetch("/admin/revoked-users-data"); // Fetch revoked users
        const data = await response.json();
        
        console.log("Fetched Users Data:", data); // Debugging line

        if (data.success) {
            revokedTable.innerHTML = ""; // Clear previous data

            data.users.forEach(user => {
                console.log(`User ${user.email} suspendedUntil:`, user.suspendedUntil); // Debugging

                const isSuspended = user.suspendedUntil && new Date(user.suspendedUntil) > new Date();
                const suspensionEndDate = isSuspended ? new Date(user.suspendedUntil).toLocaleDateString() : "-";

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${user._id}</td>
                    <td>${user.email}</td>
                    <td>${user.isAgent ? "Yes" : "No"}</td> <!-- Updated -->
                    <td>${isSuspended ? "Yes" : "No"}</td>  <!-- Show "Yes" if suspended -->
                    <td>${suspensionEndDate}</td>  <!-- Show correct date -->
                    <td>
                        <button class="lift-btn btn btn-success" data-id="${user._id}">Lift</button>
                    </td>
                `;
                revokedTable.appendChild(row);
            });

        } else {
            alert("❌ Error fetching revoked accounts.");
        }
    } catch (error) {
        console.error("❌ Error fetching revoked users:", error);
    }

    // ✅ Event Delegation for Lift Suspension Button
    document.body.addEventListener("click", async (event) => {
        if (event.target.classList.contains("lift-btn")) {
            const userId = event.target.getAttribute("data-id");
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
                    
                    // ✅ Remove lifted user from the table instead of reloading
                    event.target.closest("tr").remove();
                } else {
                    alert("❌ Error: " + data.message);
                }
            } catch (error) {
                console.error("❌ Error lifting suspension:", error);
            }
        }
    });
});
