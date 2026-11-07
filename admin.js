
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
                localStorage.removeItem("authToken");
                localStorage.removeItem("authUser");
                localStorage.removeItem("studentProfile");
                localStorage.removeItem("studentId");
                localStorage.removeItem("careerResults");
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

    
    // =========================================
    // STUDENTS MANAGEMENT
    // =========================================

    const studentsTableBody = document.getElementById("studentsTableBody");
    const studentSearch = document.getElementById("studentSearch");
    const searchStudentBtn = document.getElementById("searchStudentBtn");
    const resetStudentSearch = document.getElementById("resetStudentSearch");

    // Load students from backend
    async function loadStudents(search = "") {
        if (!studentsTableBody) return;

        studentsTableBody.replaceChildren();

        const loadingRow = document.createElement("tr");
        const loadingCell = document.createElement("td");
        loadingCell.colSpan = 6;
        loadingCell.textContent = "Loading students...";
        loadingCell.className = "text-center";
        loadingRow.appendChild(loadingCell);
        studentsTableBody.appendChild(loadingRow);

        try {
            const response = await fetch(
                `${API_URL}/admin/students?search=${encodeURIComponent(search)}`,
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
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

            if (response.status === 403) {
                alert("Admin permission required.");
                window.location.href = "index.html";
                return;
            }

            if (!response.ok) {
                throw new Error("Unable to load students.");
            }

            const data = await response.json();
            const students = data.students || [];

            studentsTableBody.replaceChildren();

            if (students.length === 0) {
                const row = document.createElement("tr");
                const cell = document.createElement("td");

                cell.colSpan = 6;
                cell.textContent = "No students found.";
                cell.className = "text-center text-muted";

                row.appendChild(cell);
                studentsTableBody.appendChild(row);
                return;
            }

            students.forEach(function (student) {
                const row = document.createElement("tr");

                ["id", "name", "email", "course", "year"].forEach(function (column) {
                    const cell = document.createElement("td");
                    cell.textContent = student[column] ?? "-";
                    row.appendChild(cell);
                });

                // Actions cell
                const actionsCell = document.createElement("td");

                const viewButton = document.createElement("button");
                viewButton.type = "button";
                viewButton.textContent = "View";
                viewButton.className = "btn btn-sm btn-info me-2";
                viewButton.dataset.action = "view";
                viewButton.dataset.studentId = student.id;

                const deleteButton = document.createElement("button");
                deleteButton.type = "button";
                deleteButton.textContent = "Delete";
                deleteButton.className = "btn btn-sm btn-danger";
                deleteButton.dataset.action = "delete";
                deleteButton.dataset.studentId = student.id;

                actionsCell.appendChild(viewButton);
                actionsCell.appendChild(deleteButton);
                row.appendChild(actionsCell);

                studentsTableBody.appendChild(row);
            });

        } catch (error) {
            console.error("Students Management Error:", error);

            studentsTableBody.replaceChildren();

            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 6;
            cell.textContent = "Unable to load students. Please try again.";
            cell.className = "text-center text-danger";

            row.appendChild(cell);
            studentsTableBody.appendChild(row);
        }
    }

    // Search students
    if (searchStudentBtn) {
        searchStudentBtn.addEventListener("click", function () {
            loadStudents(studentSearch ? studentSearch.value.trim() : "");
        });
    }

    // Search on Enter key
    if (studentSearch) {
        studentSearch.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                loadStudents(studentSearch.value.trim());
            }
        });
    }

    // Reset search
    if (resetStudentSearch) {
        resetStudentSearch.addEventListener("click", function () {
            if (studentSearch) {
                studentSearch.value = "";
            }

            loadStudents();
        });
    }

    // View and Delete student actions
    if (studentsTableBody) {
        studentsTableBody.addEventListener("click", async function (event) {
            const button = event.target.closest("button[data-action]");

            if (!button) return;

            const studentId = button.dataset.studentId;
            const action = button.dataset.action;

            // View student details
            if (action === "view") {
                try {
                    const response = await fetch(
                        `${API_URL}/admin/students/${studentId}`,
                        {
                            method: "GET",
                            headers: {
                                "Authorization": `Bearer ${token}`,
                                "Content-Type": "application/json"
                            }
                        }
                    );

                    if (!response.ok) {
                        throw new Error("Unable to fetch student details.");
                    }

                    const data = await response.json();
                    const student = data.student;

                    alert(
                        `Student Details\n\n` +
                        `ID: ${student.id}\n` +
                        `Name: ${student.name}\n` +
                        `Email: ${student.email}\n` +
                        `Course: ${student.course || "-"}\n` +
                        `Year: ${student.year || "-"}\n` +
                        `Percentage: ${student.percentage ?? "-"}\n` +
                        `Stream: ${student.stream || "-"}\n` +
                        `Skills: ${student.skills || "-"}\n` +
                        `Interest: ${student.interest || "-"}`
                    );

                } catch (error) {
                    console.error("Student Details Error:", error);
                    alert("Unable to display student details.");
                }
            }

            // Delete student
            if (action === "delete") {
                const confirmed = confirm(
                    `Are you sure you want to delete student ID ${studentId}?\n\n` +
                    `Related assessments and recommendations will also be deleted.`
                );

                if (!confirmed) return;

                try {
                    const response = await fetch(
                        `${API_URL}/admin/students/${studentId}`,
                        {
                            method: "DELETE",
                            headers: {
                                "Authorization": `Bearer ${token}`,
                                "Content-Type": "application/json"
                            }
                        }
                    );

                    if (!response.ok) {
                        throw new Error("Unable to delete student.");
                    }

                    alert("Student deleted successfully!");

                    loadStudents(studentSearch ? studentSearch.value.trim() : "");

                    // Refresh dashboard statistics and recent records
                    await loadDashboard();

                } catch (error) {
                    console.error("Delete Student Error:", error);
                    alert("Student could not be deleted.");
                }
            }
        });
    }
    

