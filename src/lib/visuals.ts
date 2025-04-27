import confetti from "canvas-confetti";
export async function showConfetti() {
  confetti({
    particleCount: 150,
    spread: 80,
    origin: { y: 0.6 },
  });
}

function createFloatingIcon(
  icon: "✅" | "❌",
  color: "text-green-500" | "text-red-500"
) {
  const div = document.createElement("div");
  div.innerText = icon;
  div.className = `
    fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
    ${color} text-6xl opacity-0 scale-75
    transition-all duration-150 ease-out z-[1000]
  `;

  document.body.appendChild(div);

  // Fade In
  requestAnimationFrame(() => {
    div.classList.remove("opacity-0", "scale-75");
    div.classList.add("opacity-100", "scale-100");
  });

  // Stay visible briefly, then Fade Out
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
  }, 300); // <<== only visible for 300ms instead of 1000ms
}


export async function showGreenCheck() {
  createFloatingIcon("✅", "text-green-500");
}

export async function showRedX() {
  createFloatingIcon("❌", "text-red-500");
}
