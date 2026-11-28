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

  const [notice, setNotice] = useState("");

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

    setNotice(editingAddress ? "Address updated." : "Delivery address saved.");
    setIsSubmitting(false);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this delivery address?")) return;
    const res = await deleteAddress(id);
    if (res.success) {
      setNotice("Address removed.");
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } else {
      alert(res.error || "Failed to delete address");
    }
  };

  const handleSetDefault = async (id: string) => {
    const res = await setDefaultAddress(id);
    if (res.success) {
      setNotice("Default address updated.");
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
      {notice && <p role="status" className="text-sm">{notice}</p>}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-shop-ink uppercase tracking-wider">
            Delivery Addresses
          </h3>
          <p className="text-xs text-shop-muted mt-0.5">
            Choose where your orders are delivered.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-shop-soft hover:bg-shop-rule text-xs font-bold text-shop-ink uppercase tracking-wider transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Address</span>
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="p-8 rounded-md bg-shop-card border border-dashed border-shop-rule text-center">
          <MapPin className="w-8 h-8 text-shop-muted mx-auto mb-2" />
          <p className="text-xs text-shop-muted font-medium">No saved addresses yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-5 rounded-md border transition-all flex flex-col justify-between gap-4 ${
                addr.isDefault
                  ? "bg-shop-card border-shop-wine shadow-lg shadow-rose-950/10"
                  : "bg-shop-card border-shop-rule hover:border-shop-rule"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-shop-ink">{addr.fullName}</span>
                  {addr.isDefault && (
                    <Badge variant="success" className="text-[10px]">
                      Default
                    </Badge>
                  )}
                </div>

                <div className="text-xs text-shop-muted space-y-0.5">
                  <p className="text-shop-ink">{addr.street}</p>
                  <p>
                    {addr.city}, {addr.state} {addr.postalCode}
                  </p>
                  <p>{addr.country}</p>
                  {addr.phone && <p className="text-shop-muted mt-1"><a className="contact-link" href={`tel:${addr.phone.replace(/[^+0-9]/g, "")}`}>{addr.phone}</a></p>}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-shop-rule text-xs">
                {!addr.isDefault ? (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-shop-muted hover:text-shop-ink transition-colors"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span className="text-shop-muted text-[11px] flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-800" />
                    Primary
                  </span>
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openEditModal(addr)}
                    className="text-shop-muted hover:text-shop-ink p-1"
                    title="Edit address"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(addr.id)}
                    className="text-shop-muted hover:text-shop-wine p-1"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#261116]/55 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-lg bg-shop-card border border-shop-rule shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              aria-label="Close address form" onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-shop-muted hover:text-shop-ink p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-shop-ink uppercase tracking-tight">
              {editingAddress ? "Edit Delivery Address" : "Add New Address"}
            </h3>

            {error && (
              <div role="alert" className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-shop-wine">
                {error}
              </div>
            )}

            <form onSubmit={async event => { try { await handleSubmit(event); } catch { setError("Couldn’t save the address. Please try again."); setIsSubmitting(false); } }} className="mt-6 space-y-4">
              <div>
                <label htmlFor="delivery-fullName" className="block text-xs font-semibold uppercase tracking-wider text-shop-ink mb-1">
                  Recipient Full Name *
                </label>
                <input id="delivery-fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}

                  className="w-full px-3.5 py-2.5 bg-shop-soft border border-shop-rule rounded-xl text-sm text-shop-ink placeholder-shop-muted focus:outline-none focus:border-shop-wine"
                />
              </div>

              <div>
                <label htmlFor="delivery-phone" className="block text-xs font-semibold uppercase tracking-wider text-shop-ink mb-1">
                  Phone Number (For Delivery Updates) *
                </label>
                <input id="delivery-phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}

                  className="w-full px-3.5 py-2.5 bg-shop-soft border border-shop-rule rounded-xl text-sm text-shop-ink placeholder-shop-muted focus:outline-none focus:border-shop-wine"
                />
              </div>

              <div>
                <label htmlFor="delivery-street" className="block text-xs font-semibold uppercase tracking-wider text-shop-ink mb-1">
                  Street Address & Flat / Building *
                </label>
                <input id="delivery-street"
                  type="text"
                  required
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}

                  className="w-full px-3.5 py-2.5 bg-shop-soft border border-shop-rule rounded-xl text-sm text-shop-ink placeholder-shop-muted focus:outline-none focus:border-shop-wine"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="delivery-city" className="block text-xs font-semibold uppercase tracking-wider text-shop-ink mb-1">
                    City *
                  </label>
                  <input id="delivery-city"
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}

                    className="w-full px-3.5 py-2.5 bg-shop-soft border border-shop-rule rounded-xl text-sm text-shop-ink placeholder-shop-muted focus:outline-none focus:border-shop-wine"
                  />
                </div>

                <div>
                  <label htmlFor="delivery-state" className="block text-xs font-semibold uppercase tracking-wider text-shop-ink mb-1">
                    State / Region *
                  </label>
                  <input id="delivery-state"
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}

                    className="w-full px-3.5 py-2.5 bg-shop-soft border border-shop-rule rounded-xl text-sm text-shop-ink placeholder-shop-muted focus:outline-none focus:border-shop-wine"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="delivery-postalCode" className="block text-xs font-semibold uppercase tracking-wider text-shop-ink mb-1">
                    PIN / Postal Code *
                  </label>
                  <input id="delivery-postalCode"
                    type="text"
                    required
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}

                    className="w-full px-3.5 py-2.5 bg-shop-soft border border-shop-rule rounded-xl text-sm text-shop-ink placeholder-shop-muted focus:outline-none focus:border-shop-wine"
                  />
                </div>

                <div>
                  <label htmlFor="delivery-country" className="block text-xs font-semibold uppercase tracking-wider text-shop-ink mb-1">
                    Country *
                  </label>
                  <input id="delivery-country"
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-shop-soft border border-shop-rule rounded-xl text-sm text-shop-ink focus:outline-none focus:border-shop-wine"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4 rounded bg-shop-soft border-shop-rule text-shop-wine focus:ring-0"
                />
                <label htmlFor="isDefault" className="text-xs text-shop-ink cursor-pointer">
                  Set as my default shipping address
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-shop-rule">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-shop-soft hover:bg-shop-rule text-xs font-bold text-shop-ink uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-shop-wine hover:bg-[#41151b] text-shop-ivory text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50"
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
