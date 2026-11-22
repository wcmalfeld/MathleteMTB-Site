/* ============================================================
   HOME PAGE PHOTO GALLERY (the carousel beside the logo)
   Add, remove or reorder photos here; js/carousel.js shows however many
   are listed, in this order. Nothing else needs to change.

   Each photo:
     src:  a 16:9 landscape JPEG in assets/gallery/ (about 1280 × 720,
           under ~300 KB). Crop it to 16:9 before adding it, and strip its
           location data: phone photos carry GPS coordinates.
     alt:  what the photo shows, for screen readers.
     position (optional): CSS object-position if the crop needs nudging,
           e.g. '50% 30%'.
   The first photo is also written into index.html (so the page has a
   photo without JavaScript); check-site.mjs keeps the two in step.
   ============================================================ */
window.MATHLETE_GALLERY = [
  { src: 'assets/gallery/riding-01.jpg', alt: 'A rider flying high over a huge dirt jump in a tall, misty forest' },
  { src: 'assets/gallery/riding-02.jpg', alt: 'A young rider with a dirt bike waving from a grassy singletrack above a deep blue lake and mountains' },
  { src: 'assets/gallery/riding-03.jpg', alt: 'A sunny dirt-jump park full of sculpted lips and landings, with wooded hills behind' },
  { src: 'assets/gallery/riding-04.jpg', alt: 'Looking up a dirt approach to a tall takeoff lip in a pine forest' },
  { src: 'assets/gallery/riding-05.jpg', alt: 'A mountain bike at the foot of two tall dirt lips with ladders up their faces' },
  { src: 'assets/gallery/riding-06.jpg', alt: 'An old scooter parked in front of a line of packed-dirt jumps at dusk' }
];
