fetch("navbar.html")
    .then(response => response.text())
    .then(data => {

        document.getElementById("navbar-container").innerHTML = data;

        // Load student name
        const savedProfile = localStorage.getItem("studentProfile");

        if (savedProfile) {

            const profile = JSON.parse(savedProfile);

            const navStudentName =
                document.getElementById("navStudentName");

            if (navStudentName && profile.name) {
                navStudentName.textContent = profile.name;
            }
        }

        // Logout
        const logoutBtn = document.getElementById("logoutBtn");

        if (logoutBtn) {

            logoutBtn.addEventListener("click", function (event) {

                event.preventDefault();

                const confirmLogout = confirm(
                    "Are you sure you want to logout?"
                );

                if (confirmLogout) {

                    localStorage.removeItem("studentProfile");
                    localStorage.removeItem("studentId");
                    localStorage.removeItem("careerResults");

                    window.location.href = "index.html";
                }

            });
        }

    })
    .catch(error => {
        console.error("Navbar loading error:", error);
    });