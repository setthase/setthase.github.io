const ANIMATION_NAME = "deleting";
const ANIMATION_CLASS_NAME = "visible";

const headline = document.getElementById("headline");
const elements = headline?.children
  ? (Array.from(headline.children) as HTMLSpanElement[])
  : [];

// Iterate through the elements
elements.forEach((element, index) => {
  const nextIndex = index + 1;

  element.addEventListener("animationend", (ev) => {
    if (ev.animationName === ANIMATION_NAME) {
      element.classList.remove(ANIMATION_CLASS_NAME);
      elements[nextIndex === elements.length ? 0 : nextIndex].classList.add(
        ANIMATION_CLASS_NAME,
      );
    }
  });
});
