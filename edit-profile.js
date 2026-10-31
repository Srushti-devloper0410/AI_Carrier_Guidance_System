
document.addEventListener("DOMContentLoaded", async function () {

    const token = localStorage.getItem("authToken");
    const form = document.getElementById("editProfileForm");
    const submitButton = form.querySelector('button[type="submit"]');

    const API_URL = "https://ai-carrier-guidance-system.onrender.com";

    // Check login
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    // Load existing profile
    async function loadProfile() {
        try {
            const response = await fetch(`${API_URL}/students/me`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                alert("Session expired. Please login again.");
                localStorage.removeItem("authToken");
                localStorage.removeItem("authUser");
                window.location.href = "login.html";
                return false;
            }

            if (response.status === 404) {
                alert("Student profile not found. Please create your profile first.");
                window.location.href = "profile.html";
                return false;
            }

            if (!response.ok) {
                throw new Error("Unable to load profile.");
            }

            const profile = await response.json();

            document.getElementById("editName").value =
                profile.name || "";

            document.getElementById("editEmail").value =
                profile.email || "";

            document.getElementById("editCourse").value =
                profile.course || "";

            document.getElementById("editYear").value =
                profile.year || "";

            document.getElementById("editPercentage").value =
                profile.percentage ?? "";

            document.getElementById("editStream").value =
                profile.stream || "";

            document.getElementById("editSkills").value =
                profile.skills || "";

            document.getElementById("editInterest").value =
                profile.interest || "";

            return true;

        } catch (error) {
            console.error("Profile loading error:", error);
            alert("Unable to load profile. Please try again.");
            return false;
        }
    }

    // Save updated profile
    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const updatedProfile = {
            name: document.getElementById("editName").value,
            email: document.getElementById("editEmail").value,
            course: document.getElementById("editCourse").value.trim(),
            year: document.getElementById("editYear").value.trim(),
            percentage: Number(
                document.getElementById("editPercentage").value
            ),
            stream: document.getElementById("editStream").value.trim(),
            skills: document.getElementById("editSkills").value.trim(),
            interest: document.getElementById("editInterest").value.trim()
        };

        if (
            updatedProfile.percentage < 0 ||
            updatedProfile.percentage > 100
        ) {
            alert("Percentage must be between 0 and 100.");
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Saving...";

        try {
            const response = await fetch(`${API_URL}/students/me`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(updatedProfile)
            });

            if (response.status === 401) {
                alert("Session expired. Please login again.");
                localStorage.removeItem("authToken");
                localStorage.removeItem("authUser");
                window.location.href = "login.html";
                return;
            }

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.detail || "Unable to update profile.");
            }

            alert("Profile updated successfully!");
            window.location.href = "profile.html";

        } catch (error) {
            console.error("Profile update error:", error);
            alert(error.message || "Something went wrong.");

        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Save Changes";
        }
    });

    // Fetch profile when page opens
    const loaded = await loadProfile();

    if (!loaded) {
        submitButton.disabled = true;
    }

});
