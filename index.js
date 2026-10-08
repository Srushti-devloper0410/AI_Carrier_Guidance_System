document.addEventListener("DOMContentLoaded", function () {

    // --------------------------------
    // Show Student Name
    // --------------------------------

    const savedProfile =
        localStorage.getItem("studentProfile");

    if (savedProfile) {

        const profile =
            JSON.parse(savedProfile);

        const navStudentName =
            document.getElementById("navStudentName");

        if (navStudentName && profile.name) {
            navStudentName.textContent =
                profile.name;
        }
    }


    // --------------------------------
    // Logout
    // --------------------------------

    const logoutBtn =
        document.getElementById("logoutBtn");

    if (logoutBtn) {

        logoutBtn.addEventListener("click", function (event) {

            event.preventDefault();

            const confirmLogout =
                confirm("Are you sure you want to logout?");

            if (!confirmLogout) {
                return;
            }

            // Clear current student session data
            localStorage.removeItem("studentProfile");
            localStorage.removeItem("studentId");
            localStorage.removeItem("careerResults");

            // Redirect to Home
            window.location.href = "index.html";

        });

    }

});