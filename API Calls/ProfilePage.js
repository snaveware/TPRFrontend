/**
 * Filter options for search, page, category etc.
 */
const filterOptions = {
    searchString: null,
    noOfProjectsPerPage: null,
    page: 1,
    category: null,
};

function setCurrentCategory(category) {
    if (!category || category.length <= 0 || category.toLowerCase() == "all") {
        filterOptions.category = null;
        getUserProjects();
        return;
    }
    filterOptions.category = category;
    getUserProjects();
}

const profileSearchInput = document.getElementById("profile-search-input");

function setSearchString() {
    const searchString = profileSearchInput.value;
    if (!searchString || searchString.length <= 0) {
        filterOptions.searchString = null;
        getUserProjects();
        return;
    }
    filterOptions.searchString = searchString;
    getUserProjects();
}

profileSearchInput.addEventListener("change", setSearchString);

function getProjectTemplate(project) {
    let profileImageURL = `${BASE_URL}/file/${project.owner.profileImageURL}`;

    if (!project.owner.profileImageURL) {
        profileImageURL = `${location.origin}/images/user.png`;
    }

    let likeImageURL = `${location.origin}/images/unliked.png`;

    if (project.isLikedByMe) {
        likeImageURL = `${location.origin}/images/liked.png`;
    }

    return `
    <div class="project" id="${project._id}">
    <a
        class="project-title"
        href="${location.origin}/singleProject.html"
        onclick="setCurrentProject('${project._id}')"
        >${project.title}</a>
    <div class="project-top">
        <p class="top-user">
            <img
                src="${profileImageURL}"
                class="profile-img-sm"
                alt="${getLoggedInUserFirstName()}"
            />
            <span>${project.owner.name}</span>
        </p>
        <p class="top-date">
            <img src="/images/calendar.png" alt="" />
            <span>${new Date(project.updatedAt).toLocaleString()}</span>
        </p>
    </div>

    <article class="project-body">${project.summary}</article>
    <div class="project-bottom">
        <div class="bottom-reactions" > 
            <a status= "${
                project.isLikedByMe ? "liked" : "unliked"
            }" id="project-${project._id}-like" onclick="likeOrUnlike('${
        project._id
    }')">
                <img src="${likeImageURL}" alt="" />
                <span>${project.noOfLikes}</span>
            </a>

            <a
                href="${location.origin}/singleProject.html#comments"
                onclick="setCurrentProject('${project._id}')"
                id="btnmain"
            >
                <img src="/images/comment.png" alt="" />
                <span>${project.noOfComments}</span>
            
            </a>
        </div>
        <div class="bottom-actions">
        
            <a href="${
                location.origin
            }/editProject.html" onclick="setCurrentProject('${
        project._id
    }')" id="btnmain">
                <img src="${location.origin}/images/edit-2.png" alt="" />
                <span>Edit</span>
            </a>
        
            <a id="btnmain" onclick="deleteAProject('${project._id}')">
                <img src="${location.origin}/images/delete.png" alt="" />
                <span>Delete</span>
            </a>
            
        </div>
        <span class="category">${project.category}</span>
    </div>

</div>`;
}

/**
 * API call to  GET projectS, It self-calls by default
 */
