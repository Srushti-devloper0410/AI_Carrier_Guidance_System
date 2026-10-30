
document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm");

    if (!loginForm) return;

    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const authMessage = document.getElementById("authMessage");
    const loginButton = loginForm.querySelector(".auth-button");

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        authMessage.className = "auth-message";
        authMessage.textContent = "";

        if (!email.value.trim() || !password.value) {
            authMessage.textContent = "Please enter email and password.";
            authMessage.classList.add("error");
            return;
        }

        loginButton.disabled = true;
        loginButton.textContent = "Signing in...";

        try {
            const response = await fetch(
                "https://ai-carrier-guidance-system.onrender.com/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email.value.trim(),
                        password: password.value
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    typeof result.detail === "string"
                        ? result.detail
                        : "Login failed. Please try again."
                );
            }

            // Save authentication information
            localStorage.setItem("authToken", result.access_token);
            localStorage.setItem("authUser", JSON.stringify(result.user));

            // Save basic profile information
            localStorage.setItem(
                "studentProfile",
                JSON.stringify({
                    name: result.user.name,
                    email: result.user.email
                })
            );

            authMessage.textContent = "Login successful! Redirecting...";
            authMessage.classList.add("success");

            loginForm.reset();

            setTimeout(function () {
                window.location.href = "home.html";
            }, 1000);

        } catch (error) {
            console.error("Login error:", error);

            authMessage.textContent =
                error.message === "Failed to fetch"
                    ? "Unable to connect to the server. Please try again."
                    : error.message;

            authMessage.classList.add("error");

        } finally {
            loginButton.disabled = false;
            loginButton.textContent = "Sign In";
        }
    });

});
