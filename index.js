
document.addEventListener("DOMContentLoaded", function () {

    // --------------------------------
    // Show Student Name
    // --------------------------------

    const savedProfile = localStorage.getItem("studentProfile");

    if (savedProfile) {
        try {
            const profile = JSON.parse(savedProfile);
            const navStudentName = document.getElementById("navStudentName");

            if (navStudentName && profile.name) {
                navStudentName.textContent = profile.name;
            }
        } catch (error) {
            console.error("Unable to read student profile:", error);
        }
    }


    // --------------------------------
    // Signup API
    // --------------------------------

    const signupForm = document.getElementById("signupForm");

    if (signupForm) {
        const password = document.getElementById("password");
        const confirmPassword = document.getElementById("confirmPassword");
        const authMessage = document.getElementById("authMessage");
        const signupButton = signupForm.querySelector(".auth-button");

        signupForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            authMessage.className = "auth-message";
            authMessage.textContent = "";

            if (password.value !== confirmPassword.value) {
                authMessage.textContent = "Passwords do not match.";
                authMessage.classList.add("error");
                confirmPassword.focus();
                return;
            }

            if (password.value.length < 8) {
                authMessage.textContent =
                    "Password must contain at least 8 characters.";
                authMessage.classList.add("error");
                password.focus();
                return;
            }

            signupButton.disabled = true;
            signupButton.textContent = "Creating account...";

            try {
                const response = await fetch(
                    "https://ai-carrier-guidance-system.onrender.com/auth/signup",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            name: document.getElementById("name").value.trim(),
                            email: document.getElementById("email").value.trim(),
                            password: password.value
                        })
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        typeof result.detail === "string"
                            ? result.detail
                            : "Signup failed. Please try again."
                    );
                }

                authMessage.textContent =
                    "Account created successfully! Redirecting to Sign In...";
                authMessage.classList.add("success");

                signupForm.reset();

                setTimeout(function () {
                    window.location.href = "login.html";
                }, 1200);

            } catch (error) {
                console.error("Signup error:", error);

                authMessage.textContent =
                    error.message === "Failed to fetch"
                        ? "Unable to connect to the server. Please try again."
                        : error.message;

                authMessage.classList.add("error");

            } finally {
                signupButton.disabled = false;
                signupButton.textContent = "Create Account";
            }
        });
    }


    // --------------------------------
    // Logout
    // --------------------------------

    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (event) {
            event.preventDefault();

            const confirmLogout = confirm("Are you sure you want to logout?");

            if (!confirmLogout) {
                return;
            }

            // Clear current student session data
            localStorage.removeItem("studentProfile");
            localStorage.removeItem("studentId");
            localStorage.removeItem("careerResults");

            // Redirect to Sign Up page
            window.location.href = "login.html";
        });
    }

});
