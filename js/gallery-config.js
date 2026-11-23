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
  { src: 'assets/gallery/riding-06.jpg', alt: 'An old scooter parked in front of a line of packed-dirt jumps at dusk' },
  { src: 'assets/gallery/riding-07.jpg', alt: 'A smiling rider on a rocky downhill track, with rolling green hills behind' },
  { src: 'assets/gallery/riding-08.jpg', alt: 'A dirt-jump park of sculpted lips and tires in a leafy valley' },
  { src: 'assets/gallery/riding-09.jpg', alt: 'A dirt-jump bike on a mountain roadside, held up by one hand' },
  { src: 'assets/gallery/riding-10.jpg', alt: 'A huge crowd lining tall dirt jumps at a forest event' },
  { src: 'assets/gallery/riding-11.jpg', alt: 'A mountain bike leaning against a big dirt jump in the sun' },
  { src: 'assets/gallery/riding-12.jpg', alt: 'Wooden-walled berms winding down a steep forest trail' },
  { src: 'assets/gallery/riding-13.jpg', alt: 'A rider standing on a dry ridge above a wide valley, bike at their feet' },
  { src: 'assets/gallery/riding-14.jpg', alt: 'A rider on a white bike looking out over a park at sunset' },
  { src: 'assets/gallery/riding-15.jpg', alt: 'Two riders on a dusty ridgeline above a town and a rocky peak' },
  { src: 'assets/gallery/riding-16.jpg', alt: 'A dirt road running down through cacti toward a hazy valley' },
  { src: 'assets/gallery/riding-17.jpg', alt: 'A big dirt-jump park in a mountain valley, with a sign at the edge' },
  { src: 'assets/gallery/riding-18.jpg', alt: 'A rider in a full-face helmet rolling down a town street toward the mountains' },
  { src: 'assets/gallery/riding-19.jpg', alt: 'A dirt switchback carved into a golden grassy mountainside' },
  { src: 'assets/gallery/riding-20.jpg', alt: 'A chairlift climbing over bright autumn shrubs and dark pines' },
  { src: 'assets/gallery/riding-21.jpg', alt: 'A rider pushing their bike up a steep slope of loose rock' },
  { src: 'assets/gallery/riding-22.jpg', alt: 'Two riders crossing high alpine rock below snowy peaks' },
  { src: 'assets/gallery/riding-23.jpg', alt: 'A trailer stacked with muddy mountain bikes, ready for a shuttle' },
  { src: 'assets/gallery/riding-24.jpg', alt: 'Riders pushing their bikes up a mossy rock face against a blue sky' },
  { src: 'assets/gallery/riding-25.jpg', alt: 'A row of old army-green trucks parked under pine trees' },
  { src: 'assets/gallery/riding-26.jpg', alt: 'Jagged mountains glowing pink at sunset above a hillside town' },
  { src: 'assets/gallery/riding-27.jpg', alt: 'A dusty trail dropping past pine trees toward a valley town' }
];
