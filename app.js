const services = {
  hair: { label: "Haircut", duration: 30 },
  combo: { label: "Hair + Beard", duration: 60 },
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const hours = { start: 9 * 60, end: 19 * 60 };
const storageKey = "museum-bookings-v1";

const state = {
  viewMonth: null,
  service: "hair",
  selectedDate: null,
  selectedSlot: null,
};

const monthLabel = document.getElementById("monthLabel");
const calendarGrid = document.getElementById("calendar");
const weekdayRow = document.getElementById("calendarWeekdays");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");
const slotsContainer = document.getElementById("slotsContainer");
const confirmationEl = document.getElementById("confirmation");
const reservationList = document.getElementById("reservationList");
const yearEl = document.getElementById("year");

let bookingStore = loadBookings();

function init() {
  state.selectedDate = getToday();
  state.viewMonth = startOfMonth(state.selectedDate);
  yearEl.textContent = new Date().getFullYear();
  renderWeekdays();
  bindServiceButtons();
  bindMonthNavigation();
  renderCalendar();
  renderSlots();
  renderReservations();
}

function renderWeekdays() {
  if (!weekdayRow) {
    return;
  }
  weekdayRow.innerHTML = "";
  DAY_NAMES.forEach((day) => {
    const span = document.createElement("span");
    span.textContent = day;
    weekdayRow.appendChild(span);
  });
}

function bindServiceButtons() {
  const buttons = document.querySelectorAll(".option");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("is-active")) {
        return;
      }
      buttons.forEach((node) => node.classList.remove("is-active"));
      btn.classList.add("is-active");
      state.service = btn.dataset.service;
      state.selectedSlot = null;
      confirmationEl.textContent = "";
      confirmationEl.className = "confirmation";
      renderSlots();
    });
  });
}

function bindMonthNavigation() {
  prevMonthBtn.addEventListener("click", () => changeMonth(-1));
  nextMonthBtn.addEventListener("click", () => changeMonth(1));
}

function changeMonth(direction) {
  const next = startOfMonth(
    new Date(state.viewMonth.getFullYear(), state.viewMonth.getMonth() + direction, 1)
  );
  const minMonth = startOfMonth(getToday());
  if (next.getTime() < minMonth.getTime()) {
    return;
  }
  state.viewMonth = next;
  state.selectedSlot = null;
  confirmationEl.textContent = "";
  confirmationEl.className = "confirmation";
  renderCalendar();
  renderSlots();
}

