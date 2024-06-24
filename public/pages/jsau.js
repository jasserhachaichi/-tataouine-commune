$(document).ready(function() {
  // Intercept the form submission
  $('#myform').submit(function(event) {
    // Prevent the default form submission
    event.preventDefault();

    // Disable the submit button and show loading text
    $('#submit-button').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...');

    // Validate the form using Parsley
    if ($(this).parsley().isValid()) {
      // Serialize the form data
      var formData = $(this).serialize();

      // Send the AJAX request
      $.ajax({
        url: '/adduser/addNewuser', // Update the URL to your Express route
        type: 'POST',
        data: formData,
        success: function(response) {
          // Handle success response
          //console.log(response);

          // Re-enable the submit button after 1 second
          setTimeout(function() {
            // Call the showAlert function with the message
            if (typeof response === 'object') {
              // Handle success response
              //console.log(response);

              // Assuming response contains a message field
              showAlert(response.message, 'alert-success', 'bi-check-circle');
            }
            $('#submit-button').prop('disabled', false).html('Submit');
            // Reset the form
            $('#myform').trigger('reset');



          }, 1000);
        },
        error: function(xhr, status, error) {
          // Handle error
          console.error(error);
          // Check if the responseText is a valid JSON
          try {
            var errorMessages = JSON.parse(xhr.responseText);

            // If it's an array, iterate over each item and show the alert
            if (Array.isArray(errorMessages)) {
              errorMessages.forEach(function(errorItem) {
                showAlert(errorItem.message, 'alert-danger', 'bi-file-excel');
              });
            } else { // If not an array, just show the response as a single error message
              showAlert(errorMessages.message, 'alert-danger', 'bi-file-excel');
            }
          } catch (e) {
            // If parsing fails, show the raw response as an error message
            showAlert(xhr.responseText, 'alert-danger', 'bi-file-excel');
          }

          // Re-enable the submit button
          $('#submit-button').prop('disabled', false).html('Submit');
          // You can display an error message to the user here
        }
      });
    } else {
      // Form validation failed
      //console.log('Form validation failed');
      showAlert('User not created successfully!', 'alert-danger', 'bi-file-excel');
      // Re-enable the submit button
      $('#submit-button').prop('disabled', false).html('Submit');
      // You can optionally display an error message to the user
    }
  });

  // Reset form on click of reset button
  $('#reset-button').click(function() {
    // Reset the form
    $('#myform').trigger('reset');
  });
});
