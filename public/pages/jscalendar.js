"use strict";

document.addEventListener('DOMContentLoaded', function () {
  // Fetch events from the server
  fetch("/events/allevents")
    .then(response => {
      // Check if the response is successful (status 200)
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      // Parse the JSON response
      return response.json();
    })
    .then(data => {
      // Class definition for the calendar app
      var KTAppCalendar = function () {
        // Shared variables
        var calendar;
        var viewModal, viewEventName, viewAllDay, viewEventDescription, viewEventLocation, viewStartDate, viewEndDate, viewOrganizers, viewSponsors;
        var eventData = {
          id: '',
          eventName: '',
          eventDescription: '',
          eventLocation: '',
          startDate: '',
          endDate: '',
          allDay: false,
          organizers: [],
          sponsors: []
        };

        // Initialize the calendar
        var initCalendarApp = function () {
          var calendarEl = document.getElementById('appCalendar');
          var todayDate = moment().startOf('day');
          var TODAY = todayDate.format('YYYY-MM-DD');

          // Initialize FullCalendar
          calendar = new FullCalendar.Calendar(calendarEl, {
            headerToolbar: {
              left: 'prev,next today',
              center: 'title',
              right: ''
            },
            initialDate: TODAY,
            navLinks: true, // can click day/week names to navigate views
            selectable: true,
            selectMirror: true,
            editable: false,
            dayMaxEvents: false, // allow "more" link when too many events
            events: data.events,
            eventClick: function (arg) {
              formatArgs({
                id: arg.event.id,
                title: arg.event.title,
                description: arg.event.extendedProps.description,
                location: arg.event.extendedProps.location,
                startStr: arg.event.startStr,
                endStr: arg.event.endStr,
                allDay: arg.event.allDay,
                organizers: arg.event.extendedProps.organizers,
                sponsors: arg.event.extendedProps.sponsors
              });
              handleViewEvent();
            }
          });
          calendar.render();
        };

        // Handle viewing event details
        const handleViewEvent = () => {
          if (viewModal) {
            viewModal.show();

            // Detect all day event
            var startDateMod = eventData.allDay
              ? moment(eventData.startDate).format('Do MMM, YYYY')
              : moment(eventData.startDate).format('Do MMM, YYYY - h:mm a');
            var endDateMod = eventData.endDate
              ? (eventData.allDay ? moment(eventData.endDate).format('Do MMM, YYYY') : moment(eventData.endDate).format('Do MMM, YYYY - h:mm a'))
              : '';

            // Populate view data
            viewEventName.innerText = eventData.eventName;
            viewEventDescription.innerText = eventData.eventDescription || '---';
            viewEventLocation.innerText = eventData.eventLocation || '---';
            viewStartDate.innerText = startDateMod;
            viewEndDate.innerText = endDateMod;
            viewOrganizers.innerText = eventData.organizers && eventData.organizers.length > 0 ? eventData.organizers.join(', ') : '---';
            viewSponsors.innerText = eventData.sponsors && eventData.sponsors.length > 0 ? eventData.sponsors.join(', ') : '---';

            document.querySelector('.modal-footer .eventDetails').setAttribute('href', '/events/' + eventData.id);
            const elementbtn = document.querySelector('.modal-footer .removeEvent');
            // Vérifier si l'élément existe
            if (elementbtn) {
              // Définir l'attribut si l'élément existe
              elementbtn.setAttribute('data-calendar-event-remove', eventData.id);
            }














          } else {
            console.error('viewModal is not initialized.');
          }

          return calendar;
        };

        // Format FullCalendar responses
        const formatArgs = (res) => {
          eventData.id = res.id;
          eventData.eventName = res.title;
          eventData.eventDescription = res.description;
          eventData.eventLocation = res.location;
          eventData.startDate = res.startStr;
          eventData.endDate = res.endStr;
          eventData.allDay = res.allDay;
          eventData.organizers = res.organizers || [];
          eventData.sponsors = res.sponsors || [];
        };

        // Return public functions
        return {
          init: function () {
            const viewElement = document.getElementById('kt_modal_view_event');
            if (viewElement) {
              viewModal = new bootstrap.Modal(viewElement);
              viewEventName = viewElement.querySelector('[data-kt-calendar="event_name"]');
              viewAllDay = viewElement.querySelector('[data-kt-calendar="all_day"]');
              viewEventDescription = viewElement.querySelector('[data-kt-calendar="event_description"]');
              viewEventLocation = viewElement.querySelector('[data-kt-calendar="event_location"]');
              viewStartDate = viewElement.querySelector('[data-kt-calendar="event_start_date"]');
              viewEndDate = viewElement.querySelector('[data-kt-calendar="event_end_date"]');
              viewOrganizers = viewElement.querySelector('[data-kt-calendar="event_organizers"]');
              viewSponsors = viewElement.querySelector('[data-kt-calendar="event_sponsors"]');

              initCalendarApp();
            } else {
              console.error('kt_modal_view_event element not found.');
            }
          },
          getCalendar: function () {
            return calendar;
          },
          getViewModal: function () {
            return viewModal;
          }
        };
      }();

      KTAppCalendar.init();

      const elementbtnaction = document.querySelector('.modal-footer .removeEvent');
      // Vérifier si l'élément existe
      if (elementbtnaction) {
        document.querySelector(".removeEvent").addEventListener("click", function () {
          var btn = this;
          var eventId = btn.getAttribute("data-calendar-event-remove");
  
          $.ajax({
            url: "/calendarmanagement/deleteevents/" + eventId,
            type: "DELETE",
            success: function (response) {
              // Remove the event from FullCalendar
              if (KTAppCalendar.getCalendar()) {
                KTAppCalendar.getCalendar().getEventById(eventId).remove();
                var modal = KTAppCalendar.getViewModal();
                if (modal) {
                  modal.hide(); // Hide modal
                } else {
                  console.error('viewModal is not initialized.');
                }
              } else {
                console.error('calendar is not initialized.');
              }
            },
            error: function (xhr, status, error) {
              console.error("Error deleting event:", error);
              // Handle error, if needed
            }
          });
        });
      }

      // Event listener for delete button






    })
    .catch(error => {
      // Handle errors
      console.error("Error fetching events:", error);
      // Display an error message to the user or handle the error appropriately
    });
});