function renderCalendar() {
  calendarGrid.innerHTML = "";
  const today = getToday();
  const viewYear = state.viewMonth.getFullYear();
  const viewMonthIndex = state.viewMonth.getMonth();
  const firstDayOfMonth = new Date(viewYear, viewMonthIndex, 1);
  const daysInMonth = new Date(viewYear, viewMonthIndex + 1, 0).getDate();
  const firstSelectable = getFirstSelectableDay(viewYear, viewMonthIndex);

  if (
    !state.selectedDate ||
    state.selectedDate.getMonth() !== viewMonthIndex ||
    state.selectedDate.getFullYear() !== viewYear
  ) {
    state.selectedDate = firstSelectable;
    state.selectedSlot = null;
  }

  monthLabel.textContent = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(state.viewMonth);

  const paddingDays = firstDayOfMonth.getDay();
  for (let i = 0; i < paddingDays; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "calendar__cell";
    calendarGrid.appendChild(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(viewYear, viewMonthIndex, day);
    const normalized = startOfDay(date);
    const button = document.createElement("button");
    button.type = "button";
    button.innerHTML = `<span class="calendar__date">${day}</span><span class="calendar__weekday">${DAY_NAMES[normalized.getDay()]}</span>`;

    if (normalized.getTime() < today.getTime()) {
      button.disabled = true;
    }

    if (state.selectedDate && isSameDay(normalized, state.selectedDate)) {
      button.classList.add("is-selected");
    }

    button.addEventListener("click", () => {
      if (button.disabled) {
        return;
      }
      state.selectedDate = normalized;
      state.selectedSlot = null;
      confirmationEl.textContent = "";
      confirmationEl.className = "confirmation";
      renderCalendar();
      renderSlots();
    });

    calendarGrid.appendChild(button);
  }

  prevMonthBtn.disabled = !canGoToPreviousMonth();
}

function canGoToPreviousMonth() {
  const currentMonth = startOfMonth(getToday());
  return state.viewMonth.getTime() > currentMonth.getTime();
}

function getFirstSelectableDay(year, monthIndex) {
  const today = getToday();
  if (year === today.getFullYear() && monthIndex === today.getMonth()) {
    return today;
  }
  return new Date(year, monthIndex, 1);
}

function renderSlots() {
  slotsContainer.innerHTML = "";
  if (!state.selectedDate) {
    slotsContainer.innerHTML =
      '<p class="muted">Select a day to view available seats.</p>';
    return;
  }

  const { duration } = services[state.service];
  const slots = generateSlots(duration, state.selectedDate);
  const dateKey = formatDateKey(state.selectedDate);
  const booked = bookingStore[dateKey] || {};

  if (!slots.length) {
    slotsContainer.innerHTML =
      '<p class="muted">No seats left for this day. Try another date.</p>';
    return;
  }

  slots.forEach((time) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "slot-btn";
    btn.textContent = time;
    const alreadyBooked = booked[time];

    if (alreadyBooked) {
      btn.classList.add("is-booked");
      btn.disabled = true;
      btn.title = "Reserved";
    }

    if (state.selectedSlot === time) {
      btn.classList.add("is-selected");
    }

    btn.addEventListener("click", () => {
      if (btn.disabled) {
        return;
      }
      state.selectedSlot = time;
      document
        .querySelectorAll(".slot-btn")
        .forEach((node) => node.classList.remove("is-selected"));
      btn.classList.add("is-selected");
      bookSlot(dateKey, time);
    });

    slotsContainer.appendChild(btn);
  });
}

function generateSlots(duration, date) {
  const slots = [];
  const now = new Date();
  const isToday = isSameDay(date, now);
  const minutesCutoff = isToday ? now.getHours() * 60 + now.getMinutes() : -1;

  for (
    let minutes = hours.start;
    minutes <= hours.end - duration;
    minutes += duration
  ) {
    if (isToday && minutes <= minutesCutoff) {
      continue;
    }
    slots.push(formatTime(minutes));
  }

  return slots;
}

function formatTime(minutes) {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function bookSlot(dateKey, time) {
  bookingStore[dateKey] = bookingStore[dateKey] || {};
  if (bookingStore[dateKey][time]) {
    confirmationEl.textContent =
      "That slot was just snapped up. Please choose another.";
    confirmationEl.className = "confirmation error";
    renderSlots();
    return;
  }

  bookingStore[dateKey][time] = state.service;
  saveBookings(bookingStore);
  state.selectedSlot = null;
  confirmationEl.textContent = `Booked ${services[state.service].label} on ${readableDate(
    state.selectedDate
  )} at ${time}`;
  confirmationEl.className = "confirmation success";
  renderSlots();
  renderReservations();
}

function readableDate(date) {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function renderReservations() {
  reservationList.innerHTML = "";
  const entries = [];
  Object.entries(bookingStore).forEach(([dateKey, times]) => {
    Object.entries(times).forEach(([time, service]) => {
      entries.push({ dateKey, time, service });
    });
  });
  entries.sort((a, b) => {
    if (a.dateKey === b.dateKey) {
      return a.time.localeCompare(b.time);
    }
    return a.dateKey.localeCompare(b.dateKey);
  });

  if (!entries.length) {
    reservationList.innerHTML = "<li>No reservations yet.</li>";
    return;
  }

  entries.slice(0, 5).forEach(({ dateKey, time, service }) => {
    const li = document.createElement("li");
    const date = new Date(dateKey);
    const serviceLabel = services[service]?.label || service;
    li.textContent = `${readableDate(date)} · ${time} · ${serviceLabel}`;
    reservationList.appendChild(li);
  });
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getToday() {
  return startOfDay(new Date());
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function loadBookings() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || {};
  } catch (err) {
    return {};
  }
}

function saveBookings(data) {
  localStorage.setItem(storageKey, JSON.stringify(data));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
