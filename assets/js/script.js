// Store api key and url as constants
const API_KEY = "6vI-NEGERKr0Wv3ddq4NY4HI2Zs";
const API_URL = "https://ci-jshint.herokuapp.com/api";

// Initialise the Bootstrap modal used to display results
const resultsModal = new bootstrap.Modal(document.getElementById("resultsModal"));

// Add event listeners to the buttons on the page
document.getElementById("status").addEventListener("click", e => getStatus(e));
document.getElementById("submit").addEventListener("click", e => postForm(e));

/**
 * Processes form options into a comma separated string.
 * @param {FormData} form - The form data containing options.
 * @returns {FormData} The modified form data with processed options.
 */
function processOptions(form) {
    let optArray = [];

    for (let entry of form.entries()) {
        if (entry[0] === "options") {
            optArray.push(entry[1]);
        }
    }
    form.delete("options");

    form.append("options", optArray.join());

    return form;
}

/**
 * Handles form submission: sends POST request to API and processes response.
 * @param {Event} e - The event object from the submit action.
 * @returns {Promise<void>}
 */
async function postForm(e) {
    const form = processOptions(new FormData(document.getElementById("checksform")));

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Authorization": API_KEY,
        },
        body: form, 
    });

    const data = await response.json();

    if (response.ok) {
        displayErrors(data);
    } else {
        displayException(data);

        throw new Error(data.error);
    }
}

/**
 * Displays linting results in modal.
 * @param {Object} data - The data returned from the API.
 */
function displayErrors(data) {
    let heading = `JSHint Results for ${data.file}`;

    if (data.total_errors === 0) {
        results = `<div class="no_errors">No errors reported!</div>`
    } else {
        results = `<div>Total Errors: <span class"error_count>${data.total_errors}</span></div>`

        for (let error of data.error_list) {
            results += `<div>At line <span class="line">${error.line}</span>, `;
            results += `column <span class="column">${error.column}</span></div>`;
            results += `<div class="error">${error.error}</div>`;
        }
    }

    document.getElementById("resultsModalTitle").innerText = heading;
    document.getElementById("results-content").innerHTML = results;
    resultsModal.show();
}

/**
 * Checks API key status with GET request.
 * @param {Event} e - The event object from the click action.
 * @returns {Promise<void>}
 */
async function getStatus(e) {
    const queryString = `${API_URL}?api_key=${API_KEY}`;

    const response = await fetch(queryString);

    const data = await response.json();

    if (response.ok) {
        displayStatus(data);
    }
    else {
        displayException(data);
        throw new Error(data.error);
    }
}

/**
 * Displays API key status information.
 * @param {Object} data - The data returned from the API.
 */
function displayStatus(data) {
    let headingText = "API Key Status";
    let bodyText = `Your key is valid until 
    ${data.expiry}`;


    document.getElementById("resultsModalTitle").innerText = headingText;
    document.getElementById("results-content").innerText = bodyText;

    resultsModal.show();
}

/**
 * Displays exception details returned from API.
 * @param {Object} data - The error data returned from the API.
 */
function displayException(data) {
    resultsModal.show();

    let heading = "An Exception Occurred";
    let body = `<div>The API returned status code ${data.status_code}</div>`;
    body += `<div>Error number: <strong>${data.error_no}</strong>`;
    body += `<div>Error text: <strong>${data.error}</strong></div>`;

    document.getElementById("resultsModalTitle").innerText = heading;
    document.getElementById("results-content").innerHTML = body;
}