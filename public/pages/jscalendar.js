
const camelize = e => {
  const t = e.replace(/[-_\s.]+(.)?/g, ((e, t) => t ? t.toUpperCase() : ""));
  return `${t.substr(0, 1).toLowerCase()}${t.substr(1)}`
};
const getData = (e, t) => {
  try {
    return JSON.parse(e.dataset[camelize(t)])
  } catch (o) {
    return e.dataset[camelize(t)]
  }
};

const renderCalendar = (e, t) => {
  const {
    merge: r
  } = window._, a = r({
    initialView: "dayGridMonth",
    editable: false,
    direction: document.querySelector("html").getAttribute("dir"),
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay"
    },
    buttonText: {
      month: "Month",
      week: "Week",
      day: "Day"
    }
  }, t), n = new window.FullCalendar.Calendar(e, a);
  return n.render(), document.querySelector(".navbar-vertical-toggle")?.addEventListener("navbar.vertical.toggle", (() => n.updateSize())), n
};
const fullCalendarInit = () => {
  const {
    getData: e
  } = window.phoenix.utils;
  document.querySelectorAll("[data-calendar]").forEach((t => {
    const r = e(t, "calendar");
    renderCalendar(t, r);
  }));
};
const fullCalendar = {
  renderCalendar: renderCalendar,
  fullCalendarInit: fullCalendarInit
};


