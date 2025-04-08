function launchRazorpay() {
    // Get trip details
    const tripId = "<%= trip._id %>";
            const userId = "<%= user._id %>";
            const amount = <%= totalAmount %>;
            const ticket = <%= numTickets %>;

            try {
                // 1️⃣ Create Razorpay Order from Backend
                const response = await fetch("/create-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ amount, tripId, userId }),
                });
                const data = await response.json();

                if (!data.success) {
                    alert("Order creation failed!");
                    return;
                }

                // 2️⃣ Initialize Razorpay Checkout
                const options = {
                    key: "<%= process.env.RAZORPAY_KEY_ID %>",
                    amount: data.order.amount,
                    currency: "INR",
                    name: "Trip Booking",
                    description: "Payment for your trip",
                    order_id: data.order.id,
                    handler: async function (response) {
                        // 3️⃣ Verify Payment in Backend
                        const verifyResponse = await fetch("/verify-payment", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                tripId,
                                userId,
                                amount,
                                ticket
                            }),
                        });

                        const verifyData = await verifyResponse.json();
                        if (verifyData.success) {
                            alert("Payment successful!");
                            window.location.href = "/bookings"; // Redirect to user's booking page
                        } else {
                            alert("Payment verification failed!");
                        }
                    },
                    theme: { color: "#528FF0" },
                };

                const rzp = new Razorpay(options);
                rzp.open();
            } catch (error) {
                console.error(error);
                alert("Something went wrong!");
            }
}
