"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const emptyForm = {
  username: "",
  email: "",
  address: "",
  telp_number: "",
  birth_date: "",
  gender: "",
  last_edu: "",
  doctor: "",
};

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [formData, setFormData] = useState(emptyForm);
  const [selectedUser, setSelectedUser] = useState(null);

  const [message, setMessage] = useState("");
  const [errorText, setErrorText] = useState("");

  const fetchProfiles = async () => {
    setLoading(true);
    setErrorText("");

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, username, email, exp, streak, level, nextLevelXp, bio, telp_number, birth_date, gender, address, last_edu, doctor"
      )
      .order("username", { ascending: true });

    if (error) {
      console.error(error);
      setErrorText(error.message || "Gagal mengambil data profiles.");
      setProfiles([]);
    } else {
      setProfiles(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();

    const channel = supabase
      .channel("profiles-admin-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
        },
        () => {
          fetchProfiles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredProfiles = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return profiles;

    return profiles.filter((user) => {
      return (
        user.username?.toLowerCase().includes(keyword) ||
        user.email?.toLowerCase().includes(keyword) ||
        user.address?.toLowerCase().includes(keyword) ||
        user.gender?.toLowerCase().includes(keyword) ||
        user.doctor?.toLowerCase().includes(keyword)
      );
    });
  }, [profiles, search]);

  const totalUsers = profiles.length;
  const totalDoctors = profiles.filter((user) => user.doctor).length;
  const totalWithEmail = profiles.filter((user) => user.email).length;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setSelectedUser(null);
    setMessage("");
    setErrorText("");
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const openEditModal = (user) => {
    setSelectedUser(user);

    setFormData({
      username: user.username || "",
      email: user.email || "",
      address: user.address || "",
      telp_number: user.telp_number || "",
      birth_date: user.birth_date || "",
      gender: user.gender || "",
      last_edu: user.last_edu || "",
      doctor: user.doctor || "",
    });

    setMessage("");
    setErrorText("");
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    resetForm();
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      return "Username wajib diisi.";
    }

    if (!formData.email.trim()) {
      return "Email wajib diisi.";
    }

    if (!formData.email.includes("@")) {
      return "Format email belum benar.";
    }

    return "";
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setErrorText(validationError);
      return;
    }

    setSaving(true);
    setErrorText("");
    setMessage("");

    const newProfile = {
      id: crypto.randomUUID(),
      username: formData.username.trim(),
      email: formData.email.trim(),
      address: formData.address.trim() || null,
      telp_number: formData.telp_number.trim() || null,
      birth_date: formData.birth_date || null,
      gender: formData.gender || null,
      last_edu: formData.last_edu.trim() || null,
      doctor: formData.doctor.trim() || null,
      exp: 0,
      streak: 0,
      level: 1,
      nextLevelXp: 260,
    };

    const { error } = await supabase.from("profiles").insert([newProfile]);

    if (error) {
      console.error(error);
      setErrorText(error.message || "Gagal menambahkan user.");
      setSaving(false);
      return;
    }

    setMessage("User berhasil ditambahkan.");
    await fetchProfiles();

    setSaving(false);

    setTimeout(() => {
      closeAddModal();
    }, 700);
  };

  const handleEditUser = async (e) => {
    e.preventDefault();

    if (!selectedUser?.id) {
      setErrorText("User tidak ditemukan.");
      return;
    }

    const validationError = validateForm();

    if (validationError) {
      setErrorText(validationError);
      return;
    }

    setSaving(true);
    setErrorText("");
    setMessage("");

    const updatedProfile = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      address: formData.address.trim() || null,
      telp_number: formData.telp_number.trim() || null,
      birth_date: formData.birth_date || null,
      gender: formData.gender || null,
      last_edu: formData.last_edu.trim() || null,
      doctor: formData.doctor.trim() || null,
    };

    const { error } = await supabase
      .from("profiles")
      .update(updatedProfile)
      .eq("id", selectedUser.id);

    if (error) {
      console.error(error);
      setErrorText(error.message || "Gagal mengupdate user.");
      setSaving(false);
      return;
    }

    setMessage("User berhasil diupdate.");
    await fetchProfiles();

    setSaving(false);

    setTimeout(() => {
      closeEditModal();
    }, 700);
  };

  const handleDeleteUser = async (user) => {
    const confirmDelete = confirm(
      `Yakin mau hapus profile ${user.username || user.email}?`
    );

    if (!confirmDelete) return;

    setErrorText("");
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", user.id);

    if (error) {
      console.error(error);
      setErrorText(error.message || "Gagal menghapus user.");
      return;
    }

    setMessage("Profile berhasil dihapus.");
    await fetchProfiles();
  };

  return (
    <main className="min-h-screen bg-[#d4eefc] px-8 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0c72a6]">
              User Management
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Data user diambil langsung dari table profiles.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="rounded-full bg-[#0c72a6] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
          >
            + Add User
          </button>
        </div>

        {message && (
          <div className="mb-4 rounded-xl bg-green-100 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {errorText && (
          <div className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-700">
            {errorText}
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Profiles</p>
            <p className="mt-2 text-3xl font-bold text-[#0c72a6]">
              {totalUsers}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Profiles with Email</p>
            <p className="mt-2 text-3xl font-bold text-[#0c72a6]">
              {totalWithEmail}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Profiles with Doctor</p>
            <p className="mt-2 text-3xl font-bold text-[#0c72a6]">
              {totalDoctors}
            </p>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-md">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by username, email, address..."
              className="w-full rounded-full border border-gray-300 px-5 py-3 text-sm outline-none md:max-w-md"
            />

            <button
              onClick={fetchProfiles}
              className="rounded-full border border-[#0c72a6] px-5 py-3 text-sm font-semibold text-[#0c72a6] transition hover:bg-[#0c72a6] hover:text-white"
            >
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse">
              <thead>
                <tr className="border-b bg-[#f4fbff] text-left text-sm text-[#0c72a6]">
                  <th className="px-4 py-3">No</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3">Level</th>
                  <th className="px-4 py-3">EXP</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-4 py-8 text-center text-sm text-gray-500"
                    >
                      Loading data...
                    </td>
                  </tr>
                ) : filteredProfiles.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-4 py-8 text-center text-sm text-gray-500"
                    >
                      Belum ada data user.
                    </td>
                  </tr>
                ) : (
                  filteredProfiles.map((user, index) => (
                    <tr
                      key={user.id}
                      className="border-b text-sm text-gray-700 hover:bg-[#f8fcff]"
                    >
                      <td className="px-4 py-3">{index + 1}</td>
                      <td className="px-4 py-3 font-semibold">
                        {user.username || "-"}
                      </td>
                      <td className="px-4 py-3">{user.email || "-"}</td>
                      <td className="px-4 py-3">{user.gender || "-"}</td>
                      <td className="px-4 py-3">{user.telp_number || "-"}</td>
                      <td className="px-4 py-3">{user.address || "-"}</td>
                      <td className="px-4 py-3">{user.level ?? "-"}</td>
                      <td className="px-4 py-3">{user.exp ?? "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="rounded-full bg-[#efc6dc] px-4 py-2 text-xs font-semibold text-[#9b3d71] transition hover:opacity-80"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="rounded-full bg-red-100 px-4 py-2 text-xs font-semibold text-red-600 transition hover:opacity-80"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAddModal && (
        <UserModal
          title="Add User"
          formData={formData}
          handleChange={handleChange}
          onSubmit={handleAddUser}
          onClose={closeAddModal}
          saving={saving}
          errorText={errorText}
          message={message}
        />
      )}

      {showEditModal && (
        <UserModal
          title="Edit User"
          formData={formData}
          handleChange={handleChange}
          onSubmit={handleEditUser}
          onClose={closeEditModal}
          saving={saving}
          errorText={errorText}
          message={message}
        />
      )}
    </main>
  );
}

function UserModal({
  title,
  formData,
  handleChange,
  onSubmit,
  onClose,
  saving,
  errorText,
  message,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#0c72a6]">{title}</h2>

          <button
            onClick={onClose}
            className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600"
          >
            Close
          </button>
        </div>

        {message && (
          <div className="mb-4 rounded-xl bg-green-100 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {errorText && (
          <div className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-700">
            {errorText}
          </div>
        )}

        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none"
              placeholder="Username"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none"
              placeholder="email@gmail.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">
              Phone Number
            </label>
            <input
              type="text"
              name="telp_number"
              value={formData.telp_number}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none"
              placeholder="08xxxxxxxxxx"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">
              Birth Date
            </label>
            <input
              type="date"
              name="birth_date"
              value={formData.birth_date}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none"
            >
              <option value="">Pilih gender</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">
              Last Education
            </label>
            <input
              type="text"
              name="last_edu"
              value={formData.last_edu}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none"
              placeholder="SMA / S1 / dll"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-gray-600">
              Doctor
            </label>
            <input
              type="text"
              name="doctor"
              value={formData.doctor}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none"
              placeholder="Nama dokter / counselor"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-gray-600">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="min-h-[90px] w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none"
              placeholder="Alamat user"
            />
          </div>

          <div className="mt-2 flex justify-end gap-3 md:col-span-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-600"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[#0c72a6] px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}