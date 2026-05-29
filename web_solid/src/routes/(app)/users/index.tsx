import { createResource, createSignal, For, Show } from "solid-js";
import { A } from "@solidjs/router";
import { users } from "../../../lib/api";
import { ROLE_OPTIONS } from "../../../lib/utils";
import { PageLoader } from "../../../components/ui/Spinner";
import { EmptyState } from "../../../components/ui/EmptyState";
import { ActiveBadge } from "../../../components/ui/Badge";
import { Modal } from "../../../components/ui/Modal";

export default function UsersPage() {
  const [q, setQ] = createSignal("");
  const [userList, { refetch }] = createResource(q, (search) => users.list(search));

  const [showAdd, setShowAdd] = createSignal(false);
  const [saving, setSaving] = createSignal(false);
  const [err, setErr] = createSignal("");

  const [username, setUsername] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [role, setRole] = createSignal("staff");

  async function addUser() {
    setSaving(true); setErr("");
    try {
      await users.create({ username: username(), password: password(), role: role() });
      setShowAdd(false);
      setUsername(""); setPassword(""); setRole("staff");
      refetch();
    } catch (e: any) { setErr(e.message); }
    finally { setSaving(false); }
  }

  async function toggleActive(id: string) {
    try { await users.toggleActive(id); refetch(); }
    catch (e: any) { alert(e.message); }
  }

  return (
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-black text-gray-900">Users & Permissions</h1>
          <p class="text-sm text-gray-500 mt-0.5">Staff accounts and roles</p>
        </div>
        <button onClick={() => setShowAdd(true)} class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl px-4 py-2.5 transition-colors">
          <i class="bi bi-person-badge" /> Add Staff
        </button>
      </div>

      <div class="mb-5">
        <input type="search" placeholder="Search username, name, email…" value={q()} onInput={e => setQ(e.currentTarget.value)}
          class="w-full max-w-sm px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <Show when={!userList.loading} fallback={<PageLoader />}>
        <Show when={(userList() ?? []).length > 0} fallback={<EmptyState icon="people" message="No users found" />}>
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table class="w-full text-left">
              <thead class="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">User</th>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Role</th>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center">Status</th>
                  <th class="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <For each={userList() ?? []}>
                  {(u) => (
                    <tr class="hover:bg-gray-50/60 transition-colors">
                      <td class="px-5 py-3">
                        <p class="text-sm font-bold text-gray-900">{u.username}</p>
                        <p class="text-xs text-gray-400">{u.email || u.full_name || "—"}</p>
                      </td>
                      <td class="px-5 py-3">
                        <span class="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full capitalize">
                          {u.role ?? "staff"}
                        </span>
                      </td>
                      <td class="px-5 py-3 text-center">
                        <ActiveBadge active={u.is_active} />
                      </td>
                      <td class="px-5 py-3 text-right">
                        <div class="flex items-center justify-end gap-2">
                          <A href={`/users/${u.id}`} class="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
                            Edit
                          </A>
                          <button onClick={() => toggleActive(u.id)} class={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors ${u.is_active ? "text-red-500 hover:text-red-700 hover:bg-red-50" : "text-green-600 hover:text-green-800 hover:bg-green-50"}`}>
                            {u.is_active ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </Show>
      </Show>

      {/* Add User Modal */}
      <Modal title="Add Staff Member" open={showAdd()} onClose={() => setShowAdd(false)} size="sm">
        <div class="space-y-4">
          {err() && <p class="text-sm text-red-600">{err()}</p>}
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1.5">Username *</label>
            <input class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={username()} onInput={e => setUsername(e.currentTarget.value)} />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1.5">Password *</label>
            <input type="password" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={password()} onInput={e => setPassword(e.currentTarget.value)} />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1.5">Role</label>
            <select class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" value={role()} onChange={e => setRole(e.currentTarget.value)}>
              <For each={ROLE_OPTIONS}>
                {(r) => <option value={r.value}>{r.label}</option>}
              </For>
            </select>
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowAdd(false)} class="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl">Cancel</button>
            <button onClick={addUser} disabled={saving() || !username() || !password()} class="px-4 py-2 text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-60">
              {saving() ? "Saving…" : "Create User"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
