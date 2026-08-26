import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function CreateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const userId = currentUser?._id || currentUser?.id;

  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);

  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);

  const [uploadError, setUploadError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    sale: false,
    rent: false,
    parking: false,
    furnished: false,
    offer: false,
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: "",
    discountPrice: "",
  });

  // ==============================
  // HANDLE INPUT CHANGE
  // ==============================

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  // ==============================
  // CLOUDINARY IMAGE UPLOAD
  // ==============================

  const storeImage = async (file) => {
    const formData = new FormData();

    formData.append("file", file);

    formData.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
    );

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.error?.message || "Cloudinary image upload failed"
      );
    }

    return data.secure_url;
  };

  // ==============================
  // IMAGE SELECT
  // ==============================

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);

    setUploadError("");
    setSuccess("");

    if (selectedFiles.length === 0) {
      return;
    }

    // Check each file is an image
    const invalidFile = selectedFiles.find(
      (file) => !file.type.startsWith("image/")
    );

    if (invalidFile) {
      setUploadError("Only image files are allowed.");
      return;
    }

    // Maximum 6 images
    if (imageUrls.length + selectedFiles.length > 6) {
      setUploadError("You can upload a maximum of 6 images.");
      return;
    }

    setFiles(selectedFiles);
  };

  // ==============================
  // UPLOAD IMAGES
  // ==============================

  const handleImageSubmit = async (e) => {
    e.preventDefault();

    if (files.length === 0) {
      setUploadError("Please select images first.");
      return;
    }

    if (imageUrls.length + files.length > 6) {
      setUploadError("You can upload a maximum of 6 images.");
      return;
    }

    try {
      setUploading(true);
      setUploadError("");
      setSuccess("");

      const promises = files.map((file) => storeImage(file));

      const urls = await Promise.all(promises);

      setImageUrls((prev) => [...prev, ...urls]);

      // Clear selected files
      setFiles([]);

      // Reset file input
      e.target.value = "";

      setSuccess("Images uploaded successfully!");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.log("Image upload error:", error);

      setUploadError(
        error.message || "Image upload failed"
      );
    } finally {
      setUploading(false);
    }
  };

  // ==============================
  // REMOVE IMAGE
  // ==============================

  const handleRemoveImage = (index) => {
    setImageUrls((prev) =>
      prev.filter((_, i) => i !== index)
    );

    setSuccess("");
  };

  // ==============================
  // CREATE LISTING
  // ==============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setUploadError("");
    setSuccess("");

    // Check login
    if (!userId) {
      setUploadError("You must be logged in to create a listing.");
      return;
    }

    // Check images
    if (imageUrls.length === 0) {
      setUploadError("Please upload at least one image.");
      return;
    }

    if (imageUrls.length > 6) {
      setUploadError("You can upload a maximum of 6 images.");
      return;
    }

    // Check discount price
    if (
      Number(formData.discountPrice) >
      Number(formData.regularPrice)
    ) {
      setUploadError(
        "Discount price cannot be greater than regular price."
      );
      return;
    }

    try {
      setCreating(true);

      const listingData = {
        name: formData.name,
        description: formData.description,
        address: formData.address,

        regularPrice: Number(formData.regularPrice),
        discountPrice: Number(formData.discountPrice),

        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        type: formData.rent ? "rent" : "sale",

        furnished: formData.furnished,
        parking: formData.parking,
        offer: formData.offer,

        sale: formData.sale,
        rent: formData.rent,

        imageUrls: imageUrls,

        // Current logged-in user
        userRef: userId,
      };

      console.log("Listing data:", listingData);

      const res = await fetch(
        "/api/listing/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(listingData),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to create listing"
        );
      }

      console.log("Listing created:", data);

      setSuccess("Listing created successfully!");

      // Clear form
      setFormData({
        name: "",
        description: "",
        address: "",
        sale: false,
        rent: false,
        parking: false,
        furnished: false,
        offer: false,
        bedrooms: 1,
        bathrooms: 1,
        regularPrice: "",
        discountPrice: "",
      });

      setImageUrls([]);
      setFiles([]);

      // Navigate to created listing
      navigate(`/listing/${data._id}`);

    } catch (error) {
      console.log("Create listing error:", error);

      setUploadError(
        error.message || "Failed to create listing"
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="p-3 max-w-4xl mx-auto">

      <h1 className="text-3xl font-semibold text-center my-7">
        Create a Listing
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-4"
      >

        {/* =========================
            LEFT SIDE
        ========================== */}

        <div className="flex flex-col gap-4 flex-1">

          {/* NAME */}

          <input
            type="text"
            placeholder="Name"
            className="border p-3 rounded-lg"
            id="name"
            maxLength="62"
            minLength="10"
            required
            value={formData.name}
            onChange={handleChange}
          />

          {/* DESCRIPTION */}

          <textarea
            placeholder="Description"
            className="border p-3 rounded-lg"
            id="description"
            maxLength="500"
            minLength="10"
            required
            value={formData.description}
            onChange={handleChange}
          />

          {/* ADDRESS */}

          <input
            type="text"
            placeholder="Address"
            className="border p-3 rounded-lg"
            id="address"
            maxLength="100"
            minLength="10"
            required
            value={formData.address}
            onChange={handleChange}
          />

          {/* CHECKBOXES */}

          <div className="flex gap-6 flex-wrap">

            <label className="flex gap-2">
              <input
                type="checkbox"
                id="sale"
                className="w-5"
                checked={formData.sale}
                onChange={handleChange}
              />
              <span>Sell</span>
            </label>

            <label className="flex gap-2">
              <input
                type="checkbox"
                id="rent"
                className="w-5"
                checked={formData.rent}
                onChange={handleChange}
              />
              <span>Rent</span>
            </label>

            <label className="flex gap-2">
              <input
                type="checkbox"
                id="parking"
                className="w-5"
                checked={formData.parking}
                onChange={handleChange}
              />
              <span>Parking Spot</span>
            </label>

            <label className="flex gap-2">
              <input
                type="checkbox"
                id="furnished"
                className="w-5"
                checked={formData.furnished}
                onChange={handleChange}
              />
              <span>Furnished</span>
            </label>

            <label className="flex gap-2">
              <input
                type="checkbox"
                id="offer"
                className="w-5"
                checked={formData.offer}
                onChange={handleChange}
              />
              <span>Offer</span>
            </label>

          </div>

          {/* BEDROOMS / BATHROOMS */}

          <div className="flex flex-wrap gap-6">

            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bedrooms"
                min="1"
                max="10"
                required
                className="p-3 border border-gray-300 rounded-lg w-24"
                value={formData.bedrooms}
                onChange={handleChange}
              />

              <p>Beds</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bathrooms"
                min="1"
                max="10"
                required
                className="p-3 border border-gray-300 rounded-lg w-24"
                value={formData.bathrooms}
                onChange={handleChange}
              />

              <p>Baths</p>
            </div>

          </div>

          {/* PRICES */}

          <div className="flex flex-col gap-4">

            <div className="flex items-center gap-2">

              <input
                type="number"
                id="regularPrice"
                min="1"
                required
                className="p-3 border border-gray-300 rounded-lg w-full"
                value={formData.regularPrice}
                onChange={handleChange}
              />

              <p>Regular Price</p>

              <span className="text-xs">
                ($ / month)
              </span>

            </div>

            <div className="flex items-center gap-2">

              <input
                type="number"
                id="discountPrice"
                min="1"
                required
                className="p-3 border border-gray-300 rounded-lg w-full"
                value={formData.discountPrice}
                onChange={handleChange}
              />

              <p>Discounted Price</p>

              <span className="text-xs">
                ($ / month)
              </span>

            </div>

          </div>

        </div>

        {/* =========================
            RIGHT SIDE
        ========================== */}

        <div className="flex flex-col flex-1 gap-4">

          <p className="font-semibold">
            Images:

            <span className="font-normal text-gray-600 ml-2">
              The first image will be the cover (max 6)
            </span>
          </p>

          {/* FILE SELECT */}

          <div className="flex gap-4">

            <input
              onChange={handleFileSelect}
              className="p-3 border border-gray-300 rounded w-full"
              type="file"
              id="images"
              accept="image/*"
              multiple
            />

            <button
              type="button"
              onClick={handleImageSubmit}
              disabled={
                uploading ||
                files.length === 0 ||
                imageUrls.length >= 6
              }
              className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>

          </div>

          {/* IMAGE COUNT */}

          <p className="text-sm text-gray-500">
            {imageUrls.length}/6 images uploaded
          </p>

          {/* SUCCESS */}

          {success && (
            <p className="text-green-600 text-sm">
              {success}
            </p>
          )}

          {/* ERROR */}

          {uploadError && (
            <p className="text-red-600 text-sm">
              {uploadError}
            </p>
          )}

          {/* IMAGE PREVIEW */}

          {imageUrls.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

              {imageUrls.map((url, index) => (

                <div
                  key={url}
                  className="relative border rounded-lg overflow-hidden"
                >

                  <img
                    src={url}
                    alt={`Listing ${index + 1}`}
                    className="w-full h-32 object-cover"
                  />

                  {/* COVER */}

                  {index === 0 && (
                    <span className="absolute top-1 left-1 bg-black text-white text-xs px-2 py-1 rounded">
                      Cover
                    </span>
                  )}

                  {/* REMOVE */}

                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveImage(index)
                    }
                    className="absolute top-1 right-1 bg-red-600 text-white w-7 h-7 rounded-full hover:bg-red-700"
                  >
                    ×
                  </button>

                </div>

              ))}

            </div>
          )}

          {/* CREATE LISTING */}

          <button
            type="submit"
            disabled={
              creating ||
              uploading ||
              imageUrls.length === 0
            }
            className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
          >
            {creating
              ? "Creating Listing..."
              : "Create Listing"}
          </button>

        </div>

      </form>

    </main>
  );
}