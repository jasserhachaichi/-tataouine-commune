



function resetpwd() {
  $.ajax({
    url: '/users/forgot-password/',
    type: 'POST',
    success: function (response) {
      Toastify({
        text: response.message,
        duration: 3000,
        close: true,
        gravity: "bottom",
        position: "right",
        backgroundColor: "#198754",
      }).showToast();
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
    }
  });
}

$(document).ready(function () {
  $('#myform').submit(function (event) {
    event.preventDefault();
    $('#myform #submit-button').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...');
    if ($(this).parsley().isValid()) {
      var formData = $(this).serialize();
      console.log(formData);
      $.ajax({
        url: '/users/updateadmin',
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
          // Convert the serialized string into an object for easier access to individual fields
          var formDataObject = {};
          formData.split('&').forEach(function (pair) {
            var [key, value] = pair.split('=');
            formDataObject[decodeURIComponent(key)] = decodeURIComponent(value);
          });
          if (formDataObject['email-id-column']) {
            $("#email").text(formDataObject['email-id-column']);
          }
          if (formDataObject['lname-column']) {
            $("#lname").text(formDataObject['lname-column']);
          }
          if (formDataObject['fname-column']) {
            $("#fname").text(formDataObject['fname-column']);
          }
          $('#myform  #submit-button').prop('disabled', false).html('Update');
          // Reset the form
          $('#myform').trigger('reset');
        },




        error: function (xhr, status, error) {
          console.error(error);
          Toastify({
            text: xhr.responseJSON.errors || 'An error occurred',
            duration: 5000,
            close: true,
            gravity: "bottom",
            position: "right",
            backgroundColor: "#dc3545",
          }).showToast();
          $('#submit-button').prop('disabled', false).html('Update');
        }




      });
    }
  });

  $('#reset-button').click(function () {
    $('#myform').trigger('reset');
  });
});

document.getElementById("fpwdbtn").addEventListener('click', function () {
  resetpwd();
});