export function Spinner(props: { size?: "sm" | "md" | "lg" }) {
  const sz = props.size ?? "md";
  const cls = sz === "sm" ? "h-5 w-5 border-2" : sz === "lg" ? "h-12 w-12 border-4" : "h-8 w-8 border-3";
  return (
    <div class={`${cls} animate-spin rounded-full border-indigo-600 border-t-transparent`} />
  );
}

export function PageLoader() {
  return (
    <div class="flex h-64 items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
