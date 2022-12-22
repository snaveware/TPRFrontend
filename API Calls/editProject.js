/**
 * Redirect to Home page if the user is not logged in
 */
if (!isLoggedIn()) {
    if (!isLoggedIn()) {
        /**
         * Redirect to login page
         */
        alert("Please Login First");
    }
}

(async function getTheProjectToEdit() {
    /**
     * Gets the current project stored in local storage
     */
    enableLoader();
    const currentProject = getCurrentProject();

    if (!currentProject) {
        alert("No Project Selected");
        history.back();
        return;
    }

    /**
     * Obtaining the URL stored lin local storage by the configuration file
     * getBaseURL is a function declared in the Utils file
     */
    let GET_PROJECT_URL = `${getBaseURL()}/user/projects/${currentProject}`;

    try {
        const response = await fetch(GET_PROJECT_URL, {
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
                    await getTheProjectToEdit();
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
            const project = await response.json();
            console.log("Current project--------", project);
            const projectTitleInput =
                document.getElementById("edit-project-title");
            const projectSummaryTextarea = document.getElementById(
                "edit-project-summary"
            );
            const projectDescriptionTextarea = document.getElementById(
                "edit-project-description"
            );
            const projectCategorySelection = document.getElementById(
                "edit-project-category"
            );
            const projectContactPhoneNumberInput = document.getElementById(
                "edit-project-contact-phonenumber"
            );
            const projectContactEmail = document.getElementById(
                "edit-project-contact-email"
            );
            const projectStatusSelection = document.getElementById(
                "edit-project-status"
            );
            const projectLinkInput =
                document.getElementById("edit-project-link");

            projectTitleInput.value = project.title;
            projectSummaryTextarea.value = project.summary;
            projectDescriptionTextarea.value = project.description;
            projectCategorySelection.value = project.category;
            projectContactEmail.value = project.contactEmail;
            projectContactPhoneNumberInput.value = project.contactPhoneNumber;
            projectStatusSelection.value = project.status;
            if (project.link) {
                projectLinkInput.value = project.link;
            }

            const existingAttachmentsArea = document.getElementById(
                "existing-attachments"
            );

            project.attachments.map((file) => {
                const filename = file.split("_").pop();
                if (file.endsWith(".pdf")) {
                    existingAttachmentsArea.innerHTML =
                        existingAttachmentsArea.innerHTML +
                        `
                    <div class="upload-preview-file" id="${file}">
                        <div class = "attachment-upper"> 
                            <img src="${
                                location.origin
                            }/images/pdf.png" alt="" />
                            <span title = "${filename}">${filename.substring(
                            0,
                            10
                        )}...</span>
                        </div>
                        <img src="${
                            location.origin
                        }/images/delete.png" alt="" class="delete-icon" onclick="addFileToRemove('${file}')" /> 
                    </div>
                
                    `;
                } else if (file.endsWith(".doc") || file.endsWith(".docx")) {
                    existingAttachmentsArea.innerHTML =
                        existingAttachmentsArea.innerHTML +
                        `
                    <div class="upload-preview-file" id="${file}">
                        <div class = "attachment-upper"> 
                            
                        <img height= "50" src="${
                            location.origin
                        }/images/word.png" alt="" />
                            
                            <span title = "${filename}">${filename.substring(
                            0,
                            10
                        )}...</span>
                        </div>

                        <img src="${
                            location.origin
                        }/images/delete.png" alt="" class="delete-icon" onclick="addFileToRemove('${file}')" />
                        
                    </div>
                
                    `;
                } else {
                    const url = `${BASE_URL}/file/${file}`;
                    existingAttachmentsArea.innerHTML =
                        existingAttachmentsArea.innerHTML +
                        `
                    <div class="upload-preview-file" id="${file}">
                        <div class = "attachment-upper"> 
                            <img src="${url}" alt="" />
                            <span title = "${filename}">${filename.substring(
                            0,
                            10
                        )}...</span>
                        </div>
                        
                        <img src="${
                            location.origin
                        }/images/delete.png" class="delete-icon" alt="" onclick="addFileToRemove('${file}')"/>
                        
                        
                    </div>
                    
                    `;
                }
            });
        }
        disableLoader();
    } catch (error) {
        console.error(error);
        alert("Project request Failed, Please Check Your network");
        disableLoader();
    }
})();

const editProjectForm = document.getElementById("edit-project-form");

editProjectForm.addEventListener("submit", (e) => {
    e.preventDefault();
    updateProject(getCurrentProject());
});

const attachmentsInput = document.getElementById("edit-project-attachments");

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
                
                <span title="${file.name}">${file.name.substring(
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

const filesToRemove = [];
function addFileToRemove(filename) {
    const confirmation = confirm("Are You Sure You Want to Delete This File?");
    if (!confirmation) {
        return;
    }

    if (filesToRemove.indexOf(filename) == -1) {
        filesToRemove.push(filename);
    }

    const element = document.getElementById(filename);
    element.remove();
    console.log(filesToRemove);
}
/**
 * API call to  update project
 */
async function updateProject(projectId) {
    enableLoader();
    const projectTitleInput = document.getElementById("edit-project-title");
    const projectSummaryTextarea = document.getElementById(
        "edit-project-summary"
    );
    const projectDescriptionTextarea = document.getElementById(
        "edit-project-description"
    );
    const projectCategorySelection = document.getElementById(
        "edit-project-category"
    );
    const projectContactPhoneNumberInput = document.getElementById(
        "edit-project-contact-phonenumber"
    );
    const projectContactEmail = document.getElementById(
        "edit-project-contact-email"
    );
    const projectStatusSelection = document.getElementById(
        "edit-project-status"
    );
    const projectLinkInput = document.getElementById("edit-project-link");

    /**
     * Obtaining user Data, which should be from update project form
     */
    const updates = {
        title: projectTitleInput.value,
        category: projectCategorySelection.value,
        contactPhoneNumber: projectContactPhoneNumberInput.value,
        contactEmail: projectContactEmail.value,
        status: projectStatusSelection.value,
        link: projectLinkInput.value,
        summary: projectSummaryTextarea.value,
        description: projectDescriptionTextarea.value,
        attachmentsToRemove: filesToRemove, // string array of names of the files to remove
    };

    const updatesData = new FormData();

    for (const file of attachmentsInput.files) {
        updatesData.append("attachmentsToAdd", file, file.name);
    }

    Object.keys(updates).map((item) => {
        updatesData.append(item, updates[item]);
    });

    /**
     * Obtaining the URL stored lin local storage by the configuration file
     * getBaseURL is a function declared in the Utils file
     */
    const UPDATE_PROJECT_URL = `${getBaseURL()}/projects/${projectId}`;

    const input = document.querySelector('input[type="file"]');
    const data = new FormData();

    for (const file of input.files) {
        data.append("attachmentsToAdd", file, file.name);
    }

    Object.keys(updates).map((item) => {
        data.append(item, updates[item]);
    });

    try {
        const response = await fetch(UPDATE_PROJECT_URL, {
            method: "PATCH", // *GET, POST, PUT, DELETE, etc.
            mode: "cors", // no-cors, *cors, same-origin
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            credentials: "same-origin", // include, *same-origin, omit
            headers: {
                // "Content-Type": "application/json",
                authorization: `Bearer ${getAccessToken()}`,
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            // redirect: 'follow', // manual, *follow, error
            // referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: updatesData, //JSON.stringify(updates), // body data type must match "Content-Type" header
        });

        console.log("response", response);

        if (!response.ok) {
            /**
             * Check if the response is 401, which means the token failed, and refresh the token, then try updating the project
             */
            if (response.status == 401) {
                const isRefreshed = await refreshAccessToken();

                if (isRefreshed) {
                    await updateProject();
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
            const updatedProject = await response.json();
            console.log("updated project--------", updatedProject);
            alert("Project Updated Successfully");
            location.reload();
        }
        disableLoader();
    } catch (error) {
        console.error(error);
        alert("Project update Failed, Please Check Your network");
        disableLoader();
    }
}