// =========================================
// ASSESSMENTS MANAGEMENT
// =========================================

const assessmentsTableBody = document.getElementById("assessmentsTableBody");

async function loadAssessments() {
    if (!assessmentsTableBody) return;

    assessmentsTableBody.replaceChildren();

    const loadingRow = document.createElement("tr");
    const loadingCell = document.createElement("td");
    loadingCell.colSpan = 6;
    loadingCell.textContent = "Loading assessments...";
    loadingCell.className = "text-center";
    loadingRow.appendChild(loadingCell);
    assessmentsTableBody.appendChild(loadingRow);

    try {
        const response = await fetch(`${API_URL}/admin/assessments`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (response.status === 401) {
            alert("Session expired. Please login again.");
            localStorage.removeItem("authToken");
            localStorage.removeItem("authUser");
            window.location.href = "index.html";
            return;
        }

        if (response.status === 403) {
            alert("Admin permission required.");
            window.location.href = "index.html";
            return;
        }

        if (!response.ok) {
            throw new Error("Failed to load assessments.");
        }

        const data = await response.json();
        const assessments = data.assessments || [];

        assessmentsTableBody.replaceChildren();

        if (assessments.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = 6;
            cell.textContent = "No assessments found.";
            cell.className = "text-center";
            row.appendChild(cell);
            assessmentsTableBody.appendChild(row);
            return;
        }

        assessments.forEach(assessment => {
            const row = document.createElement("tr");

            const values = [
                assessment.id,
                assessment.student_name,
                assessment.email,
                assessment.career,
                assessment.created_at
                    ? new Date(assessment.created_at).toLocaleDateString()
                    : "N/A"
            ];

            values.forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value ?? "N/A";
                row.appendChild(cell);
            });

            const actionCell = document.createElement("td");
            const viewButton = document.createElement("button");

            viewButton.textContent = "View Details";
            viewButton.className = "btn btn-sm btn-primary";
            viewButton.dataset.action = "view-assessment";
            viewButton.dataset.assessmentId = assessment.id;

            actionCell.appendChild(viewButton);
            row.appendChild(actionCell);

            assessmentsTableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Assessments error:", error);

        assessmentsTableBody.replaceChildren();

        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 6;
        cell.textContent = "Error loading assessments.";
        cell.className = "text-center text-danger";
        row.appendChild(cell);
        assessmentsTableBody.appendChild(row);
    }
}

// View Assessment Details
assessmentsTableBody?.addEventListener("click", async function (event) {
    const button = event.target.closest('[data-action="view-assessment"]');

    if (!button) return;

    const assessmentId = button.dataset.assessmentId;

    try {
        const response = await fetch(
            `${API_URL}/admin/assessments/${assessmentId}`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch assessment details.");
        }

        const data = await response.json();
        const assessment = data.assessment || data;

        const details = [
            `Assessment ID: ${assessment.id ?? "N/A"}`,
            `Student Name: ${assessment.student_name ?? "N/A"}`,
            `Email: ${assessment.email ?? "N/A"}`,
            `Interest: ${assessment.interest ?? "N/A"}`,
            `Activity: ${assessment.activity ?? "N/A"}`,
            `Technology: ${assessment.technology ?? "N/A"}`,
            `Skill: ${assessment.skill ?? "N/A"}`,
            `Career: ${assessment.career ?? "N/A"}`,
            `Problem: ${assessment.problem ?? "N/A"}`,
            `Created At: ${assessment.created_at ?? "N/A"}`
        ].join("\n");

        alert(details);

    } catch (error) {
        console.error("Assessment details error:", error);
        alert("Unable to load assessment details.");
    }
});
// =========================================
// RECOMMENDATIONS MANAGEMENT
// =========================================

const recommendationsTableBody = document.getElementById("recommendationsTableBody");

async function loadRecommendations() {
    if (!recommendationsTableBody) return;

    recommendationsTableBody.replaceChildren();

    const loadingRow = document.createElement("tr");
    const loadingCell = document.createElement("td");
    loadingCell.colSpan = 7;
    loadingCell.textContent = "Loading recommendations...";
    loadingCell.className = "text-center";
    loadingRow.appendChild(loadingCell);
    recommendationsTableBody.appendChild(loadingRow);

    try {
        const response = await fetch(`${API_URL}/admin/recommendations`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (response.status === 401) {
            alert("Session expired. Please login again.");
            localStorage.removeItem("authToken");
            localStorage.removeItem("authUser");
            window.location.href = "index.html";
            return;
        }

        if (response.status === 403) {
            alert("Admin permission required.");
            window.location.href = "index.html";
            return;
        }

        if (!response.ok) {
            throw new Error("Failed to load recommendations.");
        }

        const data = await response.json();
        const recommendations = data.recommendations || [];

        recommendationsTableBody.replaceChildren();

        if (recommendations.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = 7;
            cell.textContent = "No recommendations found.";
            cell.className = "text-center";
            row.appendChild(cell);
            recommendationsTableBody.appendChild(row);
            return;
        }

        recommendations.forEach(recommendation => {
            const row = document.createElement("tr");

            const values = [
                recommendation.id,
                recommendation.student_name,
                recommendation.email,
                recommendation.career,
                recommendation.match_score,
                recommendation.created_at
                    ? new Date(recommendation.created_at).toLocaleDateString()
                    : "N/A"
            ];

            values.forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value ?? "N/A";
                row.appendChild(cell);
            });

            const actionCell = document.createElement("td");
            const viewButton = document.createElement("button");

            viewButton.textContent = "View Details";
            viewButton.className = "btn btn-sm btn-primary";
            viewButton.dataset.action = "view-recommendation";
            viewButton.dataset.recommendationId = recommendation.id;

            actionCell.appendChild(viewButton);
            row.appendChild(actionCell);

            recommendationsTableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Recommendations error:", error);

        recommendationsTableBody.replaceChildren();

        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 7;
        cell.textContent = "Error loading recommendations.";
        cell.className = "text-center text-danger";
        row.appendChild(cell);
        recommendationsTableBody.appendChild(row);
    }
}

// View Recommendation Details
recommendationsTableBody?.addEventListener("click", async function (event) {
    const button = event.target.closest('[data-action="view-recommendation"]');

    if (!button) return;

    const recommendationId = button.dataset.recommendationId;

    try {
        const response = await fetch(
            `${API_URL}/admin/recommendations/${recommendationId}`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch recommendation details.");
        }

        const data = await response.json();
        const recommendation = data.recommendation || data;

        const details = [
            `Recommendation ID: ${recommendation.id ?? "N/A"}`,
            `Student Name: ${recommendation.student_name ?? "N/A"}`,
            `Email: ${recommendation.email ?? "N/A"}`,
            `Career: ${recommendation.career ?? "N/A"}`,
            `Match Score: ${recommendation.match_score ?? "N/A"}`,
            `Skills: ${recommendation.skills ?? "N/A"}`,
            `Description: ${recommendation.description ?? "N/A"}`,
            `Created At: ${recommendation.created_at ?? "N/A"}`
        ].join("\n");

        alert(details);

    } catch (error) {
        console.error("Recommendation details error:", error);
        alert("Unable to load recommendation details.");
    }
});

    
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

// Load dashboard and students
await loadDashboard();
await loadStudents();
await loadAssessments();
await loadRecommendations();
});
