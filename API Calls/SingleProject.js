/**
 * Setting up filter options
 */

/**
 * Get current project api call
 */
(async function getAProject() {
    /**
     * Gets the current project stored in local storage
     */
    enableLoader();
    const currentProject = getCurrentProject();

    if (!currentProject) {
        alert("No Project Selected");
        history.back();
        return;
        disableLoader();
    }
    /**
     * Obtaining the URL stored lin local storage by the configuration file
     * getBaseURL is a function declared in the Utils file
     */
    let GET_PROJECT_URL = `${getBaseURL()}/projects/${currentProject}`;

    try {
        const response = await fetch(GET_PROJECT_URL, {
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
                    await getAProject();
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

            const projectTitleElement = document.getElementById(
                "single-project-title"
            );
            const projectProfileElement = document.getElementById(
                "single-project-profile-image"
            );
            const projectOwnerElement = document.getElementById(
                "single-project-owner-name"
            );

            const projectDateElement = document.getElementById(
                "single-project-date"
            );

            const projectDescriptionElement = document.getElementById(
                "single-project-description"
            );

            const projectCategoryElement = document.getElementById(
                "single-project-category"
            );
            const projectContactPhoneNumberElement = document.getElementById(
                "single-project-contact-phonenumber"
            );
            const projectContactEmailElement = document.getElementById(
                "single-project-contact-email"
            );

            const projectLikeImage = document.getElementById(
                "single-project-like-image"
            );

            if (project.isLikedByMe) {
                projectLikeImage.setAttribute(
                    "src",
                    `${location.origin}/images/liked.png`
                );
            }

            const projectLikesCounterElement =
                document.getElementById("likes-counter");
            const projectCommentsCounterElement =
                document.getElementById("comments-counter");

            const moreInfoLinkElement =
                document.getElementById("more-info-link");

            projectTitleElement.innerText = project.title;
            projectOwnerElement.innerText = project.owner.name;
            projectDescriptionElement.innerText = project.description;
            projectCategoryElement.innerText = project.category;
            projectContactPhoneNumberElement.innerText =
                project.contactPhoneNumber;
            projectContactEmailElement.innerText = project.contactEmail;

            projectLikesCounterElement.innerText = project.noOfLikes;
            projectCommentsCounterElement.innerText = project.noOfComments;
            projectDateElement.innerText = new Date(
                project.updatedAt
            ).toLocaleString();

            if (project.owner.profileImageURL) {
                projectProfileElement.setAttribute(
                    "src",
                    `${BASE_URL}/file/${project.owner.profileImageURL}`
                );
            }

            if (project.link) {
                moreInfoLinkElement.setAttribute("href", project.link);
            }

            const likeBtn = document.getElementById("single-project-like-btn");

            likeBtn.setAttribute(
                "status",
                `${project.isLikedByMe ? "liked" : "unliked"}`
            );
            likeBtn.setAttribute("id", `project-${project._id}-like`);

            likeBtn.setAttribute("onclick", `likeOrUnlike('${project._id}')`);

            /**
             * attachments
             */

            const existingAttachmentsArea =
                document.getElementById("attachments-area");

            project.attachments.map((file) => {
                const filename = file.split("_").pop();

                if (file.endsWith(".pdf")) {
                    existingAttachmentsArea.innerHTML =
                        existingAttachmentsArea.innerHTML +
                        `
                    <a target="_blank" href=" ${BASE_URL}/file/${file}" class="upload-preview-file" id="${file}">
                        <div class = "attachment-upper"> 
                            <img src="${
                                location.origin
                            }/images/pdf.png" alt="" />
                            <span title ="${filename}">${filename.substring(
                            0,
                            10
                        )}...</span>
                        </div>
                        <img src="${
                            location.origin
                        }/images/download.png" alt="" class="delete-icon"  /> 
                    </a>
                
                    `;
                } else if (file.endsWith(".doc") || file.endsWith(".docx")) {
                    existingAttachmentsArea.innerHTML =
                        existingAttachmentsArea.innerHTML +
                        `
                    <a target="_blank" href=" ${BASE_URL}/file/${file}" class="upload-preview-file" id="${file}">
                        <div class = "attachment-upper"> 
                            
                            <img height= "50" src="${
                                location.origin
                            }/images/word.png" alt="" />
                                
                                <span title ="${filename}">${filename.substring(
                            0,
                            10
                        )}...</span>
                        </div>

                        <img src="${
                            location.origin
                        }/images/download.png" alt="" class="delete-icon"  />
                        
                    </a>
                
                    `;
                } else {
                    const url = `${BASE_URL}/file/${file}`;
                    existingAttachmentsArea.innerHTML =
                        existingAttachmentsArea.innerHTML +
                        `
                    <a target="_blank" href=" ${BASE_URL}/file/${file}" class="upload-preview-file" id="${file}">
                        <div class = "attachment-upper"> 
                            <img src="${url}" alt="" />
                            <span title = "${filename}">${filename.substring(
                            0,
                            10
                        )}...</span>
                        </div>
                        
                        <img src="${
                            location.origin
                        }/images/download.png" class="delete-icon" alt="" />
                        
                        
                    </a >
                    
                    `;
                }
            });
        }
        const contentSection = document.getElementById("single-project-page");
        contentSection.classList.toggle("display-none");
        disableLoader();
    } catch (error) {
        console.error(error);
        alert("Project request Failed, Please Check Your network");
        disableLoader();
    }
})();

const commentForm = document.getElementById("comment-form");
commentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    commentOnAProject();
});
/**
 * Comment on the current project
 */
