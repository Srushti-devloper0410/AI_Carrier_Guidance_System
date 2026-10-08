document.addEventListener("DOMContentLoaded", function () {

    // --------------------------------
    // Load Saved Profile Data
    // --------------------------------

    const savedProfile =
        localStorage.getItem("studentProfile");

    const savedStudentId =
        localStorage.getItem("studentId");


    if (savedProfile) {

        const profile =
            JSON.parse(savedProfile);

        document.getElementById("studentName").value =
            profile.name || "";

        document.getElementById("email").value =
            profile.email || "";

        document.getElementById("course").value =
            profile.course || "";

        document.getElementById("year").value =
            profile.year || "";

        document.getElementById("percentage").value =
            profile.percentage || "";

        document.getElementById("stream").value =
            profile.stream || "";

        document.getElementById("skills").value =
            profile.skills || "";

        document.getElementById("interest").value =
            profile.interest || "";
    }


    // --------------------------------
    // Profile Form Submit
    // --------------------------------

    document
        .getElementById("profileForm")
        .addEventListener("submit", async function (event) {

            event.preventDefault();


            // Get Form Values
            const studentName =
                document.getElementById("studentName").value;

            const email =
                document.getElementById("email").value;

            const course =
                document.getElementById("course").value;

            const year =
                document.getElementById("year").value;

            const percentage =
                document.getElementById("percentage").value;

            const stream =
                document.getElementById("stream").value;

            const skills =
                document.getElementById("skills").value;

            const interest =
                document.getElementById("interest").value;


            // Prepare Profile Data
            const profileData = {

                name: studentName,

                email: email,

                course: course,

                year: year,

                percentage: parseFloat(percentage),

                stream: stream,

                skills: skills,

                interest: interest
            };


            try {

                let response;


                // --------------------------------
                // Existing Student → UPDATE
                // --------------------------------

                if (savedStudentId) {

                    response = await fetch(
                        "http://127.0.0.1:8000/students/" +
                        savedStudentId,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify(
                                profileData
                            )
                        }
                    );

                }

                // --------------------------------
                // New Student → CREATE
                // --------------------------------

                else {

                    response = await fetch(
                        "http://127.0.0.1:8000/students",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify(
                                profileData
                            )
                        }
                    );
                }


                // Check Server Response
                if (!response.ok) {

                    throw new Error(
                        "Server error"
                    );
                }


                const data =
                    await response.json();


                console.log(
                    "Profile Saved:",
                    data
                );


                // --------------------------------
                // Save Updated Profile Locally
                // --------------------------------

                localStorage.setItem(
                    "studentProfile",
                    JSON.stringify(
                        profileData
                    )
                );


                // --------------------------------
                // Save Student ID
                // --------------------------------

                if (savedStudentId) {

                    localStorage.setItem(
                        "studentId",
                        savedStudentId
                    );

                } else {

                    localStorage.setItem(
                        "studentId",
                        data.student_id
                    );
                }


                // --------------------------------
                // Success Message
                // --------------------------------

                if (savedStudentId) {

                    alert(
                        "Profile updated successfully!"
                    );

                } else {

                    alert(
                        "Profile created successfully!"
                    );
                }


                // --------------------------------
                // Go to Assessment
                // --------------------------------

                window.location.href =
                    "index.html";


            } catch (error) {

                console.error(
                    "Connection Error:",
                    error
                );


                alert(
                    "Unable to save profile. Please make sure the AI Career Guidance Server is running."
                );

            }

        });

});