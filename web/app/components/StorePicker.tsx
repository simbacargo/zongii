import React, { useEffect, useState } from "react";
import { useAuth } from "../Context/AppContext";

export default function StorePicker() {
  // 1. Pull the global values from your Context
  const { isAuthenticated, current_store, set_current_store } = useAuth();

  // 2. Local state only for things this component "owns" (like the dropdown being open)
  const [open, setOpen] = useState(false);
  const [stores, setStores] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<string | null>(null);

  // 3. Fetch Subscription and Stores
  useEffect(() => {
    async function fetchSubscription() {
      try {
        const token = localStorage.getItem("access_token");

        const response = await fetch("http://127.0.0.1:8080/subscription/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch subscription");

        const data = await response.json();
        setSubscription(data[0].tier);

        // Fetch stores if they have the right tier
        if (data[0].tier === "P" || data[0].tier === "U") {
          fetchStores();
        }
      } catch (error) {
        console.error("Error fetching subscription details:", error);
      }
    }

    async function fetchStores() {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch("http://127.0.0.1:8080/stores_api/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch stores");

        const data = await response.json();
        setStores(data);
      } catch (error) {
        console.error("Error fetching stores:", error);
      }
    }

    if (isAuthenticated) {
      fetchSubscription();
    }
  }, [isAuthenticated]);

  // 4. Default Store Logic
  // If we have stores but NO current_store is selected yet, pick the first one
  useEffect(() => {
    if (!current_store && stores.length > 0) {
      set_current_store(stores[0].name);
    }
  }, [stores, current_store, set_current_store]);

  // If not logged in, don't show the picker
  if (!isAuthenticated) return null;

  return (
    <div className="relative inline-block text-left">
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex justify-center items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
      >
        {current_store ? `Store: ${current_store}` : "Select Store"}
        <span>{open ? "▲" : "▼"}</span>
      </button>

      {/* Dropdown Menu */}
      {open && (
        <>
          {/* Invisible backdrop to close the menu when clicking outside */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          ></div>

          <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-2xl z-20 border border-gray-100">
            <div className="py-2">
              <div className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Your Stores
              </div>
              
              {stores.length > 0 ? (
                stores.map((store: any) => (
                  <button
                    key={store.id}
                    className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                      current_store === store.name
                        ? "bg-indigo-50 text-indigo-700 font-bold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => {
                      // UPDATE THE GLOBAL CONTEXT HERE
                      set_current_store(store.name);
                      setOpen(false);
                    }}
                  >
                    {store.name}
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500 italic">
                  No stores found...
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}