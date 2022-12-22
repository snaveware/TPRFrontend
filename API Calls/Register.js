if (isLoggedIn()) {
    location.replace(location.origin);
}

const registerForm = document.querySelector("#register-form");

registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    register();
});

/**
 * API call to register user
 */
async function register() {
    /**
     * Obtaining user Data, which should be from the register form
     */
    enableLoader();
    const firstNameInput = document.querySelector("#register-firstname-input");
    const lastNameInput = document.querySelector("#register-lastname-input");
    const emailInput = document.querySelector("#register-email-input");
    const phoneNumberInput = document.querySelector(
        "#register-phonenumber-input"
    );
    const passwordInput = document.querySelector("#register-password-input");
    const passwordConfirmationInput = document.querySelector(
        "#register-password-confirmation-input"
    );
    const user = {
        firstName: firstNameInput.value,
        lastName: lastNameInput.value,
        phoneNumber: phoneNumberInput.value,
        email: emailInput.value,
        password: passwordInput.value,
        passwordConfirmation: passwordConfirmationInput.value,
    };

    /**
     * Obtaining the URL stored lin local storage by the configuration file
     * getBaseURL is a function declared in the Utils file
     */
    const REGISTER_URL = `${getBaseURL()}/auth/register`;

    try {
        const response = await fetch(REGISTER_URL, {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            mode: "cors", // no-cors, *cors, same-origin
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            credentials: "same-origin", // include, *same-origin, omit
            headers: {
                "Content-Type": "application/json",
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            // redirect: 'follow', // manual, *follow, error
            // referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(user), // body data type must match "Content-Type" header
        });

        console.log("response", response);

        if (!response.ok) {
            /**
             * TODO: Show the errors as red text in form
             * parses JSON response into native JavaScript objects
             *
             */
            const error = await response.json();
            alert(error);
        } else {
            /**
             * TODO: Change this with a redirection to the login page
             * parses JSON response into native JavaScript objects
             *
             */
            const registeredUser = await response.json();
            console.log("registered user--------", registeredUser);

            location.replace(`${location.origin}/login.html`);
        }
        disableLoader();
    } catch (error) {
        console.error(error);
        alert("Registration Failed, Please Check Your network");
        disableLoader();
    }
}
