
document.addEventListener("DOMContentLoaded", function () {

    // Get logged-in user information
    const savedProfile = localStorage.getItem("studentProfile");

    if (!savedProfile) {
        window.location.href = "login.html";
        return;
    }

    try {
        const profile = JSON.parse(savedProfile);

        // Display Personal Information
        document.getElementById("profileName").textContent =
            profile.name || "Not added yet";

        document.getElementById("profileEmail").textContent =
            profile.email || "Not added yet";

        // Display Academic Information
        document.getElementById("profileCourse").textContent =
            profile.course || "Not added yet";

        document.getElementById("profileYear").textContent =
            profile.year || "Not added yet";

        document.getElementById("profilePercentage").textContent =
            profile.percentage !== undefined && profile.percentage !== null
                ? profile.percentage + "%"
                : "Not added yet";

        document.getElementById("profileStream").textContent =
            profile.stream || "Not added yet";

        // Display Skills and Interests
        document.getElementById("profileSkills").textContent =
            profile.skills || "Not added yet";

        document.getElementById("profileInterest").textContent =
            profile.interest || "Not added yet";

    } catch (error) {
        console.error("Unable to load profile:", error);
        alert("Unable to load profile information. Please sign in again.");
        localStorage.removeItem("studentProfile");
        window.location.href = "login.html";
    }

});
