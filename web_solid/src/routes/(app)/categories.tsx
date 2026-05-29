import { createResource, createSignal, For, Show } from "solid-js";
import { categories } from "../../lib/api";
import { PageLoader } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { useAuth } from "../../contexts/auth";

export default function CategoriesPage() {
  const { state } = useAuth();
  const isAdmin = () => state.user?.is_admin || state.user?.is_superuser;

  const [catList, { refetch }] = createResource(() => categories.list());
  const [newName, setNewName] = createSignal("");
  const [editId, setEditId] = createSignal<number | null>(null);
  const [editName, setEditName] = createSignal("");
  const [saving, setSaving] = createSignal(false);
  const [err, setErr] = createSignal("");

  async function addCategory() {
    if (!newName().trim()) return;
    setSaving(true); setErr("");
    try {
      await categories.create(newName().trim());
      setNewName("");
      refetch();
    } catch (e: any) { setErr(e.message); }
    finally { setSaving(false); }
  }

  async function saveEdit() {
    if (!editId() || !editName().trim()) return;
    setSaving(true); setErr("");
    try {
      await categories.update(editId()!, editName().trim());
      setEditId(null);
      refetch();
    } catch (e: any) { setErr(e.message); }
    finally { setSaving(false); }
  }

  async function del(id: number) {
    if (!confirm("Delete this category?")) return;
    try {
      await categories.delete(id);
      refetch();
    } catch (e: any) { alert(e.message); }
  }

  return (
    <div class="max-w-xl">
      <div class="mb-6">
        <h1 class="text-2xl font-black text-gray-900">Categories</h1>
        <p class="text-sm text-gray-500 mt-0.5">Organise products into groups</p>
      </div>

      {err() && <p class="text-sm text-red-600 mb-4">{err()}</p>}

      <Show when={isAdmin()}>
        <div class="flex gap-3 mb-5">
          <input
            placeholder="New category name…"
            value={newName()}
            onInput={e => setNewName(e.currentTarget.value)}
            onKeyDown={e => e.key === "Enter" && addCategory()}
            class="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={addCategory}
            disabled={saving() || !newName().trim()}
            class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors"
          >
            Add
          </button>
        </div>
      </Show>

      <Show when={!catList.loading} fallback={<PageLoader />}>
        <Show when={(catList() ?? []).length > 0} fallback={
          <EmptyState icon="tags" message="No categories yet" />
        }>
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            <For each={catList() ?? []}>
              {(cat) => (
                <div class="flex items-center gap-3 px-5 py-3.5">
                  <Show
                    when={editId() === cat.id}
                    fallback={
                      <span class="flex-1 text-sm font-semibold text-gray-800">{cat.name}</span>
                    }
                  >
                    <input
                      class="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={editName()}
                      onInput={e => setEditName(e.currentTarget.value)}
                      onKeyDown={e => e.key === "Enter" && saveEdit()}
                    />
                  </Show>

                  <Show when={isAdmin()}>
                    <Show
                      when={editId() === cat.id}
                      fallback={
                        <div class="flex items-center gap-1">
                          <button
                            onClick={() => { setEditId(cat.id); setEditName(cat.name); }}
                            class="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => del(cat.id)}
                            class="text-xs font-bold text-red-500 hover:text-red-700 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      }
                    >
                      <div class="flex items-center gap-1">
                        <button
                          onClick={saveEdit}
                          disabled={saving()}
                          class="text-xs font-bold text-green-600 hover:text-green-800 px-2.5 py-1.5 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-60"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          class="text-xs font-bold text-gray-500 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </Show>
                  </Show>
                </div>
              )}
            </For>
          </div>
        </Show>
      </Show>
    </div>
  );
}
