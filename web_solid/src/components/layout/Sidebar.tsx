import { A, useNavigate } from "@solidjs/router";
import { createResource } from "solid-js";
import type { User } from "../../types";
import { useAuth } from "../../contexts/auth";
import { notifications } from "../../lib/api";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  section: string | null;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { href: "/",              label: "Dashboard",       icon: "grid-1x2",          section: null },
  { href: "/sales",         label: "New Sale",         icon: "cart-plus",         section: "sales" },
  { href: "/orders",        label: "Orders",           icon: "box-seam",          section: "orders" },
  { href: "/picking",       label: "Picker Dashboard", icon: "boxes",             section: "orders",   roles: ["picker", "manager", "admin"] },
  { href: "/products",      label: "Products",         icon: "archive",           section: "inventory" },
  { href: "/categories",    label: "Categories",       icon: "tags",              section: "inventory" },
  { href: "/customers",     label: "Customers",        icon: "people",            section: "customers" },
  { href: "/documents",     label: "Invoices",         icon: "file-earmark-text", section: "billing" },
  { href: "/gate-passes",   label: "Gate Passes",      icon: "door-open",         section: "orders" },
  { href: "/users",         label: "Users",            icon: "shield-lock",       section: "users" },
  { href: "/notifications", label: "Notifications",    icon: "bell",              section: null },
];

function canSee(item: NavItem, user: User): boolean {
  if (user.is_superuser || user.is_admin) return true;
  if (item.roles && !item.roles.includes(user.role)) return false;
  if (!item.section) return true;
  return user.allowed_sections?.includes(item.section) ?? false;
}

export function Sidebar() {
  const { state, logout } = useAuth();
  const navigate = useNavigate();
  const user = () => state.user!;

  const [notifData] = createResource(() => notifications.list());
  const unread = () => notifData()?.unread_count ?? 0;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <aside class="w-64 shrink-0 h-screen flex flex-col bg-white border-r border-gray-100 sticky top-0">

      {/* Logo */}
      <div class="px-6 py-5 border-b border-gray-50 flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl overflow-hidden shadow-md shadow-indigo-100 shrink-0">
          <img src="/Logo.png" alt="Zongii" class="w-full h-full object-cover" />
        </div>
        <span class="text-base font-black text-amber-500">
          Zongii <span class="text-[15px] font-bold">Mining</span>
        </span>
      </div>

      {/* Nav */}
      <nav class="flex-1 overflow-y-auto px-4 py-4 space-y-0.5">
        {NAV_ITEMS.filter(item => canSee(item, user())).map(item => (
          <A
            href={item.href}
            end={item.href === "/"}
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-semibold group text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            activeClass="!bg-indigo-50 !text-indigo-700"
          >
            <i class={`bi bi-${item.icon} text-base group-hover:text-indigo-600`} />
            <span class="flex-1">{item.label}</span>
            {item.href === "/notifications" && unread() > 0 && (
              <span class="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {unread()}
              </span>
            )}
          </A>
        ))}
      </nav>

      {/* User footer */}
      <div class="px-4 py-4 border-t border-gray-50">
        <div class="flex items-center gap-3 px-3 py-2.5 rounded-xl">
          <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
            <i class="bi bi-person-fill text-indigo-500 text-sm" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold text-gray-800 truncate">{user().username}</p>
            <p class="text-[10px] text-gray-400 capitalize">{user().role ?? "staff"}</p>
          </div>
          <button onClick={handleLogout} class="text-gray-400 hover:text-red-500 transition-colors" title="Logout">
            <i class="bi bi-box-arrow-right text-sm" />
          </button>
        </div>
      </div>

    </aside>
  );
}
