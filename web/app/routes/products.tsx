import { useState, useEffect, useCallback } from "react";
import { useAuth } from "~/Context/AppContext";
import { useNavigate, useLoaderData } from "react-router";
import StorePicker from "~/components/StorePicker";

const PRODUCTS_API_URL = "http://127.0.0.1:8080/products_api/";
const NEW_PRODUCTS_API_URL = "http://127.0.0.1:8080/product_list/";
const CACHE_KEY = "msaidizi_products_cache";

export async function clientLoader() {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    try { return JSON.parse(cached); } catch (e) { return null; }
  }
  return null;
}

export default function Products() {
  const loaderData = useLoaderData();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [filter, setFilter] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [localProducts, setLocalProducts] = useState<any[]>([]);
  const [viewingProduct, setViewingProduct] = useState<any>(null);
  const [sellingId, setSellingId] = useState<number | null>(null);
  const [productToDelete, setProductToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState({ message: "", visible: false });

  const extractProducts = (data: any) => {
    if (!data) return [];
    return Array.isArray(data) ? data : data.results || [];
  };

  const syncWithServer = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(NEW_PRODUCTS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
        body: JSON.stringify({ current_store: localStorage.getItem("current_store") || null }),
      });

      if (res.ok) {
        const freshData = await res.json();
        const products = extractProducts(freshData);
        setLocalProducts(products);
        localStorage.setItem(CACHE_KEY, JSON.stringify(freshData));
      }
    } catch (err) {
      console.error("Sync failed:", err);
    } finally { setIsSyncing(false); }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) navigate("/login", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (loaderData) setLocalProducts(extractProducts(loaderData));
    syncWithServer();
  }, [loaderData, syncWithServer]);

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => setToast({ ...toast, visible: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSell = async (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    if (product.quantity_at_hand <= 0) return alert("Out of stock!");
    setSellingId(product.id);
    try {
      const res = await fetch(`${PRODUCTS_API_URL}${product.id}/sale/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
        body: JSON.stringify({ quantity: 1 }),
      });
      if (res.ok) {
        setToast({ message: "Sale recorded successfully!", visible: true });
        await syncWithServer();
      }
    } catch (err) {
      alert("Sale failed.");
    } finally { setSellingId(null); }
  };

  const executeDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${PRODUCTS_API_URL}${productToDelete.id}/delete/`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}` },
      });
      if (res.ok) {
        setLocalProducts(prev => prev.filter(p => p.id !== productToDelete.id));
        setToast({ message: "Product deleted", visible: true });
        setProductToDelete(null);
      }
    } finally { setIsDeleting(false); }
  };

  const filteredProducts = localProducts.filter((p: any) => {
    const searchStr = filter.toLowerCase();
    return p.name.toLowerCase().includes(searchStr) || 
           p.part_number?.toLowerCase().includes(searchStr) || 
           p.brand?.toLowerCase().includes(searchStr);
  });

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50 font-sans">
      <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Inventory</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`h-2 w-2 rounded-full ${isSyncing ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {isSyncing ? "Updating..." : "Live"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <StorePicker />
          <button 
            onClick={() => navigate("/products/create")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-100"
          >
            + Add Product
          </button>
        </div>
      </header>

      {toast.visible && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm">
          {toast.message}
        </div>
      )}

      <div className="mb-6">
        <div className="relative max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search part #, name, or brand..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold transition-all"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-[2.5rem] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Item Details</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Specs</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Retail Price</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Physical Stock</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredProducts.map((product) => (
              <tr 
                key={product.id} 
                onClick={() => setViewingProduct(product)}
                className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
              >
                <td className="px-8 py-6">
                  <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{product.name}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                    {product.brand} <span className="mx-1 text-gray-200">|</span> <span className="font-mono text-blue-500">{product.part_number}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                  <span className="px-2 py-1 bg-gray-100 rounded text-[9px] font-black text-gray-500 uppercase">
                    {product.material || "N/A"}
                  </span>
                </td>
                <td className="px-8 py-6 text-right font-black text-gray-900">
                  {Number(product.retail_price).toLocaleString()} <span className="text-[10px] text-gray-400">TZS</span>
                </td>
                <td className="px-8 py-6 text-center">
                  <div className={`inline-flex flex-col px-3 py-1 rounded-xl ${product.quantity_at_hand <= product.reorder_point ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                    <span className="text-sm font-black">{product.quantity_at_hand} {product.unit_of_measure}</span>
                    <span className="text-[8px] uppercase font-bold opacity-60">Available</span>
                  </div>
                </td>
                <td className="px-8 py-6" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-center gap-3">
                    <button 
                      onClick={(e) => handleSell(e, product)}
                      disabled={sellingId === product.id}
                      className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition active:scale-95 disabled:bg-gray-300"
                    >
                      {sellingId === product.id ? "..." : "Sell"}
                    </button>
                    <button onClick={() => navigate(`/products/${product.id}/edit`)} className="p-2 text-gray-400 hover:text-blue-600">✎</button>
                    <button onClick={(e) => { e.stopPropagation(); setProductToDelete(product); }} className="p-2 text-gray-400 hover:text-red-600">🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewingProduct && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-8">
              <div className="flex gap-4 items-center">
                {viewingProduct.product_photo && (
                  <img src={viewingProduct.product_photo} className="w-20 h-20 rounded-3xl object-cover border-4 border-gray-50" alt="" />
                )}
                <div>
                  <h2 className="text-2xl font-black text-gray-900 leading-tight">{viewingProduct.name}</h2>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{viewingProduct.brand} • {viewingProduct.part_number}</p>
                </div>
              </div>
              <button onClick={() => setViewingProduct(null)} className="text-3xl text-gray-300 hover:text-gray-900">×</button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="block text-[10px] font-black text-gray-400 uppercase mb-1">Buy Price</span>
                <span className="text-xl font-black text-gray-900">{Number(viewingProduct.buying_price).toLocaleString()}</span>
              </div>
              <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                <span className="block text-[10px] font-black text-blue-400 uppercase mb-1">Retail Price</span>
                <span className="text-xl font-black text-blue-700">{Number(viewingProduct.retail_price).toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-6 mb-10">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-2">Technical Info</h4>
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div><p className="text-gray-400 text-xs uppercase font-bold">Material</p><p className="font-bold text-gray-900">{viewingProduct.material || "Standard"}</p></div>
                <div><p className="text-gray-400 text-xs uppercase font-bold">Lead Free</p><p className="font-bold text-gray-900">{viewingProduct.is_lead_free ? "Yes" : "No"}</p></div>
                <div><p className="text-gray-400 text-xs uppercase font-bold">Max Pressure</p><p className="font-bold text-gray-900">{viewingProduct.max_pressure_psi || "N/A"} PSI</p></div>
                <div><p className="text-gray-400 text-xs uppercase font-bold">Bin Location</p><p className="font-bold text-indigo-600 font-mono">{viewingProduct.bin_location || "A-1"}</p></div>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setViewingProduct(null)} className="flex-1 py-4 bg-gray-100 text-gray-600 font-black rounded-2xl hover:bg-gray-200 transition">Close</button>
              <button onClick={() => navigate(`/products/${viewingProduct.id}/edit`)} className="flex-1 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition">Edit Details</button>
            </div>
          </div>
        </div>
      )}

      {productToDelete && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[110]">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-sm text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">🗑</div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Delete Item?</h3>
            <p className="text-gray-500 text-sm mb-8">This will permanently remove <span className="font-bold text-gray-900">{productToDelete.name}</span>.</p>
            <div className="flex flex-col gap-3">
              <button onClick={executeDelete} disabled={isDeleting} className="w-full py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition">
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
              <button onClick={() => setProductToDelete(null)} className="w-full py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}