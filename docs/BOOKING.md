# Tutoring bookings: setup

Bookings run through **Calendly**, embedded on `book.html`. Calendly does the
parts a static site can't do safely:

- shows your real availability from your calendar and prevents double bookings
- lets the family pick a session length, date and time
- collects the student and parent details
- takes payment through **Stripe**
- creates the **Zoom** link
- sends the confirmation email to the family and the notification to you

The site holds no booking data, card details or student information.

Until a Calendly link is added, `book.html` still works: after a subject is
picked, it offers an email link with the subject filled in.

## One-time setup in Calendly

Paid features (Stripe payments, more than one event type) need a paid Calendly
plan. Check Calendly's current plans.

1. **Calendar.** Connect your Google, Outlook or iCloud calendar under
   *Calendar sync*, so busy times are blocked and new bookings are added.
2. **Zoom.** Connect Zoom under *Integrations*. Then, in the event's
   *Location*, choose Zoom, so every booking gets its own meeting link.
3. **Stripe.** Connect Stripe under *Integrations → Stripe*. Then, in the
   event's *Booking page options → Collect payments*, set the price.
4. **Create the event**, for example "Tutoring session":
   - *Duration*: turn on multiple durations (e.g. 60 and 90 minutes). The
     family picks one when booking.
   - *Availability*: your hours, buffers between sessions, and minimum notice.
   - *Invitee questions*. **The first custom question must be "Subject"**,
     because the site fills it in. Then add:
     1. Subject (one line, required). The site fills this in.
     2. Student's name (one line, required)
     3. Grade level (one line or dropdown, required)
     4. What does the student need help with? (multiple lines, required)
     5. Parent/guardian name and phone (one line, required if under 18)

     Calendly's built-in Name and Email are the person booking, which should
     be the parent or guardian for students under 18.
   - *Notifications*: keep the email confirmation on. Add your cancellation
     and rescheduling policy to it, and to the event description.
5. Copy the event's link (e.g. `https://calendly.com/your-name/tutoring`).

## Connect it to the site

Edit `js/booking-config.js`:

```js
calendlyUrl: 'https://calendly.com/your-name/tutoring',
```

Optional:

- **Different event per subject** (e.g. a different SAT price): give that
  subject its own `calendlyUrl`.
- **Show prices on the site.** These are display only; Calendly charges what's
  set there, so keep the two the same:
  ```js
  prices: [
    { label: '60-minute session', price: '$__' },
    { label: '90-minute session', price: '$__' }
  ]
  ```
- **Subject isn't the first question?** Change `subjectAnswer` to `'a2'`,
  `'a3'` and so on.

Then bump `?v=` on `js/booking-config.js` in `tutoring.html` and `book.html`,
so returning visitors get the new settings. Run `node scripts/check-site.mjs`
and push.

## Test it

Make a booking with Stripe in test mode, or with a 100%-off coupon. Then check:

- the subject is already filled in
- payment shows the right price
- you get the notification
- the confirmation email has the date, time, subject and Zoom link
- the "You're booked" message appears on `book.html`

## Analytics

There's no analytics service on the site yet. `js/track.js` sends these event
names to Plausible, Google Analytics or Tag Manager once one is added:

| Event | What it records |
|---|---|
| `book_cta_*` | a click on a "Book" button (the name says which one) |
| `booking_subject_math` / `_physics` / `_sat` | a subject was picked on `book.html` |
| `booking_calendar_loaded` | the Calendly scheduler loaded |
| `booking_calendar_error` | the scheduler didn't load; the visitor saw the email fallback |
| `booking_time_selected` | a time was picked |
| `booking_completed` (+ `booking_completed_<subject>`) | a booking was finished |
| `booking_email_request` | the email fallback was used |
| `lab_cta_*` | a click on "Explore the Lab" |

The events carry names only, never personal details.
