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
    let previousActive;
    if (!filterOptions.category) {
        previousActive = document.getElementById("category-all");
    } else {
        previousActive = document.getElementById(
            `category-${filterOptions.category.toLowerCase()}`
        );
    }
    previousActive.classList.toggle("active-category");

    let currentActive = document.getElementById(
        `category-${category.toLowerCase()}`
    );

    currentActive.classList.toggle("active-category");

    if (!category || category.length <= 0 || category.toLowerCase() == "all") {
        filterOptions.category = null;
        getProjects();
        return;
    }
    filterOptions.category = category;
    getProjects();
}

const homeSearchInput = document.getElementById("home-search-input");
function setSearchString() {
    const searchString = homeSearchInput.value;
    if (!searchString || searchString.length <= 0) {
        filterOptions.searchString = null;
        getProjects();
        return;
    }
    filterOptions.searchString = searchString;
    getProjects();
}

homeSearchInput.addEventListener("change", setSearchString);

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
        <span class="category">${project.category}</span>
    </div>

</div>`;
}

function changePage(page) {
    if (page == filterOptions.page) {
        return;
    }

    const previousActive = document.getElementById(
        `page-number-${filterOptions.page}`
    );
    if (previousActive) {
        previousActive.classList.toggle("active-page-number");
    }
    filterOptions.page = page;

    const currentActive = document.getElementById(`page-number-${page}`);
    if (currentActive) {
        currentActive.classList.toggle("active-page-number");
    }

    const pageInputs = document.getElementsByClassName("page-input");
    console.log(pageInputs);
    for (const input of pageInputs) {
        input.value = page;
    }

    getProjects();
}

function setNoOfProjectsPerPage(value) {
    filterOptions.noOfProjectsPerPage = value;

    const projectsPerPageIndicators = document.getElementsByClassName(
        "projects-per-page-indicator"
    );

    for (const indicator of projectsPerPageIndicators) {
        indicator.value = value;
    }
}
/**
 * API call to  GET projects. It self calls by default.
 */
async function getProjects() {
    /**
     * Obtaining the URL stored lin local storage by the configuration file
     * getBaseURL is a function declared in the Utils file
     */
    enableLoader();
    let GET_PROJECTS_URL = `${getBaseURL()}/projects`;
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
                authorization: getAccessToken()
                    ? `Bearer ${getAccessToken()}`
                    : null,
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
                    await getProjects();
                }
                disableLoader();
                return;
            }
            /**
             * parses JSON response into native JavaScript objects
             *
             */
            const error = await response.json();
            alert(error);
        } else {
            /**
             * parses JSON response into native JavaScript objects
             *
             */
            const data = await response.json();
            console.log("data--------", data);

            const homeProjectsSection = document.querySelector(
                "#home-projects-section"
            );

            homeProjectsSection.innerHTML = "";
            if (data.projects.length < 1) {
                homeProjectsSection.innerHTML = `

                <p class="empty"> oops! No Projects Available</p>
                `;
                disableLoader();
                return;
            }

            data.projects.map((project) => {
                const projectHtml = getProjectTemplate(project);
                homeProjectsSection.innerHTML =
                    homeProjectsSection.innerHTML + projectHtml;
            });
        }

        disableLoader();
    } catch (error) {
        console.error(error);
        alert("Projects request Failed, Please Check Your network");
        disableLoader();
    }
}

getProjects();
