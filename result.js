document.addEventListener("DOMContentLoaded", function () {

    const savedResults = localStorage.getItem("careerResults");

    if (!savedResults) {
        alert("No career results found.");
        window.location.href = "assessment.html";
        return;
    }

    const results = JSON.parse(savedResults);

    if (!results || results.length === 0) {
        alert("No career recommendations available.");
        window.location.href = "assessment.html";
        return;
    }


    // ================= TOP CAREER =================

    const topResult = results[0];

    const topCareerTitle =
        document.querySelector(".main-result-card h2");

    const topMatchScore =
        document.querySelector(".main-result-card .match-info strong");

    const topProgress =
        document.querySelector(".main-result-card .progress-bar");

    const topCircle =
        document.querySelector(".main-result-card .match-circle span");


    if (topCareerTitle) {
        topCareerTitle.textContent = topResult.career;
    }

    if (topMatchScore) {
        topMatchScore.textContent =
            topResult.match_score + "%";
    }

    if (topProgress) {
        topProgress.style.width =
            topResult.match_score + "%";
    }

    if (topCircle) {
        topCircle.textContent =
            topResult.match_score + "%";
    }


    // ================= OTHER CAREERS =================

    const careerCards =
        document.querySelectorAll(".career-card");


    results.slice(1).forEach(function (result, index) {

        const card = careerCards[index];

        if (!card) {
            return;
        }

        const careerTitle =
            card.querySelector("h3");

        const careerScore =
            card.querySelector(".career-score strong");

        const progressBar =
            card.querySelector(".progress-bar");


        if (careerTitle) {
            careerTitle.textContent =
                result.career;
        }

        if (careerScore) {
            careerScore.textContent =
                result.match_score + "%";
        }

        if (progressBar) {
            progressBar.style.width =
                result.match_score + "%";
        }

    });


    // ================= DYNAMIC SKILL GAP =================

    const skillData = {

        "Frontend Developer": [
            ["HTML & CSS", "Strong"],
            ["JavaScript", "Improve"],
            ["Responsive Design", "Improve"],
            ["Git & GitHub", "Learn"],
            ["UI/UX Basics", "Learn"],
            ["JavaScript Projects", "Practice"]
        ],

        "Data Analyst": [
            ["Excel", "Improve"],
            ["SQL", "Learn"],
            ["Python", "Learn"],
            ["Statistics", "Improve"],
            ["Data Visualization", "Learn"],
            ["Power BI", "Learn"]
        ],

        "UI/UX Designer": [
            ["Figma", "Improve"],
            ["UI Design", "Learn"],
            ["UX Research", "Learn"],
            ["Wireframing", "Improve"],
            ["Prototyping", "Practice"],
            ["Design Principles", "Learn"]
        ],

        "Cybersecurity Analyst": [
            ["Networking", "Learn"],
            ["Linux", "Learn"],
            ["Cybersecurity Basics", "Improve"],
            ["Ethical Hacking", "Learn"],
            ["Security Tools", "Learn"],
            ["Threat Analysis", "Practice"]
        ]

    };


    const selectedCareer =
        topResult.career;

    const skills =
        skillData[selectedCareer];


    const skillCards =
        document.querySelectorAll(".skill-card");


    if (skills) {

        skills.forEach(function (skill, index) {

            if (!skillCards[index]) {
                return;
            }

            skillCards[index].innerHTML =
                skill[0] +
                " <span>" +
                skill[1] +
                "</span>";

        });

    }


    // Update Skill Gap heading text

    const skillDescription =
        document.querySelector(".skill-section .section-heading p");


    if (skillDescription) {

        skillDescription.textContent =
            "Based on your recommended career path, these skills can help you prepare for a " +
            selectedCareer +
            " role.";

    }


    console.log("Career Results:", results);
    console.log("Recommended Career:", selectedCareer);
    console.log("Skill Gap:", skills);

});