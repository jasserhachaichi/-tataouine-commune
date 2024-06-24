
var formDataggg = [{ "type": "header", "subtype": "h1", "label": "Coordinator of Waste Management and Sustainability Programs", "required": null, "description": null, "placeholder": null, "className": null, "name": null, "value": null, "maxlength": null, "rows": null, "min": null, "max": null, "step": null, "multiple": null, "toggle": null, "inline": null, "other": null, "requireValidOption": null, "style": null, "access": null, "_id": { "$oid": "6674c04de89caf319cca1c78" }, "values": [] }, { "type": "text", "subtype": "text", "label": "Nom", "required": false, "description": null, "placeholder": null, "className": "form-control", "name": "text-1718927399727-0", "value": null, "maxlength": null, "rows": null, "min": null, "max": null, "step": null, "multiple": null, "toggle": null, "inline": null, "other": null, "requireValidOption": null, "style": null, "access": null, "_id": { "$oid": "6674c04de89caf319cca1c79" }, "values": [] }, { "type": "textarea", "subtype": "textarea", "label": "Prenom", "required": false, "description": null, "placeholder": null, "className": "form-control", "name": "textarea-1718927401444-0", "value": null, "maxlength": null, "rows": null, "min": null, "max": null, "step": null, "multiple": null, "toggle": null, "inline": null, "other": null, "requireValidOption": null, "style": null, "access": null, "_id": { "$oid": "6674c04de89caf319cca1c7a" }, "values": [] }, { "type": "button", "subtype": "submit", "label": "Button", "required": null, "description": null, "placeholder": null, "className": "btn-primary btn", "name": "button-1718927422636-0", "value": null, "maxlength": null, "rows": null, "min": null, "max": null, "step": null, "multiple": null, "toggle": null, "inline": null, "other": null, "requireValidOption": null, "style": "primary", "access": null, "_id": { "$oid": "6674c04de89caf319cca1c7b" }, "values": [] }]

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
// Wait for the document to be fully loaded
$(document).ready(() => {
    const fbTemplate = $('#build-wrap');
    const formBuilder = fbTemplate.formBuilder({
        controlPosition: 'left',
        disabledActionButtons: ['data'],
        disabledAttrs: ["className", "name", "access"],
        onSave: function (evt, formData) {
            const loaderContainer = document.querySelector('.The-loader-container-form');
            loaderContainer.classList.remove('d-none');
            loaderContainer.classList.add('flex');
            const titleForm = $('#title-form').val();
            const target = $('#inputGroupSelect01').val();



            $.ajax({
                url: '/createassistance/saveFormData',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    title: titleForm,
                    target: target,
                    formData: formData
                }),
                success: function (response) {
                    formBuilder.actions.clearFields();
                    $('#title-form').val('');
                    showMessage(response.message, -1, "#4fbe87");
                    setTimeout(() => {
                        window.location.href = "/assistances";
                    }, 1000); // 3 second delay before redirect
                    //console.log('Form data saved successfully:', response);
                    // Handle success response here if needed
                },
                error: function (xhr, status, error) {
                    loaderContainer.classList.remove('flex');
                    loaderContainer.classList.add('d-none');
                    showMessage(error, -1, "#dc3545");
                    //console.error('Error saving form data:', error);
                    // Handle error response here if needed
                }
            });




        },
        controlOrder: [
            'header',
            'paragraph',
            'text',
            'textarea',
            'number',
            'select',
            'checkbox-group',
            'radio-group',
            'date',
            'file',
            'button'
        ],
        /* defaultFields: formDataggg, */



    });
});
