function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function initWidgets() {
  fetch(assets.hoursJsonUrl).then(response => response.json()).then(data => {
    const now = new Date();
    const dayOfWeek = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday"
    ][now.getDay()];
    const currentTimeInMin = now.getHours() * 60 + now.getMinutes();

    for (let service in data) {
      for (let business of data[service]) {
        const todayHours = business.hours[dayOfWeek];

        let nextOpeningHours = null;
        let isOpen = false;
        let nextOpeningTime = 0;

        for (const timeSlot of todayHours) {
          const openingTime = timeSlot.open;
          const closingTime = timeSlot.close;

          const [openingHours, openingMinutes] = openingTime.split(':').map(Number);
          const openingTimeInMin = openingHours * 60 + openingMinutes;

          const [closingHours, closingMinutes] = closingTime.split(':').map(Number);
          const closingTimeInMin = closingHours * 60 + closingMinutes;

          if (currentTimeInMin <= closingTimeInMin) {
            nextOpeningHours = {
              open: openingTime,
              close: closingTime
            };

            isOpen = (currentTimeInMin >= openingTimeInMin) && (currentTimeInMin < closingTimeInMin);

            if (isOpen) {
              nextOpeningTime = closingTimeInMin - currentTimeInMin;
            } else {
              nextOpeningTime = openingTimeInMin - currentTimeInMin;
            }

            break;
          }
        }

        const nextOpeningHour = Math.floor(nextOpeningTime / 60);
        const nextOpeningMinute = nextOpeningTime % 60;
        const nextOpeningTimeString = `${nextOpeningHour > 0
          ? (nextOpeningHour + ' hr ')
          : ''
          }${nextOpeningMinute} min`;
        const text = (nextOpeningTime > 0)
          ? `${nextOpeningHours.open
          } - ${nextOpeningHours.close
          } (${isOpen
            ? 'Closes'
            : 'Opens'
          } in ${nextOpeningTimeString})`
          : 'Closed for the day';

        $(`#${slugify(service)
          }-hours`).append($('<div>').addClass(`time-slot p-2 mb-1 ${isOpen
            ? 'open'
            : 'close'
            }`).append($('<div>').addClass('indicator')).append($('<div>').addClass('info').append($('<h6>').text(business.name)).append($('<p>').text(text).prop('title', text))));
      }
    }
  });
}