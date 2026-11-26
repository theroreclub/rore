"use client";

import { useState } from "react";
import {
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/app/actions/address";
import { AddressInput } from "@/lib/validations/address";
import { Badge } from "@/components/ui/Badge";
import { Check, Edit2, MapPin, Plus, Trash2, X } from "lucide-react";

export interface SerializedAddress {
  id: string;
  fullName: string;
  phone: string | null;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface AddressManagementProps {
  initialAddresses: SerializedAddress[];
  onAddressCreated?: (newAddress: SerializedAddress) => void;
}

export function AddressManagement({
  initialAddresses,
  onAddressCreated,
}: AddressManagementProps) {
  const [addresses, setAddresses] = useState<SerializedAddress[]>(initialAddresses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SerializedAddress | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<AddressInput>({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "IN",
    isDefault: false,
  });

  const openCreateModal = () => {
    setEditingAddress(null);
    setFormData({
      fullName: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "IN",
      isDefault: addresses.length === 0,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (addr: SerializedAddress) => {
    setEditingAddress(addr);
    setFormData({
      fullName: addr.fullName,
      phone: addr.phone || "",
      street: addr.street,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      isDefault: addr.isDefault,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (editingAddress) {
      const res = await updateAddress(editingAddress.id, formData);
      if (!res.success) {
        setError(res.error || "Failed to update address");
        setIsSubmitting(false);
        return;
      }
      setAddresses((prev) =>
        prev.map((a) => {
          if (a.id === editingAddress.id) {
            return {
              ...a,
              ...formData,
              phone: formData.phone || null,
            };
          }
          if (formData.isDefault) {
            return { ...a, isDefault: false };
          }
          return a;
        })
      );
    } else {
      const res = await createAddress(formData);
      if (!res.success || !res.address) {
        setError(res.error || "Failed to save address");
        setIsSubmitting(false);
        return;
      }

      const created: SerializedAddress = {
        id: res.address.id,
        fullName: res.address.fullName,
        phone: res.address.phone,
        street: res.address.street,
        city: res.address.city,
        state: res.address.state,
        postalCode: res.address.postalCode,
        country: res.address.country,
        isDefault: res.address.isDefault,
      };

      if (created.isDefault) {
        setAddresses((prev) => [created, ...prev.map((a) => ({ ...a, isDefault: false }))]);
      } else {
        setAddresses((prev) => [...prev, created]);
      }

      if (onAddressCreated) {
        onAddressCreated(created);
      }
    }

    setIsSubmitting(false);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this delivery address?")) return;
    const res = await deleteAddress(id);
    if (res.success) {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } else {
      alert(res.error || "Failed to delete address");
    }
  };

  const handleSetDefault = async (id: string) => {
    const res = await setDefaultAddress(id);
    if (res.success) {
      setAddresses((prev) =>
        prev.map((a) => ({
          ...a,
          isDefault: a.id === id,
        }))
      );
    } else {
      alert(res.error || "Failed to set as default");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
            Delivery Addresses
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage your saved shipping destinations for swift checkout.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white uppercase tracking-wider transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Address</span>
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="p-8 rounded-2xl bg-zinc-900/30 border border-dashed border-zinc-800 text-center">
          <MapPin className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-xs text-zinc-400 font-medium">No saved addresses found.</p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-3 text-xs text-rose-400 hover:underline font-bold"
          >
            + Add your primary shipping address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                addr.isDefault
                  ? "bg-zinc-900/70 border-rose-500/50 shadow-lg shadow-rose-950/10"
                  : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-zinc-100">{addr.fullName}</span>
                  {addr.isDefault && (
                    <Badge variant="success" className="text-[10px]">
                      Default
                    </Badge>
                  )}
                </div>

                <div className="text-xs text-zinc-400 space-y-0.5">
                  <p className="text-zinc-300">{addr.street}</p>
                  <p>
                    {addr.city}, {addr.state} {addr.postalCode}
                  </p>
                  <p>{addr.country}</p>
                  {addr.phone && <p className="text-zinc-500 mt-1 font-mono">Ph: {addr.phone}</p>}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60 text-xs">
                {!addr.isDefault ? (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span className="text-zinc-500 text-[11px] flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-400" />
                    Primary
                  </span>
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openEditModal(addr)}
                    className="text-zinc-400 hover:text-white p-1"
                    title="Edit address"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(addr.id)}
                    className="text-zinc-500 hover:text-rose-400 p-1"
                    title="Delete address"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white uppercase tracking-tight">
              {editingAddress ? "Edit Delivery Address" : "Add New Address"}
            </h3>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Kenji Sato"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                  Phone Number (For Delivery Updates) *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                  Street Address & Flat / Building *
                </label>
                <input
                  type="text"
                  required
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="Flat 402, Neo Tower, 12th Main Road"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Mumbai"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                    State / Region *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Maharashtra"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                    PIN / Postal Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="400001"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4 rounded bg-zinc-950 border-zinc-800 text-rose-600 focus:ring-0"
                />
                <label htmlFor="isDefault" className="text-xs text-zinc-300 cursor-pointer">
                  Set as my default shipping address
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
