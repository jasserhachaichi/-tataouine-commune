

document.getElementById('companyInfoForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    // Disable the submit button and show loading text
    $('#submit-button').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...');

    const formData = new FormData(this);
    const requestData = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/addcompany', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (response.ok) {
            const data = await response.json();
            //$('.formy').trigger('reset');
            Toastify({
                text: data.message,
                duration: 3000,
                close: true,
                gravity: "bottom",
                position: "right",
                backgroundColor: "#198754",
            }).showToast();
            $('#companyInfoForm').trigger('reset');
        } else {
            const errorData = await response.json();
            errorData.errors.forEach(error => {
                Toastify({
                    text: error.msg,
                    duration: 5000,
                    close: true,
                    gravity: "bottom",
                    position: "right",
                    backgroundColor: "#dc3545",
                }).showToast(); // Log each error separately
            });
        }
    } catch (error) {
        Toastify({
            text: error,
            duration: 5000,
            close: true,
            gravity: "bottom",
            position: "right",
            backgroundColor: "#dc3545",
        }).showToast();
        console.error('An error occurred:', error);
    }

    $('#submit-button').prop('disabled', false).html('Sauvegarder');
});
