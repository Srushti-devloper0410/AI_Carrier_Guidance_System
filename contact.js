document.getElementById("contactForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = {
        name: document.getElementById("contactName").value,
        email: document.getElementById("contactEmail").value,
        subject: document.getElementById("contactSubject").value,
        message: document.getElementById("contactMessage").value
    };

    try {
        const response = await fetch("https://ai-carrier-guidance-system.onrender.com/contact", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error("Failed to save message");
        }

        const data = await response.json();

        alert(data.message);

        document.getElementById("contactForm").reset();

    } catch (error) {
        console.error(error);
        alert("Unable to send message. Please try again.");
    }
});
