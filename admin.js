
document.addEventListener("DOMContentLoaded", async function () {
    const API_URL = "https://ai-carrier-guidance-system.onrender.com";

    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("authUser");

    // Check login
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

    // Frontend role check
    if (currentUser.role !== "admin") {
        alert("Access denied! Admin permission required.");
        window.location.href = "index.html";
        return;
    }

    // Admin information
    const adminLabel = document.getElementById("adminLabel");
    if (adminLabel) {
        adminLabel.textContent = currentUser.name || "Admin";
    }

    const currentDate = document.getElementById("currentDate");
    if (currentDate) {
        currentDate.textContent = new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }

    // Safely create table rows
    function showTable(tableId, rows, columns) {
        const tbody = document.getElementById(tableId);
        if (!tbody) return;

        tbody.replaceChildren();

        if (!rows || rows.length === 0) {
            const tr = document.createElement("tr");
            const td = document.createElement("td");
            td.colSpan = columns.length;
            td.textContent = "No records available.";
            td.className = "text-center text-muted";
            tr.appendChild(td);
            tbody.appendChild(tr);
            return;
        }

        rows.forEach(function (item) {
            const tr = document.createElement("tr");

            columns.forEach(function (column) {
                const td = document.createElement("td");
                let value = item[column] ?? "-";

                if (column === "created_at" && value !== "-") {
                    value = new Date(value).toLocaleDateString("en-IN");
                }

                td.textContent = String(value);
                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });
    }

    // Load dashboard data from backend
    async function loadDashboard() {
        try {
            const response = await fetch(`${API_URL}/admin/dashboard`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.status === 401) {
                alert("Session expired. Please login again.");
                localStorage.clear();
                window.location.href = "login.html";
                return;
            }

            if (response.status === 403) {
                alert("You do not have admin permission.");
                window.location.href = "index.html";
                return;
            }

            if (!response.ok) {
                throw new Error("Unable to load dashboard data.");
            }

            const data = await response.json();
            const stats = data.statistics;

            // Update statistics cards
            document.getElementById("totalStudents").textContent =
                stats.total_students ?? 0;

            document.getElementById("totalAssessments").textContent =
                stats.total_assessments ?? 0;

            document.getElementById("totalRecommendations").textContent =
                stats.total_recommendations ?? 0;

            document.getElementById("totalMessages").textContent =
                stats.total_messages ?? 0;

            // Students table
            showTable("recentStudents", data.recent_students, [
                "id",
                "name",
                "email",
                "course",
                "year"
            ]);

            // Assessments table
            showTable("recentAssessments", data.recent_assessments, [
                "id",
                "student_name",
                "career",
                "created_at"
            ]);

            // Recommendations table
            showTable("recentRecommendations", data.recent_recommendations, [
                "id",
                "student_name",
                "career",
                "match_score",
                "created_at"
            ]);

            // Messages table
            showTable("recentMessages", data.recent_messages, [
                "id",
                "name",
                "email",
                "subject",
                "created_at"
            ]);

            // Users table (if its section is added in HTML)
            showTable("recentUsers", data.recent_users, [
                "id",
                "name",
                "email",
                "role",
                "created_at"
            ]);

            // Charts
            createCharts(data);

        } catch (error) {
            console.error("Admin Dashboard Error:", error);
            alert("Dashboard data could not be loaded. Please try again later.");
        }
    }

    // Create charts using actual dashboard data
    function createCharts(data) {
        if (typeof Chart === "undefined") {
            console.error("Chart.js is not loaded.");
            return;
        }

        const studentCanvas = document.getElementById("studentChart");
        const careerCanvas = document.getElementById("careerChart");

        if (studentCanvas) {
            const yearCounts = {};

            (data.recent_students || []).forEach(function (student) {
                const year = student.year || "Not specified";
                yearCounts[year] = (yearCounts[year] || 0) + 1;
            });

            if (window.studentChartInstance) {
                window.studentChartInstance.destroy();
            }

            window.studentChartInstance = new Chart(studentCanvas, {
                type: "bar",
                data: {
                    labels: Object.keys(yearCounts),
                    datasets: [{
                        label: "Students",
                        data: Object.values(yearCounts),
                        backgroundColor: "#4361ee",
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }

        if (careerCanvas) {
            const careerCounts = {};

            (data.recent_recommendations || []).forEach(function (item) {
                const career = item.career || "Other";
                careerCounts[career] = (careerCounts[career] || 0) + 1;
            });

            if (window.careerChartInstance) {
                window.careerChartInstance.destroy();
            }

            window.careerChartInstance = new Chart(careerCanvas, {
                type: "doughnut",
                data: {
                    labels: Object.keys(careerCounts),
                    datasets: [{
                        data: Object.values(careerCounts),
                        backgroundColor: [
                            "#4361ee",
                            "#7209b7",
                            "#06d6a0",
                            "#f8961e",
                            "#ef476f",
                            "#118ab2"
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }
    }

    // Sidebar active link
    document.querySelectorAll(".sidebar-link").forEach(function (link) {
        link.addEventListener("click", function () {
            document.querySelectorAll(".sidebar-link").forEach(function (item) {
                item.classList.remove("active");
            });

            this.classList.add("active");
        });
    });

    // Logout
    const logoutButton = document.getElementById("adminLogout");

    if (logoutButton) {
        logoutButton.addEventListener("click", function (event) {
            event.preventDefault();

            localStorage.removeItem("authToken");
            localStorage.removeItem("authUser");
            localStorage.removeItem("studentProfile");

            window.location.href = "login.html";
        });
    }

    // Load dashboard
    await loadDashboard();
});
