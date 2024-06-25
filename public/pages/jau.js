
// Assuming 'getuserinfo' function is defined elsewhere
document.querySelectorAll('.btn-outline-danger').forEach(button => {
    button.addEventListener('click', function() {
        getuserinfo(this);
    });
});
// Assuming 'getuserid' function is defined elsewhere
document.querySelectorAll('.btnforedit').forEach(button => {
    button.addEventListener('click', function() {
        // Extracting user ID from data attribute
        const userId = this.getAttribute('data-user-id');
        getuserid(userId);
    });
});




function getuserinfo(elm) {
    // Get the data attributes from the button
    const userId = elm.getAttribute('data-user-id');
    const userFirstName = elm.getAttribute('data-user-fname');
    document.getElementById("userfname").innerText = userFirstName;
    var charurl = "/users/delete/" + userId;
    console.log(charurl);
    document.getElementById("userurl").href = charurl;
}
function getuserid(elmid) {
    $('#editform').trigger('reset');
    document.querySelector("#editpopup #editform  #submit-button").setAttribute("userid", elmid);
}

$(document).ready(function () {
    $('#editform').submit(function (event) {
        event.preventDefault();
        const idu = $('#submit-button').attr("userid");

        $('#submit-button').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...');

        if ($(this).parsley().isValid()) {
            var formData = $(this).serialize();

            $.ajax({
                url: '/users/key/' + idu,
                type: 'POST',
                data: formData,
                success: function (response) {
                    Toastify({
                        text: response.message,
                        duration: 3000,
                        close: true,
                        gravity: "bottom",
                        position: "right",
                        backgroundColor: "#198754",
                    }).showToast();

                    $('#submit-button').prop('disabled', false).html('Modifier');
                    $('#editpopup').modal('hide');
                    $('#editform').trigger('reset');
                },
                error: function (xhr, status, error) {
                    if (xhr.status === 400) {
                        var errors = xhr.responseJSON.errors;
                        errors.forEach(function (error) {
                            Toastify({
                                text: error,
                                duration: 5000,
                                close: true,
                                gravity: "bottom",
                                position: "right",
                                backgroundColor: "#dc3545",
                            }).showToast();
                        });
                    } else {
                        Toastify({
                            text: error,
                            duration: 5000,
                            close: true,
                            gravity: "bottom",
                            position: "right",
                            backgroundColor: "#dc3545",
                        }).showToast();
                    }

                    $('#submit-button').prop('disabled', false).html('Modifier');
                }
            });
        } else {
            showAlert('User not updated successfully!', 'alert-danger', 'bi-file-excel');
            $('#submit-button').prop('disabled', false).html('Modifier');
        }
    });
});
