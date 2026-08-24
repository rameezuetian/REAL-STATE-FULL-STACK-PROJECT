import React, { useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import {
  signInSuccess,
  updateUserFailure,
  updateUserStarts,
  updateUserSuccess,
  deleteUserFailure,
  deleteUserStarts,
  deleteUserSuccess,
  signOutUserStarts,
  signOutUserSuccess,
  signOutUserFailure,
} from "../redux/user/userSlice";

export default function Profile() {
  const { currentUser, loading, error } = useSelector(
    (state) => state.user
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fileRef = useRef(null);

  // ==========================================
  // FORM DATA
  // ==========================================

  const [formData, setFormData] = useState({
    username: currentUser?.username || "",
    email: currentUser?.email || "",
    password: "",
  });

  // ==========================================
  // PROFILE IMAGE
  // ==========================================

  const [image, setImage] = useState(
    currentUser?.avatar || ""
  );

  const [uploading, setUploading] = useState(false);

  const [success, setSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // ==========================================
  // LISTINGS
  // ==========================================

  const [showListings, setShowListings] = useState(false);
  const [listings, setListings] = useState([]);
  const [listingLoading, setListingLoading] = useState(false);
  const [listingError, setListingError] = useState("");

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  // ==========================================
  // IMAGE UPLOAD TO CLOUDINARY
  // ==========================================

  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Optional file size check
    if (file.size > 2 * 1024 * 1024) {
      setProfileError("Image must be less than 2 MB.");
      return;
    }

    setUploading(true);
    setSuccess("");
    setProfileError("");

    const cloudinaryFormData = new FormData();

    cloudinaryFormData.append("file", file);

    cloudinaryFormData.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
    );

    try {
      // Upload image to Cloudinary
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: cloudinaryFormData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error?.message || "Cloudinary upload failed"
        );
      }

      console.log("Cloudinary:", data);

      // Show uploaded image immediately
      setImage(data.secure_url);

      // ==========================================
      // SAVE IMAGE URL TO MONGODB
      // ==========================================

      const updateRes = await fetch(
        `/api/user/update/${currentUser._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: currentUser._id,
            avatar: data.secure_url,
          }),
        }
      );

      const updateUser = await updateRes.json();

      if (!updateRes.ok) {
        throw new Error(
          updateUser.message ||
            "Failed to update profile image"
        );
      }

      console.log("Updated User:", updateUser);

      // Update Redux
      dispatch(signInSuccess(updateUser));

      setSuccess(
        "Profile picture uploaded successfully! ✓"
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.log("Image upload failed:", error);

      setProfileError(
        error.message || "Image upload failed"
      );
    } finally {
      setUploading(false);

      // Reset file input
      if (fileRef.current) {
        fileRef.current.value = "";
      }
    }
  };

  // ==========================================
  // UPDATE USER
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccess("");
    setProfileError("");

    try {
      dispatch(updateUserStarts());

      const res = await fetch(
        `/api/user/update/${currentUser._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            id: currentUser._id,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        dispatch(updateUserFailure(data.message));

        setProfileError(data.message);

        return;
      }

      console.log("User updated:", data);

      // Update Redux
      dispatch(updateUserSuccess(data));

      // Update image if backend returns avatar
      if (data.avatar) {
        setImage(data.avatar);
      }

      // Update form data
      setFormData({
        username: data.username,
        email: data.email,
        password: "",
      });

      setSuccess("Profile updated successfully! ✓");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.log("Update failed:", error);

      dispatch(updateUserFailure(error.message));

      setProfileError(error.message);
    }
  };

  // ==========================================
  // SHOW USER LISTINGS
  // ==========================================

  const handleShowListings = async () => {
    // Hide listings if already visible
    if (showListings) {
      setShowListings(false);
      return;
    }

    setListingLoading(true);
    setListingError("");

    try {
      const res = await fetch(
        `/api/user/listings/${currentUser._id}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to fetch listings"
        );
      }

      console.log("User Listings:", data);

      setListings(data);
      setShowListings(true);
    } catch (error) {
      console.log("Get listings error:", error);

      setListingError(error.message);
    } finally {
      setListingLoading(false);
    }
  };

  // ==========================================
  // DELETE LISTING
  // ==========================================

  const handleDeleteListing = async (listingId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this listing?"
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `/api/listing/delete/${listingId}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to delete listing"
        );
      }

      // Remove listing from UI
      setListings((prevListings) =>
        prevListings.filter(
          (listing) => listing._id !== listingId
        )
      );

      setSuccess("Listing deleted successfully! ✓");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.log("Delete listing error:", error);

      setListingError(error.message);
    }
  };

  // ==========================================
  // DELETE USER
  // ==========================================

  const handleDeleteUser = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account?"
    );

    if (!confirmDelete) return;

    try {
      dispatch(deleteUserStarts());

      const res = await fetch(
        `/api/user/delete/${currentUser._id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok || data.success === false) {
        dispatch(
          deleteUserFailure(data.message)
        );

        setProfileError(data.message);

        return;
      }

      dispatch(deleteUserSuccess(data));

      navigate("/");
    } catch (error) {
      console.log("Delete user error:", error);

      dispatch(deleteUserFailure(error.message));

      setProfileError(error.message);
    }
  };

  // ==========================================
  // SIGN OUT
  // ==========================================

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStarts());

      const res = await fetch(
        "/api/auth/signout"
      );

      const data = await res.json();

      if (!res.ok || data.success === false) {
        dispatch(
          signOutUserFailure(data.message)
        );

        setProfileError(data.message);

        return;
      }

      dispatch(signOutUserSuccess(data));

      navigate("/sign-in");
    } catch (error) {
      console.log("Sign out error:", error);

      dispatch(
        signOutUserFailure(error.message)
      );

      setProfileError(error.message);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="p-3 max-w-4xl mx-auto">

      {/* ======================================
          TITLE
      ====================================== */}

      <h1 className="text-3xl font-semibold text-center my-7">
        Profile
      </h1>

      {/* ======================================
          PROFILE FORM
      ====================================== */}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 max-w-lg mx-auto"
      >

        {/* FILE INPUT */}

        <input
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
          onChange={handleFileChange}
        />

        {/* PROFILE IMAGE */}

        <img
          onClick={() =>
            !uploading &&
            fileRef.current?.click()
          }
          src={
            image ||
            "https://via.placeholder.com/150"
          }
          alt="profile"
          className={`rounded-full h-24 w-24 object-cover self-center mt-2 ${
            uploading
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer"
          }`}
        />

        {/* UPLOADING */}

        {uploading && (
          <p className="text-blue-600 text-sm text-center">
            Uploading image...
          </p>
        )}

        {/* SUCCESS */}

        {success && (
          <p className="text-green-600 text-sm text-center">
            {success}
          </p>
        )}

        {/* ERROR */}

        {(profileError || error) && (
          <p className="text-red-600 text-sm text-center">
            {profileError || error}
          </p>
        )}

        {/* USERNAME */}

        <input
          type="text"
          placeholder="Username"
          className="border p-3 rounded-lg"
          id="username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        {/* EMAIL */}

        <input
          type="email"
          placeholder="Email"
          className="border p-3 rounded-lg"
          id="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        {/* PASSWORD */}

        <input
          type="password"
          placeholder="New Password"
          className="border p-3 rounded-lg"
          id="password"
          value={formData.password}
          onChange={handleChange}
        />

        {/* UPDATE */}

        <button
          type="submit"
          disabled={loading || uploading}
          className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading
            ? "Updating..."
            : "Update"}
        </button>

        {/* CREATE LISTING */}

        <Link
          to="/create-listing"
          className="bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95"
        >
          Create Listing
        </Link>
      </form>

      {/* ======================================
          DELETE / SIGN OUT
      ====================================== */}

      <div className="flex justify-between max-w-lg mx-auto mt-5">

        <span
          onClick={handleDeleteUser}
          className="text-red-700 cursor-pointer hover:underline"
        >
          Delete Account
        </span>

        <span
          onClick={handleSignOut}
          className="text-red-700 cursor-pointer hover:underline"
        >
          Sign Out
        </span>

      </div>

      {/* ======================================
          SHOW LISTINGS BUTTON
      ====================================== */}

      <div className="text-center mt-8">

        <button
          onClick={handleShowListings}
          disabled={listingLoading}
          className="text-green-700 w-full hover:underline disabled:opacity-50"
        >
          {listingLoading
            ? "Loading Listings..."
            : showListings
            ? "Hide Listings"
            : "Show Listings"}
        </button>

      </div>

      {/* ======================================
          LISTING ERROR
      ====================================== */}

      {listingError && (
        <p className="text-red-700 mt-5 text-center">
          {listingError}
        </p>
      )}

      {/* ======================================
          USER LISTINGS
      ====================================== */}

      {showListings && (
        <div className="flex flex-col gap-4 mt-5">

          <h2 className="text-center text-2xl font-semibold">
            Your Listings
          </h2>

          {/* NO LISTINGS */}

          {listings.length === 0 && (
            <p className="text-center text-gray-500">
              You have not created any listings yet.
            </p>
          )}

          {/* LISTINGS */}

          {listings.map((listing) => (
            <div
              key={listing._id}
              className="border rounded-lg p-3 flex justify-between items-center gap-4"
            >

              {/* LISTING IMAGE */}

              <Link
                to={`/listing/${listing._id}`}
              >
                {listing.imageUrls &&
                listing.imageUrls.length > 0 ? (
                  <img
                    src={listing.imageUrls[0]}
                    alt="listing cover"
                    className="h-16 w-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-xs text-gray-500">
                      No Image
                    </span>
                  </div>
                )}
              </Link>

              {/* LISTING INFORMATION */}

              <Link
                to={`/listing/${listing._id}`}
                className="text-slate-700 font-semibold hover:underline truncate flex-1"
              >
                <p>
                  {listing.name}
                </p>

                <p className="text-sm text-gray-500">
                  ${listing.regularPrice}
                </p>
              </Link>

              {/* DELETE / EDIT */}

              <div className="flex flex-col items-center gap-2">

                <button
                  onClick={() =>
                    handleDeleteListing(
                      listing._id
                    )
                  }
                  className="text-red-700 uppercase hover:underline"
                >
                  Delete
                </button>

                <Link
                  to={`/update-listing/${listing._id}`}
                  className="text-green-700 uppercase hover:underline"
                >
                  Edit
                </Link>

              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}