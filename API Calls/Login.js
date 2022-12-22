if (isLoggedIn()) {
    location.replace(location.origin);
}

const form = document.querySelector("#login-form");

form.addEventListener("submit", (e) => {
    e.preventDefault();
    login();
});

/**
 * Making API Call
 */
async function login() {
    /**
     * Obtaining  information, which should be from login form
     */
    enableLoader();
    const phoneNumberInput = document.querySelector("#phone-number-input");
    const passwordInput = document.querySelector("#password-input");

    const credentials = {
        phoneNumber: phoneNumberInput.value,
        password: passwordInput.value,
    };

    /**
     * Obtaining Base url configured in all pages and adding the path
     * getBaseURL is a function declared in the utils
     */
    const LOGIN_URL = `${getBaseURL()}/auth/login`;

    try {
        const response = await fetch(LOGIN_URL, {
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
            body: JSON.stringify(credentials), // body data type must match "Content-Type" header
        });

        console.log(response);

        if (!response.ok) {
            const error = await response.json();
            alert(error);
        } else {
            const data = await response.json(); // parses JSON response into native JavaScript objects

            /**
             * Storing the returned credentials and other necessary information to the local storage, if login is successful
             */
            localStorage.setItem("ACCESS_TOKEN", data.tokens.accessToken);
            localStorage.setItem("REFRESH_TOKEN", data.tokens.refreshToken);
            localStorage.setItem("FIRST_NAME", data.userAccount.firstName);
            localStorage.setItem("LAST_NAME", data.userAccount.lastName);
            localStorage.setItem("ID", data.userAccount._id);
            localStorage.setItem("IS_LOGGED_IN", "yes");
            if (data.userAccount.profileImageURL) {
                localStorage.setItem(
                    "PROFILE_IMAGE_URL",
                    `${BASE_URL}/file/${data.userAccount.profileImageURL}`
                );
            }

            location.replace(location.origin);

            console.log("Returned Data", data);
        }
        disableLoader();
    } catch (error) {
        console.error(error);
        alert("Login Failed, Please Check Your network");
        disableLoader();
    }
}

/**
 * Call this the login function when the login form submits
 */
