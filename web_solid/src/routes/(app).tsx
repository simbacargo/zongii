import { Show, createEffect } from "solid-js";
import type { RouteSectionProps } from "@solidjs/router";
import { useNavigate } from "@solidjs/router";
import { Layout } from "../components/layout/Layout";
import { useAuth } from "../contexts/auth";
import { Spinner } from "../components/ui/Spinner";

export default function AppLayout(props: RouteSectionProps) {
  const { state } = useAuth();
  const navigate = useNavigate();

  createEffect(() => {
    if (state.initialized && !state.user) {
      navigate("/login", { replace: true });
    }
  });

  return (
    <Show
      when={state.user}
      fallback={
        <div class="flex h-screen items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <Layout>
        {props.children}
      </Layout>
    </Show>
  );
}
