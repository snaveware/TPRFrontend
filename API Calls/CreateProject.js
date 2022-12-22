/**
 * Redirect to Home page if the user is not logged in
 */
if (!isLoggedIn()) {
    location.replace(location.origin);
}

const createProjectForm = document.getElementById("create-project-form");

createProjectForm.addEventListener("submit", (e) => {
    e.preventDefault();
    createProject();
});

/**
 * API call function to  create project
 */
async function createProject() {
    enableLoader();
    const projectTitleInput = document.getElementById("create-project-title");
    const projectSummaryTextarea = document.getElementById(
        "create-project-summary"
    );
    const projectDescriptionTextarea = document.getElementById(
        "create-project-description"
    );
    const projectCategorySelection = document.getElementById(
        "create-project-category"
    );
    const projectContactPhoneNumberInput = document.getElementById(
        "create-project-contact-phonenumber"
    );
    const projectContactEmail = document.getElementById(
        "create-project-contact-email"
    );
    const projectStatusSelection = document.getElementById(
        "create-project-status"
    );
    const projectLinkInput = document.getElementById("create-project-link");

    /**
     * Obtaining user Data, which should be from create project form
     */
    const project = {
        title: projectTitleInput.value,
        category: projectCategorySelection.value,
        contactPhoneNumber: projectContactPhoneNumberInput.value,
        contactEmail: projectContactEmail.value,
        status: projectStatusSelection.value,
        link: projectLinkInput.value,
        summary: projectSummaryTextarea.value,
        description: projectDescriptionTextarea.value,
    };

    if (project.category.toLowerCase() == "category") {
        alert("Please Select a Category");
        disableLoader();
        return;
    }

    if (project.status.toLowerCase() == "status") {
        alert("Please Select a status");
        disableLoader();
        return;
    }

    /**
     * Obtaining the URL stored lin local storage by the configuration file
     * getBaseURL is a function declared in the Utils file
     */
    const CREATE_PROJECT_URL = `${getBaseURL()}/projects`;
    try {
        const response = await fetch(CREATE_PROJECT_URL, {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            mode: "cors", // no-cors, *cors, same-origin
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            credentials: "same-origin", // include, *same-origin, omit
            headers: {
                "Content-Type": "application/json",
                // "Content-Type": "multipart/form-data",
                authorization: `Bearer ${getAccessToken()}`,
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            // redirect: 'follow', // manual, *follow, error
            // referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(project), // body data type must match "Content-Type" header
        });

        console.log("response", response);

        if (!response.ok) {
            /**
             * Check if the response is 401, which means the token failed, and refresh the token, then retry getting projects
             */
            if (response.status == 401) {
                const isRefreshed = await refreshAccessToken();

                if (isRefreshed) {
                    await createProject();
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
            const createdProject = await response.json();
            console.log("created project--------", createdProject);
            await createProjectAttachments(createdProject._id);
            alert("Project Created Successfully");
            location.reload();
        }
        disableLoader();
    } catch (error) {
        console.error(error);
        alert("Project creation Failed, Please Check Your network");
        disableLoader();
    }
}

const attachmentsInput = document.getElementById("create-project-attachments");

function clickAttachmentsUpload() {
    attachmentsInput.click();
}

attachmentsInput.addEventListener("change", () => {
    const selectedElementsArea = document.getElementById(
        "selected-attachments"
    );

    const files = attachmentsInput.files;

    for (const file of attachmentsInput.files) {
        if (file.type.search(/image/i) != -1) {
            const url = URL.createObjectURL(file);
            selectedElementsArea.innerHTML =
                selectedElementsArea.innerHTML +
                `
            <div class="upload-preview-file">
             <img src="${url}" alt="" />
                
                <span  title="${file.name}">${file.name.substring(
                    0,
                    10
                )}...</span>
            </div>
            
            `;
        } else if (file.type.search(/pdf/i) != -1) {
            selectedElementsArea.innerHTML =
                selectedElementsArea.innerHTML +
                `
            <div class="upload-preview-file">
            <img src="${location.origin}/images/pdf.png" alt="" />
                
                <span  title="${file.name}">${file.name.substring(
                    0,
                    10
                )}...</span>
            </div>
        
            `;
        } else {
            selectedElementsArea.innerHTML =
                selectedElementsArea.innerHTML +
                `
            <div class="upload-preview-file">
            <img src="${location.origin}/images/word.png" alt="" />
                
                <span title="${file.name}">${file.name.substring(
                    0,
                    10
                )}...</span>
            </div>
        
            `;
        }
    }
});

async function createProjectAttachments(projectId) {
    enableLoader();
    const data = new FormData();

    for (const file of attachmentsInput.files) {
        data.append("attachments", file, file.name);
    }

    /**
     * Obtaining the URL stored lin local storage by the configuration file
     * getBaseURL is a function declared in the Utils file
     */
    const CREATE_PROJECT_ATTACHMENTS_URL = `${getBaseURL()}/projects/attachments/${projectId}`;
    try {
        const response = await fetch(CREATE_PROJECT_ATTACHMENTS_URL, {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            mode: "cors", // no-cors, *cors, same-origin
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            credentials: "same-origin", // include, *same-origin, omit
            headers: {
                // "Content-Type": "application/json",
                // "Content-Type": "multipart/form-data",
                authorization: `Bearer ${getAccessToken()}`,
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            // redirect: 'follow', // manual, *follow, error
            // referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: data, // body data type must match "Content-Type" header
        });

        console.log("response", response);

        if (!response.ok) {
            /**
             * Check if the response is 401, which means the token failed, and refresh the token, then retry getting projects
             */
            if (response.status == 401) {
                const isRefreshed = await refreshAccessToken();

                if (isRefreshed) {
                    await createProject();
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
            const createdProjectAttachments = await response.json();
            console.log(
                "created attachments --------",
                createdProjectAttachments
            );
        }
        disableLoader();
    } catch (error) {
        console.error(error);
        alert("Project creation Failed, Please Check Your network");
        disableLoader();
    }
}
