// src/lib/utils/uiHelpers.ts

"use client";

/**
 * Shows a confirmation popup asking the user to confirm set deletion.
 * Returns true if the user confirms, false if they cancel.
 */
export const showConfirmDeletePopup = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Create the overlay
    const overlay = document.createElement("div");
    overlay.className = `
      fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]
      opacity-0 transition-opacity duration-300
    `;

    // Create the popup box
    const popup = document.createElement("div");
    popup.className = `
      bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center space-y-4
      transform scale-90 opacity-0 transition-all duration-300
    `;

    // Message
    const message = document.createElement("p");
    message.innerText = "Are you sure you want to delete this set?";
    message.className = "text-lg text-gray-800";

    // Buttons container
    const buttons = document.createElement("div");
    buttons.className = "flex space-x-4";

    // Confirm button
    const confirmButton = document.createElement("button");
    confirmButton.innerText = "Delete";
    confirmButton.className = `
      bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition
    `;
    confirmButton.onclick = () => {
      cleanup();
      resolve(true);
    };

    // Cancel button
    const cancelButton = document.createElement("button");
    cancelButton.innerText = "Cancel";
    cancelButton.className = `
      bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition
    `;
    cancelButton.onclick = () => {
      cleanup();
      resolve(false);
    };

    // Assemble popup
    buttons.appendChild(confirmButton);
    buttons.appendChild(cancelButton);
    popup.appendChild(message);
    popup.appendChild(buttons);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Animate overlay and popup in
    requestAnimationFrame(() => {
      overlay.classList.remove("opacity-0");
      overlay.classList.add("opacity-100");

      popup.classList.remove("scale-90", "opacity-0");
      popup.classList.add("scale-100", "opacity-100");
    });

    // Cleanup function
    const cleanup = () => {
      overlay.classList.remove("opacity-100");
      overlay.classList.add("opacity-0");

      popup.classList.remove("scale-100", "opacity-100");
      popup.classList.add("scale-90", "opacity-0");

      popup.addEventListener(
        "transitionend",
        () => {
          document.body.removeChild(overlay);
        },
        { once: true }
      );
    };

    // Optional: Escape key closes popup
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        cleanup();
        resolve(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown, { once: true });
  });
};
