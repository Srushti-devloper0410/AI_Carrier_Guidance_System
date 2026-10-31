
document.addEventListener("DOMContentLoaded", async function () {

    // Get JWT token
    const token = localStorage.getItem("authToken");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        // Fetch logged-in user's profile from backend
        const response = await fetch(
            "https://ai-carrier-guidance-system.onrender.com/students/me",
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (response.status === 401) {
            alert("Session expired. Please login again.");
            localStorage.removeItem("authToken");
            localStorage.removeItem("authUser");
            window.location.href = "login.html";
            return;
        }

        if (response.status === 404) {
            alert("Your student profile is not created yet.");
            return;
        }

        if (!response.ok) {
            throw new Error("Unable to fetch profile information.");
        }

        const profile = await response.json();

        // Personal Information
        document.getElementById("profileName").textContent =
            profile.name || "Not added yet";

        document.getElementById("profileEmail").textContent =
            profile.email || "Not added yet";

        // Academic Information
        document.getElementById("profileCourse").textContent =
            profile.course || "Not added yet";

        document.getElementById("profileYear").textContent =
            profile.year || "Not added yet";

        document.getElementById("profilePercentage").textContent =
            profile.percentage !== null && profile.percentage !== undefined
                ? profile.percentage + "%"
                : "Not added yet";

        document.getElementById("profileStream").textContent =
            profile.stream || "Not added yet";

        // Skills and Interests
        document.getElementById("profileSkills").textContent =
            profile.skills || "Not added yet";

        document.getElementById("profileInterest").textContent =
            profile.interest || "Not added yet";

    } catch (error) {
        console.error("Profile loading error:", error);
        alert("Unable to load profile. Please try again later.");
    }

});
