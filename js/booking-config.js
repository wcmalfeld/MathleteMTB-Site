/* ============================================================
   TUTORING BOOKINGS: SETTINGS
   The booking page (book.html) shows a Calendly scheduler. Calendly
   handles everything after the subject is picked: your availability,
   session lengths, the student/parent questions, payment through
   Stripe, the Zoom link, confirmation emails and your notification.
   Change those in Calendly, not here. See docs/BOOKING.md.

   calendlyUrl: your Calendly event's link, e.g.
                'https://calendly.com/your-name/tutoring'.
                While it's empty, book.html asks visitors to request a
                session by email instead, so the page never breaks.

   subjects:    the three subject choices. Give a subject its own
                `calendlyUrl` to send it to a separate Calendly event
                (for example a different price for SAT prep); leave it
                '' to use the main calendlyUrl. `id` is what links use:
                book.html?subject=physics

   subjectAnswer: which Calendly question receives the subject name.
                'a1' is the first custom question on the event, 'a2' the
                second, and so on. Make "Subject" the first question.

   prices:      what the site shows before checkout. Keep these the same
                as the prices set in Calendly, which are what's charged.
                Leave the list empty to show no prices on the site, e.g.
                { label: '60-minute session', price: '$__' }
   ============================================================ */
window.MATHLETE_BOOKING = {
  calendlyUrl: '',
  subjects: [
    { id: 'math', name: 'Mathematics', calendlyUrl: '' },
    { id: 'physics', name: 'Physics', calendlyUrl: '' },
    { id: 'sat', name: 'SAT Preparation', calendlyUrl: '' }
  ],
  subjectAnswer: 'a1',
  prices: []
};
