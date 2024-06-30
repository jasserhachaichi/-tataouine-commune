$(document).ready(function () {
    $('#loginForm').submit(function (event) {
        event.preventDefault(); // Prevent the form from submitting normally
        $('#submit-button').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...');

        // Serialize form data
        var formData = $('#loginForm').serialize();

        // Send an AJAX request
        $.ajax({
            type: 'POST',
            url: '/login/verif',
            data: formData,
            success: function (response) {
                // Handle success response
                showAlert(response.message, 'alert-success', 'bi-check-circle');
                window.location.href = '/dashhome';
            },
            error: function (xhr, status, error) {
                // Handle error response
                if (xhr.status === 429) {
                    var message =  "Too many login attempts from this IP, please try again after 15 minutes";
                    showAlert(message, 'alert-danger', 'bi-file-excel');
                } else {
                    var errorResponse = xhr.responseJSON;
                    if (errorResponse && errorResponse.errors) {
                        errorResponse.errors.forEach(function (errorItem) {
                            showAlert(errorItem.message, 'alert-danger', 'bi-file-excel');
                        });
                    } else {
                        var message = errorResponse && errorResponse.message ? errorResponse.message : 'An error occurred';
                        showAlert(message, 'alert-danger', 'bi-file-excel');
                    }
                }
            },
            complete: function () {
                $('#submit-button').prop('disabled', false).html('Se connecter');
            }
        });
    });
});