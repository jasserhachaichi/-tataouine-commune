
$('#summernote').summernote({
    height: 800,
    fontSizes: ['8', '9', '10', '11', '12', '14', '18', '24', '36'],
    styleTags: [
        'p',
        {
            title: 'Blockquote',
            tag: 'blockquote',
            className: 'blockquote',
            value: 'blockquote'
        },
        'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
    ],
    toolbar: [
        ['style', ['style']],
        ['font', ['bold', 'underline', 'italic', 'strikethrough', 'superscript', 'subscript', 'clear']],
        ['fontname', ['fontname']],
        ['fontsize', ['fontsize']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['insert', ['ltr', 'rtl']],
        ['height', ['height']],
        ['table', ['table']],
        ['insert', ['link', 'picture', 'video', 'hr']],
        ['misc', ['emoji']],
        ['view', ['fullscreen', 'undo', 'redo', 'codeview', 'help']]
    ],
});


function showMessage(msg, duration, color) {
    Toastify({
        text: msg,
        close: true,
        duration: duration,
        gravity: "bottom",
        position: "right",
        backgroundColor: color,
    }).showToast()
}


$(document).ready(function () {
    $('#termForm').submit(function (e) {
        e.preventDefault(); // Prevent the default form submission
        $('#submit-button').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Posting Terms...');

        var summernoteHTML = $('#summernote').summernote('code');

        const formData = new FormData(this);
        formData.append('summernote', summernoteHTML);

        $.ajax({
            type: 'POST',
            url: '/updatetermsofuse/terms', // The URL to your Express route
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                setTimeout(function () {
                    $('#summernote').summernote('code', '');
                    showMessage(response.message, 3000, "#4fbe87");
                    $('#submit-button').prop('disabled', false).html('Post');
                }, 1000);
            },
            error: function (xhr, status, error) {
                if (xhr.responseJSON && xhr.responseJSON.errors) {
                    const errors = xhr.responseJSON.errors;
                    errors.forEach(function (errorMsg) {
                        showMessage(errorMsg, 5000, "#dc3545");
                    });
                } else {
                    showMessage("An unexpected error occurred.", 5000, "#dc3545");
                }
                $('#submit-button').prop('disabled', false).html('Post');
            }
        });
    });
});
