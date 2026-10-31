
document.addEventListener("DOMContentLoaded", function () {

    // =====================================
    // 1. API CONFIGURATION
    // =====================================

    const API_URL = "https://ai-carrier-guidance-system.onrender.com";

    // =====================================
    // 2. ADMIN AUTHENTICATION CHECK
    // =====================================

    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("authUser");

    if (!token || !storedUser) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    let currentUser;

    try {
        currentUser = JSON.parse(storedUser);
    } catch (error) {
        localStorage.removeItem("authUser");
        window.location.href = "login.html";
        return;
    }

    // Only admin role can continue
    if (currentUser.role !== "admin") {
        alert("Access denied! Admin permission required.");
        window.location.href = "index.html";
        return;
    }

    // =====================================
    // 3. DISPLAY ADMIN NAME
    // =====================================

    const adminLabel = document.querySelector(".admin-label");

    if (adminLabel) {
        adminLabel.textContent = currentUser.name || "Administrator";
    }

    // =====================================
    // 4. DISPLAY CURRENT DATE
    // =====================================

    const dateElement = document.getElementById("currentDate");

    if (dateElement) {
        dateElement.textContent = new Date().toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    }

    // =====================================
    // 5. CHART CONFIGURATION
    // =====================================

    let studentChart = null;
    let careerChart = null;

    function createCharts() {

        const studentCanvas = document.getElementById("studentChart");
        const careerCanvas = document.getElementById("careerChart");

        if (studentCanvas && typeof Chart !== "undefined") {

            studentChart = new Chart(studentCanvas, {
                type: "bar",

                data: {
                    labels: [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun"
                    ],

                    datasets: [{
                        label: "Assessments",
                        data: [0, 0, 0, 0, 0, 0],
                        backgroundColor: "#3b82f6",
                        borderRadius: 6
                    }]
                },

                options: {
                    responsive: true,
                    maintainAspectRatio: false,

                    plugins: {
                        legend: {
                            display: false
                        }
                    },

                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0
                            }
                        }
                    }
                }
            });
        }

        if (careerCanvas && typeof Chart !== "undefined") {

            careerChart = new Chart(careerCanvas, {
                type: "doughnut",

                data: {
                    labels: [
                        "Frontend Development",
                        "Backend Development",
                        "Data Science",
                        "Other"
                    ],

                    datasets: [{
                        data: [1, 1, 1, 1],

                        backgroundColor: [
                            "#3b82f6",
                            "#a855f7",
                            "#22c55e",
                            "#f59e0b"
                        ],

                        borderWidth: 0
                    }]
                },

                options: {
                    responsive: true,
                    maintainAspectRatio: false,

                    plugins: {
                        legend: {
                            position: "bottom"
                        }
                    }
                }
            });
        }
    }

    createCharts();

    // =====================================
    // 6. SIDEBAR ACTIVE LINK
    // =====================================

    const sidebarLinks = document.querySelectorAll(".sidebar-link");

    sidebarLinks.forEach(function (link) {

        link.addEventListener("click", function () {

            sidebarLinks.forEach(function (item) {
                item.classList.remove("active");
            });

            if (this.getAttribute("href")?.startsWith("#")) {
                this.classList.add("active");
            }
        });
    });

    // =====================================
    // 7. LOGOUT
    // =====================================

    const logoutButton = document.getElementById("adminLogout");

    if (logoutButton) {

        logoutButton.addEventListener("click", function (event) {

            event.preventDefault();

            const confirmLogout = confirm(
                "Are you sure you want to logout?"
            );

            if (confirmLogout) {

                localStorage.removeItem("authToken");
                localStorage.removeItem("authUser");
                localStorage.removeItem("studentProfile");

                window.location.href = "login.html";
            }
        });
    }

});
