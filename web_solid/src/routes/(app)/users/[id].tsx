import { createResource, createSignal, For, Show } from "solid-js";
import { useParams, useNavigate } from "@solidjs/router";
import { users } from "../../../lib/api";
import { ROLE_OPTIONS, ALL_SECTIONS, formatDate } from "../../../lib/utils";
import { PageLoader } from "../../../components/ui/Spinner";
import { ActiveBadge } from "../../../components/ui/Badge";
import { useAuth } from "../../../contexts/auth";

export default function UserDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { state } = useAuth();
  const isSuperuser = () => state.user?.is_superuser;

  const [user, { refetch }] = createResource(() => users.get(params.id!));

  const [selectedRole, setSelectedRole] = createSignal("");
  const [selectedSections, setSelectedSections] = createSignal<string[]>([]);
  const [saving, setSaving] = createSignal(false);
  const [err, setErr] = createSignal("");

  function initForm() {
    const u = user();
    if (!u) return;
    setSelectedRole(u.role ?? "staff");
    setSelectedSections(u.allowed_sections ?? []);
  }

  function toggleSection(section: string) {
    const current = selectedSections();
    if (current.includes(section)) {
      setSelectedSections(current.filter(s => s !== section));
    } else {
      setSelectedSections([...current, section]);
    }
  }

  async function saveRole() {
    setSaving(true); setErr("");
    try {
      await users.setRole(params.id!, selectedRole(), selectedSections());
      refetch();
    } catch (e: any) { setErr(e.message); }
    finally { setSaving(false); }
  }

  async function toggleActive() {
    try { await users.toggleActive(params.id!); refetch(); }
    catch (e: any) { alert(e.message); }
  }

  return (
    <div class="max-w-2xl">
      <button onClick={() => navigate("/users")} class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-5 transition-colors">
        <i class="bi bi-arrow-left" /> Back to Users
      </button>

      <Show when={!user.loading} fallback={<PageLoader />}>
        <Show when={user()}>
          {(u) => (
            <div class="space-y-5">
              <div class="flex items-start justify-between">
                <div>
                  <h1 class="text-2xl font-black text-gray-900">{u().username}</h1>
                  <p class="text-sm text-gray-500 mt-0.5 capitalize">{u().role ?? "staff"}</p>
                </div>
                <div class="flex items-center gap-3">
                  <ActiveBadge active={u().is_active} />
                  <Show when={u().id !== state.user?.id}>
                    <button onClick={toggleActive} class={`text-sm font-bold px-4 py-2 rounded-xl transition-colors ${u().is_active ? "text-red-500 bg-red-50 hover:bg-red-100" : "text-green-600 bg-green-50 hover:bg-green-100"}`}>
                      {u().is_active ? "Deactivate" : "Activate"}
                    </button>
                  </Show>
                </div>
              </div>

              {/* Profile */}
              <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 class="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">Profile</h3>
                <dl class="grid grid-cols-2 gap-4">
                  <Row label="Full Name" value={u().full_name || `${u().firstname} ${u().lastname}`.trim() || "—"} />
                  <Row label="Email" value={u().email || "—"} />
                  <Row label="Mobile" value={u().mobile || "—"} />
                  <Row label="Gender" value={u().gender || "—"} />
                  <Row label="Joined" value={formatDate(u().date_joined)} />
                  {u().last_seen && <Row label="Last Seen" value={formatDate(u().last_seen!)} />}
                </dl>
              </div>

              {/* Role & Permissions */}
              <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 class="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">Role & Permissions</h3>

                {err() && <p class="text-sm text-red-600 mb-3">{err()}</p>}

                {/* Use current values as default if not initialized */}
                <div class="space-y-4">
                  <div>
                    <label class="block text-xs font-bold text-gray-600 mb-2">Role</label>
                    <div class="flex flex-wrap gap-2">
                      <For each={ROLE_OPTIONS}>
                        {(r) => (
                          <button
                            onClick={() => setSelectedRole(r.value)}
                            class={`px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all border ${(selectedRole() || u().role) === r.value ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"}`}
                          >
                            {r.label}
                          </button>
                        )}
                      </For>
                    </div>
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-gray-600 mb-2">Allowed Sections</label>
                    <div class="flex flex-wrap gap-2">
                      <For each={ALL_SECTIONS}>
                        {(section) => {
                          const isSelected = () => (selectedSections().length > 0 ? selectedSections() : u().allowed_sections ?? []).includes(section);
                          return (
                            <button
                              onClick={() => {
                                if (selectedSections().length === 0) setSelectedSections(u().allowed_sections ?? []);
                                toggleSection(section);
                              }}
                              class={`px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all border capitalize ${isSelected() ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"}`}
                            >
                              {section}
                            </button>
                          );
                        }}
                      </For>
                    </div>
                  </div>

                  <div class="flex justify-end pt-2 border-t border-gray-50">
                    <button onClick={saveRole} disabled={saving()} class="px-4 py-2 text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-colors">
                      {saving() ? "Saving…" : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Show>
      </Show>
    </div>
  );
}

function Row(props: { label: string; value: string }) {
  return (
    <div>
      <dt class="text-xs font-bold text-gray-400 mb-0.5">{props.label}</dt>
      <dd class="text-sm text-gray-800">{props.value}</dd>
    </div>
  );
}
