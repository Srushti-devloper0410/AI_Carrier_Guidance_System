document.addEventListener("DOMContentLoaded", function () {

    const savedResults = localStorage.getItem("careerResults");

    if (!savedResults) {
        alert("No career recommendation found.");
        window.location.href = "assessment.html";
        return;
    }

    const results = JSON.parse(savedResults);

    if (!results || results.length === 0) {
        alert("No career recommendation found.");
        window.location.href = "assessment.html";
        return;
    }

    const selectedCareer = results[0].career;

    // ================= ROADMAP DATA =================

    const roadmapData = {

        "Frontend Developer": [
            {
                category: "FOUNDATION",
                title: "HTML & CSS",
                description: "Learn the fundamentals of web pages, HTML structure, CSS styling and layouts.",
                skills: "HTML5 • CSS3 • Flexbox • Grid"
            },
            {
                category: "CORE SKILL",
                title: "JavaScript",
                description: "Learn JavaScript fundamentals and use them to create interactive web applications.",
                skills: "Variables • Functions • DOM • Events"
            },
            {
                category: "RESPONSIVE DESIGN",
                title: "Bootstrap & Responsive Web Design",
                description: "Learn how to build websites that work properly on desktop, tablet and mobile devices.",
                skills: "Bootstrap • Media Queries • Responsive Layout"
            },
            {
                category: "DEVELOPMENT TOOLS",
                title: "Git & GitHub",
                description: "Learn version control and maintain your projects using Git and GitHub.",
                skills: "Git • GitHub • Repositories • Version Control"
            },
            {
                category: "PROJECT PRACTICE",
                title: "Build Real Projects",
                description: "Create practical projects to apply your frontend development skills.",
                skills: "Portfolio • Web Apps • UI Projects"
            },
            {
                category: "CAREER PREPARATION",
                title: "Portfolio & Job Preparation",
                description: "Build a professional portfolio, improve your resume and prepare for frontend opportunities.",
                skills: "Portfolio • Resume • Interview Preparation"
            }
        ],


        "Data Analyst": [
            {
                category: "FOUNDATION",
                title: "Excel",
                description: "Learn spreadsheet fundamentals and use Excel for organizing and analyzing data.",
                skills: "Formulas • Functions • Sorting • Filtering"
            },
            {
                category: "DATABASE",
                title: "SQL",
                description: "Learn how to retrieve, filter and analyze data stored in databases.",
                skills: "SELECT • WHERE • JOIN • GROUP BY"
            },
            {
                category: "PROGRAMMING",
                title: "Python for Data Analysis",
                description: "Learn Python basics and use it for data processing and analysis.",
                skills: "Python • Pandas • NumPy • Data Cleaning"
            },
            {
                category: "STATISTICS",
                title: "Statistics",
                description: "Learn statistical concepts used to understand and interpret datasets.",
                skills: "Mean • Median • Variance • Probability"
            },
            {
                category: "DATA VISUALIZATION",
                title: "Data Visualization",
                description: "Learn how to present data using meaningful charts and visualizations.",
                skills: "Charts • Graphs • Dashboards • Visualization"
            },
            {
                category: "CAREER PREPARATION",
                title: "Projects & Portfolio",
                description: "Build data analysis projects and create a portfolio to demonstrate your skills.",
                skills: "Projects • Dashboard • Portfolio • Resume"
            }
        ],


        "UI/UX Designer": [
            {
                category: "FOUNDATION",
                title: "UI/UX Fundamentals",
                description: "Learn the basic principles of user interface and user experience design.",
                skills: "UI Principles • UX Principles • Design Thinking"
            },
            {
                category: "DESIGN TOOL",
                title: "Figma",
                description: "Learn Figma to create professional interface designs and prototypes.",
                skills: "Frames • Components • Auto Layout • Prototypes"
            },
            {
                category: "USER RESEARCH",
                title: "UX Research",
                description: "Learn how to understand user needs and use research to improve designs.",
                skills: "User Research • Personas • User Needs"
            },
            {
                category: "DESIGN PROCESS",
                title: "Wireframing & Prototyping",
                description: "Create wireframes and interactive prototypes for digital products.",
                skills: "Wireframes • Prototypes • User Flow"
            },
            {
                category: "PROJECT PRACTICE",
                title: "UI/UX Projects",
                description: "Create practical design projects to build your design portfolio.",
                skills: "Mobile UI • Web UI • Case Studies"
            },
            {
                category: "CAREER PREPARATION",
                title: "Design Portfolio",
                description: "Build a professional design portfolio and prepare for UI/UX opportunities.",
                skills: "Portfolio • Case Study • Presentation"
            }
        ],


        "Cybersecurity Analyst": [
            {
                category: "FOUNDATION",
                title: "Networking Fundamentals",
                description: "Learn the fundamentals of computer networks and how devices communicate.",
                skills: "IP Address • TCP/IP • DNS • Network Basics"
            },
            {
                category: "OPERATING SYSTEM",
                title: "Linux Fundamentals",
                description: "Learn Linux commands and operating system concepts used in cybersecurity.",
                skills: "Linux • Commands • File System • Permissions"
            },
            {
                category: "SECURITY",
                title: "Cybersecurity Fundamentals",
                description: "Learn the basic concepts of cybersecurity and common security threats.",
                skills: "CIA Triad • Threats • Vulnerabilities • Security"
            },
            {
                category: "SECURITY TOOLS",
                title: "Security Tools",
                description: "Learn about commonly used tools for security monitoring and analysis.",
                skills: "Security Tools • Monitoring • Logs • Analysis"
            },
            {
                category: "PRACTICE",
                title: "Security Projects",
                description: "Practice cybersecurity concepts through safe educational projects and labs.",
                skills: "Security Labs • Log Analysis • Threat Analysis"
            },
            {
                category: "CAREER PREPARATION",
                title: "Portfolio & Certification",
                description: "Build cybersecurity projects and prepare for entry-level opportunities.",
                skills: "Projects • Portfolio • Resume • Interview Preparation"
            }
        ]

    };


    // ================= UPDATE HERO =================

    const careerElement =
        document.getElementById("roadmapCareer");

    const descriptionElement =
        document.getElementById("roadmapDescription");


    if (careerElement) {
        careerElement.textContent = selectedCareer;
    }

    if (descriptionElement) {
        descriptionElement.textContent =
            "Follow these learning steps to develop the skills required for your " +
            selectedCareer +
            " career path.";
    }


    // ================= UPDATE ROADMAP =================

    const roadmapSteps =
        document.querySelectorAll(".roadmap-step");

    const selectedRoadmap =
        roadmapData[selectedCareer];


    if (selectedRoadmap) {

        selectedRoadmap.forEach(function (step, index) {

            const roadmapStep = roadmapSteps[index];

            if (!roadmapStep) {
                return;
            }

            const category =
                roadmapStep.querySelector(".roadmap-content span");

            const title =
                roadmapStep.querySelector(".roadmap-content h2");

            const description =
                roadmapStep.querySelector(".roadmap-content p");

            const skills =
                roadmapStep.querySelector(".roadmap-skills");


            if (category) {
                category.textContent = step.category;
            }

            if (title) {
                title.textContent = step.title;
            }

            if (description) {
                description.textContent = step.description;
            }

            if (skills) {
                skills.textContent = step.skills;
            }

        });

    }


    console.log("Recommended Career:", selectedCareer);
    console.log("Learning Roadmap:", selectedRoadmap);

});