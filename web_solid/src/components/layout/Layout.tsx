import { JSX } from "solid-js";
import { Sidebar } from "./Sidebar";

export function Layout(props: { children: JSX.Element }) {
  return (
    <div class="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main class="flex-1 overflow-y-auto">
        <div class="max-w-7xl mx-auto p-6">
          {props.children}
        </div>
      </main>
    </div>
  );
}
