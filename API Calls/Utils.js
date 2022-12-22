const loader = document.createElement("span");
loader.classList = "loader display-none";
loader.id = "loader";
document.body.appendChild(loader);

const loaderElement = document.getElementById("loader");

function toggleLoader() {
    loaderElement.classList.toggle("display-none");
}

function enableLoader() {
    loaderElement.classList.remove(["display-none"]);
}

function disableLoader() {
    loaderElement.classList.add(["display-none"]);
}

const guestAuthContainer = document.getElementById("nav-guest-container");
const authenticatedContainer = document.getElementById(
    "nav-authenticated-container"
);

if (isLoggedIn()) {
    const profileImageContainer = document.getElementById(
        "authenticated-user-nav-profile"
    );

    const profilePageProfileImageContainer = document.getElementById(
        "profile-page-user-profile"
    );

    const profileImageURL = getProfileImageURL();

    if (profileImageURL) {
        profileImageContainer.innerHTML = `
        <img src="${profileImageURL}" class="profile-img-sm" alt="${getLoggedInUserFirstName()}">
        `;

        if (profilePageProfileImageContainer) {
            profilePageProfileImageContainer.innerHTML = `
            <img src="${profileImageURL}" class="profile-img-lg" alt="${getLoggedInUserFirstName()}">
            `;
        }
    }

    const profilePageUserNameElement = document.getElementById(
        "profile-page-user-name"
    );

    if (profilePageUserNameElement) {
        profilePageUserNameElement.innerText = `${localStorage.getItem(
            "FIRST_NAME"
        )} ${localStorage.getItem("LAST_NAME")}`;
    }

    guestAuthContainer.style.display = "none";
    authenticatedContainer.style.display = "flex";
} else {
    guestAuthContainer.style.display = "flex";
    authenticatedContainer.style.display = "none";
}

authenticatedContainer.addEventListener("click", () => {
    console.log("toggle options");
    const authDropdownItems = document.getElementById("nav-dropdown-items");
    authDropdownItems.classList.toggle("display-none");
});

function logout() {
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("REFRESH_TOKEN");
    localStorage.removeItem("FIRST_NAME");
    localStorage.removeItem("LAST_NAME");
    localStorage.removeItem("ID");
    localStorage.removeItem("IS_LOGGED_IN");
    localStorage.removeItem("PROFILE_IMAGE_URL");
    location.reload();
}

function getBaseURL() {
    return localStorage.getItem("BASE_URL");
}

function getAccessToken() {
    return localStorage.getItem("ACCESS_TOKEN");
}
function getUserId() {
    return localStorage.getItem("ID");
}

function getLoggedInUserFirstName() {
    return localStorage.getItem("FIRST_NAME");
}

function getProfileImageURL() {
    return localStorage.getItem("PROFILE_IMAGE_URL");
}

function setCurrentProject(projectId) {
    localStorage.setItem("CURRENT_PROJECT", projectId);
}

function getCurrentProject() {
    return localStorage.getItem("CURRENT_PROJECT");
}

function isLoggedIn() {
    const IS_LOGGED_IN = localStorage.getItem("IS_LOGGED_IN");
    if (IS_LOGGED_IN && IS_LOGGED_IN.toLocaleLowerCase() == "yes") {
        return true;
    }

    return false;
}

async function refreshAccessToken() {
    try {
        const REFRESH_TOKEN = localStorage.getItem("REFRESH_TOKEN");

        if (!REFRESH_TOKEN) {
            /**
             * Not logged in refresh token, TODO: Redirect to login page
             */
            alert("Request Failed, Please Login Again");
            logout();
            localStorage.removeItem("IS_LOGGED_IN");
            localStorage.removeItem("ACCESS_TOKEN");
            localStorage.removeItem("REFRESH_TOKEN");
            return false;
        }

        const data = {
            refreshToken: REFRESH_TOKEN,
        };

        localStorage.removeItem("IS_LOGGED_IN");
        localStorage.removeItem("ACCESS_TOKEN");
        localStorage.removeItem("REFRESH_TOKEN");

        const REFRESH_URL = `${getBaseURL()}/auth/refreshtoken`;

        const response = await fetch(REFRESH_URL, {
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
            body: JSON.stringify(data), // body data type must match "Content-Type" header
        });

        console.log(response);

        if (!response.ok) {
            const error = await response.json();
            /**
             * Invalid refresh token, TODO: Redirect to login page
             */
            alert("Request Failed, Please Login Again");
            localStorage.removeItem("IS_LOGGED_IN");
            localStorage.removeItem("ACCESS_TOKEN");
            localStorage.removeItem("REFRESH_TOKEN");

            return false;
        } else {
            const tokens = await response.json(); // parses JSON response into native JavaScript objects

            /**
             * Storing the returned credentials to the local storage
             */
            localStorage.setItem("ACCESS_TOKEN", tokens.accessToken);
            localStorage.setItem("REFRESH_TOKEN", tokens.refreshToken);
            localStorage.setItem("IS_LOGGED_IN", "yes");
            console.log("Refreshed Tokens", data);
            return true;
        }
    } catch (error) {
        localStorage.removeItem("IS_LOGGED_IN");
        console.error(error);
        alert("Request Failed, Please Check Your network");
        return false;
    }
}