// Utilisation de la méthode fetch au lieu de $.ajax pour simplifier le traitement des réponses
fetch("/calendarmanagement/events")
  .then(response => {
    // Vérification si la réponse HTTP est réussie (code 200)
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    // Analyse de la réponse JSON
    return response.json();
  })
  .then(data => {
    const {
      dayjs: dayjs
    } = window, currentDay = dayjs && dayjs().format("DD"), currentMonth = dayjs && dayjs().format("MM"), prevMonth = dayjs && dayjs().subtract(1, "month").format("MM"), nextMonth = dayjs && dayjs().add(1, "month").format("MM"), currentYear = dayjs && dayjs().format("YYYY"), events = data.events.map(event => ({
      ...event,
      start: new Date(event.start), // Convert start to Date object
      end: event.end ? new Date(event.end) : null // Convert end to Date object if it exists
    }));

    // Function to convert ISO date to "YYYY-MM-DD hh:mm:ss" format
    function convertToFormattedDate(isoDate) {
      let date = new Date(isoDate);
      return date.toISOString(); // This will give you "YYYY-MM-DDTHH:mm:ss.sssZ"
    }




    // Output the converted events
    //console.log(events);
    const getTemplate = n => `\n<div class="modal-header ps-card border-bottom">\n  <div>\n    <h4 class="modal-title text-body-highlight mb-0">${n.title}</h4>\n ${n.extendedProps.organizers ? `<p class="mb-0 fs-9 mt-1">\n organized by <p>${n.extendedProps.organizers}</p>\n</p>` : ""}\n${n.extendedProps.sponsors ? `<p class="mb-0 fs-9 mt-1">\n Sponsored by <p>${n.extendedProps.sponsors}</p>\n</p>` : ""}\n</div>\n  <button type="button" class="btn p-1 fw-bolder" data-bs-dismiss="modal" aria-label="Close">\n    <span class='fas fa-times fs-8'></span>\n  </button>\n\n</div>\n\n<div class="modal-body px-card pb-card pt-1 fs-9">\n  ${n.extendedProps.description ? `\n      <div class="mt-3 border-bottom pb-3">\n        <h5 class='mb-0 text-body-secondary'>Description</h5>\n        <p class="mb-0 mt-2">\n          ${n.extendedProps.description.split(" ").slice(0, 30).join(" ")}\n        </p>\n      </div>\n    ` : ""} \n  <div class="mt-4 ${n.extendedProps.location ? "border-bottom pb-3" : ""}">\n    <h5 class='mb-0 text-body-secondary'>Date</h5>\n    <p class="mb-1 mt-2">\n    ${window.dayjs && window.dayjs(n.start).format("dddd, MMMM D, YYYY")} \n    ${n.end ? `– ${window.dayjs && window.dayjs(n.end).subtract(1, "day").format("dddd, MMMM D, YYYY")}` : ""}\n  </p>\n\n  </div>\n  ${n.extendedProps.location ? `\n        <div class="mt-4 ">\n          <h5 class='mb-0 text-body-secondary'>Location</h5>\n          <p class="mb-0 mt-2">${n.extendedProps.location}</p>\n        </div>\n      ` : ""}\n  ${n.schedules ? `\n      <div class="mt-3">\n        <h5 class='mb-0 text-body-secondary'>Schedule</h5>\n        <ul class="list-unstyled timeline mt-2 mb-0">\n          ${n.schedules.map((n => `<li>${n.title}</li>`)).join("")}\n        </ul>\n      </div>\n      ` : ""}\n  </div>\n</div>\n\n<div class="modal-footer d-flex justify-content-end px-card pt-0 border-top-0">\n  <button class="btn btn-danger btn-sm removeEven" data-calendar-event-remove="${n.extendedProps._id}" >\n    <i class="bi bi-trash3-fill"></i> Delete\n  </button>\n <a href="/events/${n.extendedProps._id}" class="btn btn-secondary btn-sm"> View Details </a> </div>\n`;
    //const getTemplate = n => ` <div class="modal-header ps-card border-bottom"> <div> <h4 class="modal-title text-body-highlight mb-0">${n.title}</h4> ${n.extendedProps.organizer ? `<p class="mb-0 fs-9 mt-1"> by <a href="#!">${n.extendedProps.organizer}</a> </p>` : ""} </div> <button type="button" class="btn p-1 fw-bolder" data-bs-dismiss="modal" aria-label="Close"> <span class='fas fa-times fs-8'></span> </button> </div> <div class="modal-body px-card pb-card pt-1 fs-9"> ${n.extendedProps.description ? ` <div class="mt-3 border-bottom pb-3"> <h5 class='mb-0 text-body-secondary'>Description</h5> <p class="mb-0 mt-2"> ${n.extendedProps.description.split(" ").slice(0, 30).join(" ")} </p> </div> ` : ""} <div class="mt-4 ${n.extendedProps.location ? "border-bottom pb-3" : ""}"> <h5 class='mb-0 text-body-secondary'>Date and Time</h5> <p class="mb-1 mt-2"> ${window.dayjs && window.dayjs(n.start).format("dddd, MMMM D, YYYY, h:mm A")} ${n.end ? `– ${window.dayjs && window.dayjs(n.end).subtract(1, "day").format("dddd, MMMM D, YYYY, h:mm A")}` : ""} </p> </div> ${n.extendedProps.location ? ` <div class="mt-4 "> <h5 class='mb-0 text-body-secondary'>Location</h5> <p class="mb-0 mt-2">${n.extendedProps.location}</p> </div> ` : ""} ${n.schedules ? ` <div class="mt-3"> <h5 class='mb-0 text-body-secondary'>Schedule</h5> <ul class="list-unstyled timeline mt-2 mb-0"> ${n.schedules.map((n => `<li>${n.title}</li>`)).join("")} </ul> </div> ` : ""} </div> <div class="modal-footer d-flex justify-content-end px-card pt-0 border-top-0"> <button class="btn btn-danger btn-sm removeEven" data-calendar-event-remove="${n.extendedProps._id}"> <i class="bi bi-trash3-fill"></i> Delete </button> ${n.extendedProps.url ? ` <a href="${n.extendedProps.url}" class="btn btn-danger btn-sm"> View Details </a> ` : ""} </div>`;
    const appCalendarInit = () => {
      const e = "#addEventForm",
        t = "#addEventModal",
        a = "#appCalendar",
        r = ".calendar-title",
        n = ".calendar-day",
        o = ".calendar-date",
        d = "[data-fc-view]",
        l = "data-event",
        c = "#eventDetailsModal",
        i = "#eventDetailsModal .modal-content",
        u = '#addEventModal [name="startDate"]',
        s = '[name="title"]',
        m = "shown.bs.modal",
        v = "submit",
        g = "event",
        y = "fc-view",
        p = events.reduce(((e, t) => t.schedules ? e.concat(t.schedules.concat(t)) : e.concat(t)), []);
      (() => {
        const e = new Date,
          t = e.toLocaleString("en-US", {
            month: "short"
          }),
          a = e.getDate(),
          r = e.getDay(),
          d = `${a}  ${t},  ${e.getFullYear()}`;
        document.querySelector(n) && (document.querySelector(n).textContent = (e => ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][e])(r)), document.querySelector(o) && (document.querySelector(o).textContent = d);
      })();
      const h = e => {
          const {
            currentViewType: t
          } = e;
          if ("timeGridWeek" === t) {
            const t = e.dateProfile.currentRange.start,
              a = t.toLocaleString("en-US", {
                month: "short"
              }),
              n = t.getDate(),
              o = e.dateProfile.currentRange.end,
              d = o.toLocaleString("en-US", {
                month: "short"
              }),
              l = o.getDate();
            document.querySelector(r).textContent = `${a} ${n} - ${d} ${l}`;
          } else document.querySelector(r).textContent = e.viewTitle;
        },
        w = document.querySelector(a),
        f = document.querySelector(e),
        D = document.querySelector(t),
        S = document.querySelector(c);
      if (w) {
        const e = fullCalendar.renderCalendar(w, {
          headerToolbar: !1,
          dayMaxEvents: 3,
          height: 800,
          stickyHeaderDates: !1,
          views: {
            week: {
              eventLimit: 3
            }
          },
          eventTimeFormat: {
            hour: "numeric",
            minute: "2-digit",
            omitZeroMinute: !0,
            meridiem: !0
          },
          events: p,
          eventClick: e => {
            e.jsEvent.preventDefault();
            const t = getTemplate(e.event);
            var elmdetail = document.querySelector(i);
            elmdetail.innerHTML = t;
            var modaldetail = new window.bootstrap.Modal(S);
            modaldetail.show();
            S.querySelector(".removeEven").addEventListener("click", function() {
              var btn = this;
              $.ajax({
                url: "/calendarmanagement/deleteevents/" + btn.getAttribute("data-calendar-event-remove"),
                type: "DELETE",
                success: function(response) {
                  e.event.remove();
                  modaldetail.hide();
                },
                error: function(xhr, status, error) {
                  console.error("Error deleting event:", error); // Log error message
                  // Handle error, if needed
                }
              });
            });

          },
          dateClick(e) {
            new window.bootstrap.Modal(D).show();
            document.querySelector(u)._flatpickr.setDate([e.dateStr]);
          }
        });
        h(e.currentData), document.addEventListener("click", (t => {
            if (t.target.hasAttribute(l) || t.target.parentNode.hasAttribute(l)) {
              const a = t.target.hasAttribute(l) ? t.target : t.target.parentNode;
              switch (getData(a, g)) {
                case "prev":
                  e.prev(), h(e.currentData);
                  break;
                case "next":
                  e.next(), h(e.currentData);
                  break;
                default:
                  e.today(), h(e.currentData);
              }
            }
            if (t.target.hasAttribute("data-fc-view")) {
              const a = t.target;
              e.changeView(getData(a, y)), h(e.currentData), document.querySelectorAll(d).forEach((e => {
                e === t.target ? e.classList.add("active-view") : e.classList.remove("active-view");
              }));
            }
          })),

          f && f.addEventListener(v, (t => {
            t.preventDefault();
            const {
              title: a,
              startDate: r,
              endDate: n,
              label: o,
              description: d,
              allDay: l,
              location: c,
              organizer: u
            } = t.target;
            e.addEvent({
              title: a.value,
              start: r.value,
              end: n.value ? n.value : null,
              allDay: l.checked,
              className: `text-${o.value}`,
              description: d.value,
              location: c.value,
              organizer: u.value
            }), t.target.reset(), window.bootstrap.Modal.getInstance(D).hide();
          })),
          D && D.addEventListener(m, (({
            currentTarget: e
          }) => {
            e.querySelector(s)?.focus();
          }));
      }
    };

    const {
      docReady: docReady
    } = window.phoenix.utils;
    docReady(appCalendarInit);
  })
  .catch(error => {
    // Gestion des erreurs
    console.error("Error fetching events:", error);
    // Afficher un message d'erreur à l'utilisateur ou gérer l'erreur de manière appropriée
  });
