import confetti from "canvas-confetti";
export async function showConfetti() {
  confetti({
    particleCount: 150,
    spread: 80,
    origin: { y: 0.6 },
  });
}

export async function showGreenCheck() {
  const div = document.createElement("div");
  div.innerText = "✅";
  div.className =
    "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-green-500 text-6xl animate-ping z-[1000]";
  document.body.appendChild(div);

  setTimeout(() => {
    document.body.removeChild(div);
  }, 1000);
}
export async function showRedX() {
  const div = document.createElement("div");
  div.innerText = "❌";
  div.className =
    "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500 text-6xl animate-ping z-[1000]";
  document.body.appendChild(div);

  setTimeout(() => {
    document.body.removeChild(div);
  }, 1000);
}

