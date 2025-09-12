import confetti from "canvas-confetti";

export async function showConfetti() {
  confetti({
    particleCount: 150,
    spread: 80,
    origin: { y: 0.6 },
  });
}

const feedbackIconDisplayTime = 400;

function createFloatingIcon(type: "check" | "x" | "warning") {
  const div = document.createElement("div");

  // Choose color from global CSS variables
  const iconColor =
    type === "check"
      ? getComputedStyle(document.documentElement).getPropertyValue("--icon-green")
      : type === "x"
      ? getComputedStyle(document.documentElement).getPropertyValue("--icon-red")
      : getComputedStyle(document.documentElement).getPropertyValue("--icon-yellow");

  div.className = `
    fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
    flex items-center justify-center
    text-white rounded-xl shadow-lg
    w-20 h-20 text-5xl
    opacity-0 scale-75
    transition-all duration-200 ease-out z-[1000]
  `;

  div.innerText = type === "check" ? "✓" : type === "x" ? "✕" : "⚠";
  div.style.backgroundColor = iconColor;

  document.body.appendChild(div);

  // Fade In
  requestAnimationFrame(() => {
    div.classList.remove("opacity-0", "scale-75");
    div.classList.add("opacity-100", "scale-100");
  });

  // Stay briefly, then Fade Out
  setTimeout(() => {
    div.classList.remove("opacity-100", "scale-100");
    div.classList.add("opacity-0", "scale-75");

    div.addEventListener(
      "transitionend",
      () => {
        document.body.removeChild(div);
      },
      { once: true }
    );
  }, feedbackIconDisplayTime);
}

export async function showGreenCheck() {
  createFloatingIcon("check");
}

export async function showRedX() {
  createFloatingIcon("x");
}

export async function showYellowWarning() {
  createFloatingIcon("warning");
}