async function getUserProjects() {
    /**
     * Redirect to Home page if the user is not logged in
     */
    if (!isLoggedIn()) {
        /**
         * Redirect to login page
         */
        alert("Please Login First");

        location.replace(location.origin);
        return;
    }

    enableLoader();

    /**
     * Obtaining the URL stored lin local storage by the configuration file
     * getBaseURL is a function declared in the Utils file
     */
    let GET_PROJECTS_URL = `${getBaseURL()}/user/projects`;

    isNext = false;
    Object.keys(filterOptions).map((option) => {
        if (filterOptions[option]) {
            if (isNext) {
                GET_PROJECTS_URL = `${GET_PROJECTS_URL}&${option}=${filterOptions[option]}`;
                return;
            }
            GET_PROJECTS_URL = `${GET_PROJECTS_URL}?${option}=${filterOptions[option]}`;

            isNext = true;
        }
    });
    try {
        const response = await fetch(GET_PROJECTS_URL, {
            method: "GET", // *GET, POST, PUT, DELETE, etc.
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
                    await getUserProjects();
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
            const results = await response.json();
            console.log("user projects--------", results);
            const profileProjectsSection = document.querySelector(
                "#profile-projects-section"
            );

            profileProjectsSection.innerHTML = "";

            if (results.projects.length < 1) {
                profileProjectsSection.innerHTML = `

                <p class="empty"> oops! No Projects Available</p>
                `;

                disableLoader();
                return;
            }

            results.projects.map((project) => {
                const projectHtml = getProjectTemplate(project);
                profileProjectsSection.innerHTML =
                    profileProjectsSection.innerHTML + projectHtml;
            });
        }
        disableLoader();
    } catch (error) {
        console.error(error);
        alert("Your Projects request Failed, Please Check Your network");
        disableLoader();
    }
}

getUserProjects();

async function deleteAProject(projectId) {
    if (!isLoggedIn) {
        alert("You Must Be Logged In to Delete a Project");
        return;
    }

    const confirmation = confirm(
        "Are You Sure Your Want to Delete this Project?"
    );

    if (!confirmation) {
        return;
    }
    enableLoader();

    /**
     * Obtaining the URL stored lin local storage by the configuration file
     * getBaseURL is a function declared in the Utils file
     */
    const LIKE_URL = `${getBaseURL()}/projects/${projectId}`;
    try {
        const response = await fetch(LIKE_URL, {
            method: "Delete", // *GET, POST, PUT, DELETE, etc.
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
                    await deleteAProject();
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
            const deletion = await response.json();
            console.log("deletion response --------", deletion);
            const theProjectElement = document.getElementById(projectId);
            theProjectElement.remove();
        }
        disableLoader();
    } catch (error) {
        console.error(error);
        alert("Deletion Failed, Please Check Your network");
        disableLoader();
    }
}

const changeProfileImageBtn = document.getElementById("change-profile-btn");
const changeProfileImageInput = document.getElementById("change-profile-input");

changeProfileImageBtn.addEventListener("click", () => {
    changeProfileImageInput.click();
});

changeProfileImageInput.addEventListener("change", () => {
    updateProfileImage();
});
async function updateProfileImage(projectId) {
    enableLoader();
    const input = changeProfileImageInput;
    const data = new FormData();
    data.append("profileImage", input.files[0]);

    /**
     * Obtaining the URL stored lin local storage by the configuration file
     * getBaseURL is a function declared in the Utils file
     */
    const UPDATE_PROFILE_URL = `${getBaseURL()}/file/profile`;
    try {
        const response = await fetch(UPDATE_PROFILE_URL, {
            method: "PATCH", // *GET, POST, PUT, DELETE, etc.
            mode: "cors", // no-cors, *cors, same-origin
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            credentials: "same-origin", // include, *same-origin, omit
            headers: {
                // "Content-Type": "application/json",
                authorization: `Bearer ${getAccessToken()}`,
                // "Content-Type": "application/x-www-form-urlencoded",
                // "Content-Type": "multipart/form-data",
            },
            // redirect: 'follow', // manual, *follow, error
            // referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            // body: JSON.stringify(updates), // body data type must match "Content-Type" header
            body: data,
        });

        console.log("response", response);

        if (!response.ok) {
            /**
             * Check if the response is 401, which means the token failed, and refresh the token, then try updating the project
             */
            if (response.status == 401) {
                const isRefreshed = await refreshAccessToken();

                if (isRefreshed) {
                    await updateProfileImage();
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
            const results = await response.json();
            console.log("results--------", results);

            if (results.profileImageURL) {
                localStorage.setItem(
                    "PROFILE_IMAGE_URL",
                    `${BASE_URL}/file/${results.profileImageURL}`
                );
            }

            const profileImageContainer = document.getElementById(
                "authenticated-user-nav-profile"
            );

            const profilePageProfileImageContainer = document.getElementById(
                "profile-page-user-profile"
            );

            const profileImageURL = getProfileImageURL();

            profileImageContainer.innerHTML = `
                <img src="${profileImageURL}" class="profile-img-sm" alt="${getLoggedInUserFirstName()}">
                `;

            if (profilePageProfileImageContainer) {
                profilePageProfileImageContainer.innerHTML = `
                    <img src="${profileImageURL}" class="profile-img-lg" alt="${getLoggedInUserFirstName()}">
                    `;
            }
        }
        disableLoader();
    } catch (error) {
        console.error(error);
        alert("Profile update Failed, Please Check Your network");
        disableLoader();
    }
}
