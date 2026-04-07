import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
} from "react-router";
import { AuthProvider } from "./Context/AppContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import type { Route } from "./+types/root";
import "./app.css";
import Aside from "./components/Aside";
import StorePicker from "./components/StorePicker";

export const links: Route.LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  {
    rel: "stylesheet",
    href: "https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css",
  },
];

/**
 * 1. The Layout Component
 * This is the wrapper for your entire HTML document.
 * We put the Providers here so that the Header/Aside can access Context.
 */
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <AuthProvider>
          <GoogleOAuthProvider clientId="579348198460-afgbio7gcqi7gqoiyfgcqheifqpgfqyiwefg.apps.googleusercontent.com">
            <main className="mx-auto flex w-full min-h-screen bg-gray-100 text-gray-700">
              <Aside />
              <div className="flex-1 bg-white m-1 rounded-md p-2 flex flex-col relative shadow-sm">
                {/* This is where the actual page content (App component) renders */}
                <div className="flex-1 sp-4">
                  {children}
                </div>
              </div>
            </main>
          </GoogleOAuthProvider>
        </AuthProvider>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

/**
 * 2. The Main App Component
 * This is rendered as the "children" of the Layout.
 */
export default function App() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  return (
    <div className="relative h-full">
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-sm">
          <LoadingSpinner />
        </div>
      )}
      <Outlet />
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center gap-2  top-1/5 absolute">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      <span className="text-sm font-medium text-gray-500">Loading...</span>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1 className="text-2xl font-bold text-red-600">{message}</h1>
      <p className="text-gray-600">{details}</p>
      {stack && (
        <pre className="mt-4 p-4 bg-gray-100 rounded overflow-x-auto text-xs">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}



export function HydrateFallback() {
  return <div>Loading...</div>;
}
