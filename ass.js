document
    .getElementById("assessmentForm")
    .addEventListener("submit", async function (event) {

        event.preventDefault();

        const interest = document.querySelector(
            'input[name="interest"]:checked'
        ).value;

        const activity = document.querySelector(
            'input[name="activity"]:checked'
        ).value;

        const technology = document.querySelector(
            'input[name="technology"]:checked'
        ).value;

        const skill = document.querySelector(
            'input[name="skill"]:checked'
        ).value;

        const career = document.querySelector(
            'input[name="career"]:checked'
        ).value;

        const problem = document.querySelector(
            'input[name="problem"]:checked'
        ).value;

        const studentId =
            localStorage.getItem("studentId");

        if (!studentId) {
            alert(
                "Student profile not found. Please fill the profile again."
            );

            window.location.href = "profile.html";
            return;
        }

        try {

            // --------------------------------
            // 1. Save Assessment
            // --------------------------------

            const assessmentData = {
                student_id: parseInt(studentId),
                interest: interest,
                activity: activity,
                technology: technology,
                skill: skill,
                career: career,
                problem: problem
            };

            const assessmentResponse = await fetch(
                "http://127.0.0.1:8000/assessments",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(
                        assessmentData
                    )
                }
            );

            if (!assessmentResponse.ok) {
                throw new Error(
                    "Assessment could not be saved."
                );
            }

            const assessmentResult =
                await assessmentResponse.json();

            console.log(
                "Assessment Saved:",
                assessmentResult
            );


            // --------------------------------
            // 2. Prepare Recommendation Values
            // --------------------------------

            let interestValue = interest;
            let careerValue = career;


            if (interest === "development") {
                interestValue = "web";
            }


            if (career === "frontend") {
                careerValue = "web";
            }
            else if (career === "data") {
                careerValue = "data";
            }
            else if (career === "uiux") {
                careerValue = "uiux";
            }
            else if (career === "cybersecurity") {
                careerValue = "cybersecurity";
            }


            // --------------------------------
            // 3. Send ALL 6 Answers to AI
            // --------------------------------

            const recommendationResponse =
                await fetch(
                    "http://127.0.0.1:8000/recommend",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({

                            interest: interestValue,

                            activity: activity,

                            technology: technology,

                            skill: skill,

                            career_area: careerValue,

                            problem: problem

                        })
                    }
                );


            if (!recommendationResponse.ok) {
                throw new Error(
                    "Recommendation server error."
                );
            }


            const data =
                await recommendationResponse.json();


            console.log(
                "AI Recommendation Result:",
                data
            );


            if (
                !data.recommendations ||
                data.recommendations.length === 0
            ) {
                throw new Error(
                    "No career recommendations received."
                );
            }


            // --------------------------------
            // 4. Save Recommendations to MySQL
            // --------------------------------

            for (
                const recommendation
                of data.recommendations
            ) {

                const recommendationData = {

                    student_id:
                        parseInt(studentId),

                    career:
                        recommendation.career,

                    match_score:
                        recommendation.match_score

                };


                console.log(
                    "Saving Recommendation:",
                    recommendationData
                );


                const saveResponse =
                    await fetch(
                        "http://127.0.0.1:8000/recommendations",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify(
                                recommendationData
                            )
                        }
                    );


                if (!saveResponse.ok) {
                    throw new Error(
                        "Recommendation could not be saved."
                    );
                }


                const savedRecommendation =
                    await saveResponse.json();


                console.log(
                    "Recommendation Saved:",
                    savedRecommendation
                );
            }


            // --------------------------------
            // 5. Save Results for Result Page
            // --------------------------------

            localStorage.setItem(
                "careerResults",
                JSON.stringify(
                    data.recommendations
                )
            );


            // --------------------------------
            // 6. Go to Result Page
            // --------------------------------

            window.location.href =
                "result.html";


        } catch (error) {

            console.error(
                "Connection Error:",
                error
            );


            alert(
                "Unable to save assessment or career recommendations."
            );

        }

    });