async function commentOnAProject() {
    /**
     * Gets the current projectID stored in local storage
     */
    if (!isLoggedIn()) {
        /**
         * Redirect to login page
         */
        alert("You Must be Logged In to Comment");
        return;
    }
    const currentProject = getCurrentProject();

    if (!currentProject) {
        alert("No Project Selected");
        history.back();
        return;
    }

    const commentTextarea = document.getElementById("comment-message-textarea");

    /**
     * Comment Info
     */

    const comment = {
        message: commentTextarea.value,
    };

    if (!comment.message || comment.message.length < 1) {
        alert("Please Write Your comment");
        return;
    }

    /**
     * Obtaining the URL stored lin local storage by the configuration file
     * getBaseURL is a function declared in the Utils file
     */
    const ADD_COMMENT_URL = `${getBaseURL()}/comments/${currentProject}`;
    try {
        const response = await fetch(ADD_COMMENT_URL, {
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
            body: JSON.stringify(comment), // body data type must match "Content-Type" header
        });

        console.log("response", response);

        if (!response.ok) {
            /**
             * Check if the response is 401, which means the token failed, and refresh the token, then retry getting projects
             */
            if (response.status == 401) {
                const isRefreshed = await refreshAccessToken();

                if (isRefreshed) {
                    await commentOnAProject();
                }

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
             * parses JSON response into native JavaScript objects
             *
             */
            const addedComment = await response.json();
            console.log("added comment--------", addedComment);
            alert("comment added successfully");
            location.reload();
        }
    } catch (error) {
        console.error(error);
        alert("comment Creation Failed, Please Check Your network");
    }
}

function getCommentTemplate(comment) {
    let profileImageURL = `${BASE_URL}/file/${comment.commenter.profileImageURL}`;

    if (!comment.commenter.profileImageURL) {
        profileImageURL = `${location.origin}/images/user.png`;
    }

    return `
    <div class="comment">
    
        <div class="comment-top">
            <p class="top-user">
                <img
                    src="${profileImageURL}"
                    class="profile-img-sm"
                    alt="${getLoggedInUserFirstName()}"
                />
                <span>${comment.commenter.name}</span>
            </p>

            <p class="top-date">
                <img src="/images/calendar.png" alt="" />
                <span>${new Date(comment.createdAt).toLocaleString()}</span>
            </p>
        </div>
        <article class="comment-body">${comment.message}</article>
    </div>
   

</div>
    `;
}
/**
 * API Request to get comments
 * Self calls by default
 */
(async function getComments() {
    /**
     * Gets the current project stored in local storage
     */
    const currentProject = getCurrentProject();

    if (!currentProject) {
        alert("No Project Selected");
        history.back();
        return;
    }
    /**
     * Setting up filter options
     */
    const filterOptions = {
        noOfCommentsPerPage: null,
        page: 1,
    };

    /**
     * Obtaining the URL stored lin local storage by the configuration file
     * getBaseURL is a function declared in the Utils file
     */
    let GET_COMMENTS_URL = `${getBaseURL()}/comments/${currentProject}`;

    isNext = false;
    Object.keys(filterOptions).map((option) => {
        if (filterOptions[option]) {
            if (isNext) {
                GET_COMMENTS_URL = `${GET_COMMENTS_URL}&${option}=${filterOptions[option]}`;
                return;
            }
            GET_COMMENTS_URL = `${GET_COMMENTS_URL}?${option}=${filterOptions[option]}`;

            isNext = true;
        }
    });

    try {
        const response = await fetch(GET_COMMENTS_URL, {
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
                    await getComments();
                }

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
            const results = await response.json();
            console.log("comments--------", results);

            const commentsSection = document.getElementById(
                "single-project-comments-section"
            );

            commentsSection.innerHTML = "";
            results.comments.map((comment) => {
                const commentHtml = getCommentTemplate(comment);
                commentsSection.innerHTML =
                    commentsSection.innerHTML + commentHtml;
            });
        }
    } catch (error) {
        console.error(error);
        alert("comments request Failed, Please Check Your network");
    }
})();
