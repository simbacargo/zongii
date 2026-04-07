import {
  useNavigate,
  Form,
  useNavigation,
  useLoaderData,
  useActionData,
  redirect,
} from "react-router";
import { useEffect, useState } from "react";
import StorePicker from "~/components/StorePicker";

// Helper to build the URL dynamically
const get_server_url = (id: string | undefined) =>
  `http://127.0.0.1:8080/api/productdetails/${id}/`;

/**
 * 1. LOADER
 */
export async function clientLoader({ params }: any) {
  const token = localStorage.getItem("access_token");
  if (!token) throw redirect("/login");

  const response = await fetch(`${get_server_url(params.productId)}?t=${Date.now()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Could not fetch product details");
  return response.json();
}

/**
 * 2. ACTION
 */
export async function clientAction({ request, params }: any) {
  const formData = await request.formData();
  const productId = params.productId;
  const token = localStorage.getItem("access_token");

  // --- LOGIC TO FIX "INVALID IMAGE" ERROR ---
  const photo = formData.get("product_photo");
  // If the user didn't select a file, the input sends an empty string or a 0-byte file.
  // We delete it so Django doesn't try to validate an "empty" image.
  if (!photo || !(photo instanceof File) || photo.size === 0) {
    formData.delete("product_photo");
  }

  // --- MAP UI FIELDS TO DJANGO MODEL FIELDS ---
  // If your form uses "quantity", but Django expects "quantity_at_hand"
  const qty = formData.get("quantity");
  if (qty) formData.append("quantity_at_hand", qty);
  
  const price = formData.get("price");
  if (price) formData.append("retail_price", price);

  try {
    const response = await fetch(get_server_url(productId), {
      method: "PATCH", // Use PATCH for partial updates (better for images)
      headers: {
        // DO NOT set 'Content-Type': 'application/json' or 'multipart/form-data'
        // The browser sets the boundary automatically for FormData
        Authorization: `Bearer ${token || ""}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      // Return the specific error from Django (e.g., product_photo: ["valid image required"])
      const errorMessage = result.product_photo 
        ? `Photo Error: ${result.product_photo[0]}` 
        : result.detail || "Failed to update product.";
        
      return { status: "error", message: errorMessage };
    }

    return { status: "success", message: "Product updated successfully!" };
  } catch (err) {
    return { status: "error", message: "A network error occurred." };
  }
}

/**
 * 3. COMPONENT
 */
export default function Product() {
  const product = useLoaderData() as any;
  const actionData = useActionData() as { status: string; message: string } | undefined;

  const navigate = useNavigate();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (actionData) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [actionData]);

  const inputStyle =
    "w-full border-gray-300 border rounded-lg p-2.5 text-gray-500 focus:text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white";

  return (
    <div className="min-h-screen bg-gray-100 p-6 relative font-sans">
      <header className="p-4 rounded-md text-xl font-semibold flex justify-end items-center mb-2">
        <StorePicker />
      </header>

      {/* Toast Notification */}
      {showToast && actionData && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center p-4 w-full max-w-xs text-white rounded-lg shadow-2xl ${
            actionData.status === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          <div className="text-sm font-medium flex-1">{actionData.message}</div>
          <button onClick={() => setShowToast(false)} className="ml-4 text-white font-bold">✕</button>
        </div>
      )}

      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        <div className="bg-white border-b p-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Edit Product</h1>
            <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">
              Product ID: {product.id}
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            &times;
          </button>
        </div>

        {/* Note the encType="multipart/form-data" */}
        <Form method="post" encType="multipart/form-data" className="p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* PHOTO UPLOAD FIELD */}
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Update Product Photo</label>
            <input 
              type="file" 
              name="product_photo" 
              accept="image/*"
              className={`${inputStyle} file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100`}
            />
            {product.product_photo && (
                <p className="text-[10px] text-gray-400 mt-1 italic truncate">Current file path: {product.product_photo}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Product Name</label>
            <input type="text" name="name" className={inputStyle} defaultValue={product.name} required />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Description</label>
            <textarea name="description" rows={2} className={inputStyle} defaultValue={product.description} />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Brand</label>
            <input type="text" name="brand" className={inputStyle} defaultValue={product.brand} />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Part Number</label>
            <input type="text" name="part_number" className={inputStyle} defaultValue={product.part_number} />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold text-blue-600 uppercase ml-1">Quantity in Store</label>
            <input 
              type="number" 
              name="quantity" 
              className={`${inputStyle} border-blue-200 text-blue-900 font-semibold`} 
              defaultValue={product.quantity_at_hand ?? product.quantity} 
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Buying Price</label>
            <input type="text" name="buying_price" className={inputStyle} defaultValue={product.buying_price} />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Selling Price</label>
            <input type="text" name="price" className={inputStyle} defaultValue={product.retail_price ?? product.price} />
          </div>

          {/* FORM ACTIONS */}
          <div className="md:col-span-2 mt-6 pt-6 border-t flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2.5 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg disabled:bg-indigo-300 transition-all"
            >
              {isSubmitting ? "Saving..." : "Update Product"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}