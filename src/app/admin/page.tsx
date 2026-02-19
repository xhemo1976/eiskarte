"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

interface Flavor {
  id: number;
  name: string;
  price: number;
  ingredients: string;
  additives: string;
  allergens: string;
  available: boolean;
  sortOrder: number;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    ingredients: "",
    additives: "",
    allergens: "",
    available: true,
  });

  const fetchFlavors = useCallback(async () => {
    const res = await fetch("/api/flavors");
    const data = await res.json();
    setFlavors(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
    if (status === "authenticated") {
      fetchFlavors();
    }
  }, [status, router, fetchFlavors]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Laden...</p>
      </div>
    );
  }

  if (!session) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      name: formData.name,
      price: formData.price,
      ingredients: formData.ingredients,
      additives: formData.additives,
      allergens: formData.allergens,
      available: formData.available,
    };

    if (editingId) {
      await fetch(`/api/flavors/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/flavors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    resetForm();
    fetchFlavors();
  }

  function resetForm() {
    setFormData({
      name: "",
      price: "",
      ingredients: "",
      additives: "",
      allergens: "",
      available: true,
    });
    setEditingId(null);
    setShowForm(false);
  }

  function editFlavor(flavor: Flavor) {
    setFormData({
      name: flavor.name,
      price: String(flavor.price),
      ingredients: flavor.ingredients,
      additives: flavor.additives,
      allergens: flavor.allergens,
      available: flavor.available,
    });
    setEditingId(flavor.id);
    setShowForm(true);
  }

  async function deleteFlavor(id: number) {
    if (!confirm("Eissorte wirklich löschen?")) return;
    await fetch(`/api/flavors/${id}`, { method: "DELETE" });
    fetchFlavors();
  }

  async function toggleAvailable(flavor: Flavor) {
    await fetch(`/api/flavors/${flavor.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !flavor.available }),
    });
    fetchFlavors();
  }

  async function generateQR() {
    const res = await fetch("/api/qrcode");
    const data = await res.json();
    setQrCode(data.qrCode);
    setQrUrl(data.url);
    setShowQR(true);
  }

  function downloadQR() {
    const link = document.createElement("a");
    link.download = "eiskarte-qr-code.png";
    link.href = qrCode;
    link.click();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Eiskarte verwalten</h1>
          <p className="text-sm text-gray-500">Angemeldet als {session.user?.name}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={generateQR}
            className="bg-emerald-600 text-white px-4 py-2 rounded-md text-sm hover:bg-emerald-700"
          >
            QR-Code
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-300"
          >
            Abmelden
          </button>
        </div>
      </header>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4">QR-Code</h2>
            <p className="text-sm text-gray-500 mb-3 break-all">URL: {qrUrl}</p>
            {qrCode && (
              <img src={qrCode} alt="QR Code" className="mx-auto mb-4" />
            )}
            <div className="flex gap-2">
              <button
                onClick={downloadQR}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700"
              >
                Herunterladen
              </button>
              <button
                onClick={() => setShowQR(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md text-sm hover:bg-gray-300"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      <div className="mb-6">
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
          >
            + Neue Eissorte
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-lg font-bold">
              {editingId ? "Eissorte bearbeiten" : "Neue Eissorte"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="z.B. Vanille"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preis (EUR) *</label>
                <input
                  type="number"
                  step="0.10"
                  min="0"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1.50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zutaten</label>
              <textarea
                value={formData.ingredients}
                onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Milch, Sahne, Zucker, ..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zusatzstoffe</label>
              <textarea
                value={formData.additives}
                onChange={(e) => setFormData({ ...formData, additives: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Emulgator (Sojalecithin), ..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Allergene</label>
              <textarea
                value={formData.allergens}
                onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Milch, Ei, Soja, ..."
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="available"
                checked={formData.available}
                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                className="h-4 w-4"
              />
              <label htmlFor="available" className="text-sm text-gray-700">Verfügbar</label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
              >
                {editingId ? "Speichern" : "Hinzufügen"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-300"
              >
                Abbrechen
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Flavor Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-700">#</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Preis</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Allergene</th>
                <th className="text-center px-4 py-3 font-medium text-gray-700">Verfügbar</th>
                <th className="text-right px-4 py-3 font-medium text-gray-700">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {flavors.map((flavor) => (
                <tr key={flavor.id} className={!flavor.available ? "opacity-50" : ""}>
                  <td className="px-4 py-3 text-gray-400">{flavor.sortOrder}</td>
                  <td className="px-4 py-3 font-medium">{flavor.name}</td>
                  <td className="px-4 py-3">{flavor.price.toFixed(2)} &euro;</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {flavor.allergens || "-"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleAvailable(flavor)}
                      className={`inline-block w-10 h-6 rounded-full relative transition-colors ${
                        flavor.available ? "bg-emerald-500" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          flavor.available ? "left-4.5" : "left-0.5"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => editFlavor(flavor)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      Bearbeiten
                    </button>
                    <button
                      onClick={() => deleteFlavor(flavor.id)}
                      className="text-red-600 hover:text-red-800 text-xs font-medium"
                    >
                      Löschen
                    </button>
                  </td>
                </tr>
              ))}
              {flavors.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    Noch keine Eissorten vorhanden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 text-center">
        <a href="/" target="_blank" className="text-blue-600 hover:text-blue-800 text-sm">
          Öffentliche Eiskarte ansehen &rarr;
        </a>
      </div>
    </div>
  );
}