async function likeAProject(projectId) {
    if (!isLoggedIn) {
        alert("You Must Be Logged In to Like a Project");
        return;
    }
    enableLoader();
    /**
     * Obtaining the URL stored lin local storage by the configuration file
     * getBaseURL is a function declared in the Utils file
     */
    const LIKE_URL = `${getBaseURL()}/projects/likes/${projectId}`;
    try {
        const response = await fetch(LIKE_URL, {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            mode: "cors", // no-cors, *cors, same-origin
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            credentials: "same-origin", // include, *same-origin, omit
            headers: {
                "Content-Type": "application/json",
                authorization: `Bearer ${getAccessToken()}`,
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            // redirect: 'follow', // manual, *follow, error
            // referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        });

        console.log("response", response);

        if (!response.ok) {
            /**
             * Check if the response is 401, which means the token failed, and refresh the token, then retry getting projects
             */
            if (response.status == 401) {
                const isRefreshed = await refreshAccessToken();

                if (isRefreshed) {
                    await likeAProject();
                }

                disableLoader();
                return;
            }
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
            const newLikes = await response.json();
            console.log("new likes--------", newLikes);
            const likeBtn = document.getElementById(
                `project-${projectId}-like`
            );

            likeBtn.innerHTML = `
             <img src="${location.origin}/images/liked.png" alt="" />
             <span>${newLikes.noOfLikes}</span>
            `;

            likeBtn.setAttribute("status", "liked");
        }
        disableLoader();
    } catch (error) {
        console.error(error);
        alert("Like Failed, Please Check Your network");
    }
}

// likeAProject("6391fedc8f4368cb43a18b6e");

async function unlikeAProject(projectId) {
    if (!isLoggedIn) {
        alert("You Must Be Logged In to UnLike a Project");
        return;
    }
    enableLoader();
    /**
     * Obtaining the URL stored lin local storage by the configuration file
     * getBaseURL is a function declared in the Utils file
     */
    const UNLIKE_URL = `${getBaseURL()}/projects/likes/${projectId}`;
    try {
        const response = await fetch(UNLIKE_URL, {
            method: "DELETE", // *GET, POST, PUT, DELETE, etc.
            mode: "cors", // no-cors, *cors, same-origin
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            credentials: "same-origin", // include, *same-origin, omit
            headers: {
                "Content-Type": "application/json",
                authorization: `Bearer ${getAccessToken()}`,
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            // redirect: 'follow', // manual, *follow, error
            // referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        });

        console.log("response", response);

        if (!response.ok) {
            /**
             * Check if the response is 401, which means the token failed, and refresh the token, then retry getting projects
             */
            if (response.status == 401) {
                const isRefreshed = await refreshAccessToken();

                if (isRefreshed) {
                    await likeAProject();
                }

                disableLoader();
                return;
            }
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
            const newLikes = await response.json();
            console.log("new likes--------", newLikes);

            const likeBtn = document.getElementById(
                `project-${projectId}-like`
            );
            likeBtn.innerHTML = ` 
            <img src="${location.origin}/images/unliked.png" alt="" />
            <span>${newLikes.noOfLikes}</span>
            `;
            likeBtn.setAttribute("status", "unliked");
        }
        disableLoader();
    } catch (error) {
        console.error(error);
        alert("UnLike Failed, Please Check Your network");
    }
}

function likeOrUnlike(projectId) {
    const likeBtn = document.getElementById(`project-${projectId}-like`);

    const status = likeBtn.getAttribute("status");
    if (status == "liked") {
        unlikeAProject(projectId);
        return;
    }
    likeAProject(projectId);
}

// unlikeAProject("6391fedc8f4368cb43a18b6e");
