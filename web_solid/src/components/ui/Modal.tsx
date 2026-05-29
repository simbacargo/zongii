import { JSX, Show, onCleanup, onMount } from "solid-js";

interface ModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: JSX.Element;
  size?: "sm" | "md" | "lg";
}

export function Modal(props: ModalProps) {
  const maxW = () =>
    props.size === "sm" ? "max-w-sm" : props.size === "lg" ? "max-w-2xl" : "max-w-lg";

  function onKey(e: KeyboardEvent) {
    if (e.key === "Escape") props.onClose();
  }

  onMount(() => document.addEventListener("keydown", onKey));
  onCleanup(() => document.removeEventListener("keydown", onKey));

  return (
    <Show when={props.open}>
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={(e) => e.target === e.currentTarget && props.onClose()}
      >
        <div class={`bg-white rounded-2xl shadow-2xl w-full ${maxW()} max-h-[90vh] flex flex-col`}>
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 class="text-base font-black text-gray-900">{props.title}</h2>
            <button
              onClick={props.onClose}
              class="text-gray-400 hover:text-gray-700 transition-colors"
            >
              <i class="bi bi-x-lg text-lg" />
            </button>
          </div>
          <div class="flex-1 overflow-y-auto px-6 py-4">{props.children}</div>
        </div>
      </div>
    </Show>
  );
}
