
$(document).ready(function () {
    $('#loginForm').submit(function (event) {
        event.preventDefault(); // Prevent the form from submitting normally
        $('#submit-button').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...');

        // Serialize form data
        var formData = $('#loginForm').serialize();

        // Send an AJAX request
        $.ajax({
            type: 'POST',
            url: '/login/verif', // Update the URL based on your server route
            data: formData,
            success: function (response) {
                // Handle success response
                //console.log(response);
                // Call the showAlert function with the message
                showAlert(response.message, 'alert-success', 'bi-check-circle');
                window.location.href = '/dashhome';
            },
            error: function (xhr, status, error) {
                // Handle error response
                var errors = xhr.responseJSON.errors;
                if (errors) {
                    // Display validation errors
                    //console.log(errors);
                    errors.forEach(function (errorItem) {
                        showAlert(errorItem.message, 'alert-danger', 'bi-file-excel');
                    });
                } else {
                    // Display general error message
                    var message = xhr.responseJSON.message || 'An error occurred';
                    showAlert(message, 'alert-danger', 'bi-file-excel');
                }
            },
            complete: function () {
                $('#submit-button').prop('disabled', false).html('Log in');
            }
        });
    });
});
