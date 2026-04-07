import { Form, redirect, useActionData, useLoaderData, useNavigate, useNavigation } from "react-router";
import { useState, useMemo } from "react";
import type { Route } from "./+types/create";

// export async function loader() {
//   try {
//     const res = await fetch("http://localhost:8080/api/dashboard/overview/");
//     if (!res.ok) {
//       throw new Response("Failed to load data", { status: res.status });
//     }
//     return await res.json();
//   } catch (err) {
//     // If it's already a Response object, re-throw it
//     if (err instanceof Response) throw err;
//     // Otherwise, throw a 503
//     throw new Response("Server unreachable", { status: 503 });
//   }
// }

export async function clientAction({ request }: Route.ActionArgs) {
  // 1. Remove 'Content-Type' from here!
  const headers = {
    "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}`,
  };

  const formData = await request.formData();
  
  const res = await fetch("http://localhost:8080/product_create/", {
    method: "POST",
    body: formData, // The browser handles the Content-Type header for FormData
    headers: headers,
  });

  if (res.status === 400) return { errors: await res.json() };
  if (!res.ok) return { errors: { server: "Server error occurred." } };
  
  return redirect("/products");
}

export default function CreateProduct() {
  const { categories, businesses, materials, uoms } = {categories:[""], businesses:[""], materials:[""], uoms:[""]}
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // --- SEARCHABLE CATEGORIES STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCats, setSelectedCats] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredCategories = useMemo(() => {
    return categories.filter(
      (cat: any) => 
        cat?.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedCats.find((s) => s.id === cat.id)
    );
  }, [searchTerm, categories, selectedCats]);

  const addCategory = (cat: any) => {
    setSelectedCats([...selectedCats, cat]);
    setSearchTerm("");
    setShowDropdown(false);
  };

  const removeCategory = (id: number) => {
    setSelectedCats(selectedCats.filter((c) => c.id !== id));
  };

  const inputClass = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-gray-800 placeholder:text-gray-400";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1";

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      {/* HEADER */}
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create Inventory Item</h1>
          <p className="text-sm text-gray-500">Add technical specifications and logistics for new stock.</p>
        </div>
        <button 
          type="button" 
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Back to Inventory
        </button>
      </header>

      <Form method="post" encType="multipart/form-data" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* MAIN FORM AREA */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SECTION 1: CORE INFO */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blue-600 mb-4">Identification</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={labelClass}>Product Name</label>
                <input name="name" type="text" className={inputClass} placeholder="e.g. 1/2 inch Copper Elbow" required />
              </div>
              <div>
                <label className={labelClass}>Part Number (MPN)</label>
                <input name="part_number" type="text" className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Brand</label>
                <input name="brand" type="text" className={inputClass} required />
              </div>
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea name="description" rows={3} className={inputClass} placeholder="Technical details, usage notes..."></textarea>
            </div>
          </section>

          {/* SECTION 2: SPECS & LOGISTICS */}
          <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blue-600 mb-4">Technical & Logistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Material</label>
                <select name="material" className={inputClass}>
                  <option value="">Select Material...</option>
                  {materials.map(([val, label]: [string, string]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Unit of Measure</label>
                <select name="unit_of_measure" className={inputClass}>
                  {uoms.map(([val, label]: [string, string]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Current Stock</label>
                <input name="quantity_at_hand" type="number" defaultValue="0" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Reorder Point</label>
                <input name="reorder_point" type="number" defaultValue="10" className={inputClass} />
              </div>
            </div>
          </section>

          {/* ACTION BUTTONS */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {actionData?.errors && <span className="text-red-500 text-sm font-medium mr-auto">Please fix the errors below.</span>}
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-10 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all"
            >
              {isSubmitting ? "Saving Item..." : "Create Inventory Item"}
            </button>
          </div>
        </div>

        {/* SIDEBAR AREA */}
        <div className="space-y-6">
          
          {/* MEDIA & CATEGORIES */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <label className={labelClass}>Product Image</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors cursor-pointer group">
                <label className="space-y-1 text-center cursor-pointer">
                  <svg className="mx-auto h-10 w-10 text-gray-400 group-hover:text-blue-500" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="text-xs text-gray-600">
                    <span className="text-blue-600 font-semibold">Click to upload</span>
                  </div>
                  <input type="file" name="product_photo" className="hidden" accept="image/*" />
                </label>
              </div>
            </div>

            <div className="relative">
              <label className={labelClass}>Categories</label>
              <div className="min-h-[42px] p-1.5 border border-gray-300 rounded-lg bg-white flex flex-wrap gap-1.5 items-center">
                {selectedCats.map((cat) => (
                  <span key={cat.id} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 border border-blue-100">
                    {cat.name}
                    <button type="button" onClick={() => removeCategory(cat.id)} className="hover:text-red-500 text-lg leading-none">&times;</button>
                    {/* Hidden input to ensure the ID is sent via FormData */}
                    <input type="hidden" name="categories" value={cat.id} />
                  </span>
                ))}
                <input
                  type="text"
                  className="flex-1 outline-none px-2 text-sm min-w-[100px]"
                  placeholder={selectedCats.length === 0 ? "Select categories..." : ""}
                  value={searchTerm}
                  onFocus={() => setShowDropdown(true)}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {showDropdown && (searchTerm || filteredCategories.length > 0) && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-auto">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat: any) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => addCategory(cat)}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors border-b last:border-0 border-gray-50 flex items-center justify-between group"
                      >
                        {cat.name}
                        <span className="text-blue-500 opacity-0 group-hover:opacity-100">+</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 italic">No categories found</div>
                  )}
                </div>
              )}
            </div>

            <div>
                <label className={labelClass}>Business Unit</label>
                <select name="business" className={inputClass} required>
                    <option value="">Select Business...</option>
                    {businesses.map((b: any) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                </select>
            </div>
          </div>

          {/* FINANCIAL PREVIEW */}
          <div className="bg-blue-900 rounded-xl p-6 text-white shadow-lg">
            <h3 className="font-bold mb-4 flex items-center gap-2">
                <span className="p-1 bg-blue-700 rounded text-xs">$$</span>
                Quick Financials
            </h3>
            <div className="space-y-4">
                <div>
                    <label className="text-xs opacity-70 font-semibold uppercase">Cost Price</label>
                    <input name="buying_price" type="number" step="0.01" className="w-full bg-blue-800 border-none rounded-lg mt-1 px-3 py-2 text-white placeholder:text-blue-400 focus:ring-2 focus:ring-blue-400" placeholder="0.00" />
                </div>
                <div>
                    <label className="text-xs opacity-70 font-semibold uppercase">Retail Price</label>
                    <input name="retail_price" type="number" step="0.01" className="w-full bg-blue-800 border-none rounded-lg mt-1 px-3 py-2 text-white placeholder:text-blue-400 focus:ring-2 focus:ring-blue-400" placeholder="0.00" />
                </div>
            </div>
          </div>

          {/* ERROR LOG */}
          {actionData?.errors && (
             <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-xs text-red-600">
                <p className="font-bold mb-1">Server Errors:</p>
                <pre className="whitespace-pre-wrap">{JSON.stringify(actionData.errors, null, 2)}</pre>
             </div>
          )}
        </div>
      </Form>
    </div>
  );
}