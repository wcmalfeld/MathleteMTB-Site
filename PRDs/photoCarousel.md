# PRD: Mathlete MTB Homepage Photo Carousel

## 1. Overview

Build a simple, responsive photo carousel on the Mathlete MTB homepage, positioned directly to the right of the existing Mathlete MTB logo.

The carousel will display a rotating selection of photographs from a designated image gallery, showcasing mountain biking, athletes, outdoor environments, and the lifestyle that inspires Mathlete MTB.

The purpose is to add visual personality to the homepage while reinforcing the brand's identity: learning through sport, curiosity, adventure, and problem-solving.

**Keep the implementation lightweight, minimal, and consistent with the existing website design.**

## 2. Layout & Placement

### Desktop
- Position the carousel immediately to the right of the Mathlete MTB logo.
- The logo and carousel should sit horizontally alongside one another.
- The logo should remain the primary branding element.
- The carousel should occupy the remaining available horizontal space without overpowering the logo.
- Maintain balanced spacing between the logo and image gallery.
- Vertically center the carousel relative to the logo.

### Mobile
- Maintain a clean, responsive layout.
- Allow the carousel to resize appropriately for smaller screens.
- If necessary, reposition the carousel below the logo rather than squeezing both elements into one row.
- Ensure the navigation and images remain usable on touchscreens.

## 3. Carousel Functionality

Implement a simple image carousel with the following behavior:

- Automatically rotate between photographs every 5–6 seconds.
- Use a smooth crossfade transition between images.
- Include subtle previous and next navigation arrows.
- Include small pagination indicators (dots) to show the current image.
- Allow users to manually navigate between images.
- Pause automatic rotation when a user hovers over the carousel.
- Resume automatic rotation when the user moves away.
- Support swipe gestures on mobile devices.
- Loop continuously from the last image back to the first.

Avoid elaborate animations or unnecessary functionality.

## 4. Image Gallery Management

Create a centralized image gallery that makes it easy to add, remove, or reorder photographs without modifying the carousel component itself.

Suggested directory:

`/public/images/gallery/`

Suggested structure:

- `/public/images/gallery/`
  - `riding-01.jpg`
  - `riding-02.jpg`
  - `riding-03.jpg`
  - `riding-04.jpg`
  - `riding-05.jpg`

Create a centralized gallery configuration containing the image paths and optional alt text.

Example:

```javascript
const galleryImages = [
  {
    src: "/images/gallery/riding-01.jpg",
    alt: "Mountain biker riding a trail"
  },
  {
    src: "/images/gallery/riding-02.jpg",
    alt: "Mountain biking in the mountains"
  }
];
```

The carousel should automatically accommodate however many images are included in the gallery.

Do not hardcode image paths individually throughout the component.

## 5. Visual Design

The carousel should feel like a natural extension of the existing Mathlete MTB homepage.

Design requirements:

- Clean, minimal presentation.
- Slightly rounded image corners.
- Consistent image dimensions and aspect ratio.
- Use `object-fit: cover` to maintain attractive image cropping.
- Subtle transitions between images.
- Minimal or transparent background.
- No large borders, shadows, or distracting UI elements.
- Navigation arrows should be understated and only become prominent when needed.

**Image proportions:** Aim for a landscape-oriented image container, approximately 16:9.

The photographs should be the primary visual focus, not the carousel controls.

## 6. Technical Requirements

- Build the carousel as a reusable, self-contained component.
- Use the existing frontend framework and styling conventions.
- Avoid introducing additional dependencies unless absolutely necessary.
- Optimize images for web performance.
- Use lazy loading where appropriate.
- Prevent layout shifts while images load by defining the image container dimensions.
- Ensure the carousel works across desktop, tablet, and mobile.
- Include accessible navigation controls and descriptive image alt text.
- Respect the user's reduced-motion preferences.
- Ensure automatic rotation does not interfere with keyboard navigation or screen readers.

## 7. Implementation Guidelines

Before implementing:

1. Inspect the existing Mathlete MTB homepage.
2. Identify the component responsible for rendering the logo and homepage header.
3. Understand the existing layout, styling, and responsive breakpoints.
4. Integrate the carousel into the existing structure rather than rebuilding the header.
5. Preserve all existing navigation, branding, and functionality.

Do not redesign unrelated portions of the homepage.

## 8. Acceptance Criteria

The implementation is complete when:

- [ ] The carousel appears immediately to the right of the Mathlete MTB logo on desktop.
- [ ] The logo remains visually prominent.
- [ ] Images rotate automatically every 5–6 seconds.
- [ ] Images transition smoothly using a crossfade.
- [ ] Previous and next controls work.
- [ ] Pagination indicators reflect the active image.
- [ ] Users can swipe through images on mobile.
- [ ] The carousel loops continuously.
- [ ] The layout adapts cleanly to smaller screens.
- [ ] New images can be added through the centralized gallery configuration.
- [ ] The implementation preserves the existing website aesthetic.
- [ ] No existing homepage functionality is broken.

## 9. Important Design Direction

The Mathlete MTB website should retain its recognizable, minimal, slightly unconventional aesthetic.

This carousel is intended to introduce a little more life and visual storytelling to the homepage without turning it into a conventional marketing website.

Think of it as a small window into the Mathlete MTB world: athletes riding, exploring, learning, and having fun.

**Keep it simple. Let the photographs do the talking.**