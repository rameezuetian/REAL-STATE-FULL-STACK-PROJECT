import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function UpdateListing() {
  const { listingId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    regularPrice: "",
    discountPrice: "",
    bedrooms: "",
    furnished: false,
    parking: false,
    offer: false,
    imageUrls: [],
  });

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // GET SINGLE LISTING
  // ==========================================

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setFetchLoading(true);

        const res = await fetch(
          `/api/listing/get/${listingId}`
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.message || "Failed to fetch listing"
          );
        }

        console.log("Listing:", data);

        setFormData({
          name: data.name || "",
          description: data.description || "",
          address: data.address || "",
          regularPrice: data.regularPrice || "",
          discountPrice: data.discountPrice || "",
          bedrooms: data.bedrooms || "",
          furnished: data.furnished || false,
          parking: data.parking || false,
          offer: data.offer || false,
          imageUrls: data.imageUrls || [],
        });
      } catch (error) {
        console.log("Fetch listing error:", error);
        setError(error.message);
      } finally {
        setFetchLoading(false);
      }
    };

    if (listingId) {
      fetchListing();
    }
  }, [listingId]);

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [id]: type === "checkbox" ? checked : value,
    });
  };

  // ==========================================
  // UPDATE LISTING
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await fetch(
        `/api/listing/update/${listingId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to update listing"
        );
      }

      console.log("Updated Listing:", data);

      setSuccess("Listing updated successfully!");

      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (error) {
      console.log("Update listing error:", error);

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (fetchLoading) {
    return (
      <div className="text-center mt-10">
        <p>Loading listing...</p>
      </div>
    );
  }

  return (
    <main className="p-3 max-w-4xl mx-auto">

      <h1 className="text-3xl font-semibold text-center my-7">
        Update Listing
      </h1>

      {error && (
        <p className="text-red-600 text-center mb-4">
          {error}
        </p>
      )}

      {success && (
        <p className="text-green-600 text-center mb-4">
          {success}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-4"
      >

        {/* LEFT SIDE */}

        <div className="flex flex-col gap-4 flex-1">

          <input
            type="text"
            placeholder="Name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            className="border p-3 rounded-lg"
            required
          />

          <input
            type="text"
            placeholder="Description"
            id="description"
            value={formData.description}
            onChange={handleChange}
            className="border p-3 rounded-lg"
            required
          />

          <input
            type="text"
            placeholder="Address"
            id="address"
            value={formData.address}
            onChange={handleChange}
            className="border p-3 rounded-lg"
            required
          />

          {/* CHECKBOXES */}

          <div className="flex gap-6 flex-wrap">

            <div className="flex gap-2">
              <input
                type="checkbox"
                id="parking"
                checked={formData.parking}
                onChange={handleChange}
                className="w-5"
              />
              <span>Parking Spot</span>
            </div>

            <div className="flex gap-2">
              <input
                type="checkbox"
                id="furnished"
                checked={formData.furnished}
                onChange={handleChange}
                className="w-5"
              />
              <span>Furnished</span>
            </div>

            <div className="flex gap-2">
              <input
                type="checkbox"
                id="offer"
                checked={formData.offer}
                onChange={handleChange}
                className="w-5"
              />
              <span>Offer</span>
            </div>

          </div>

          {/* NUMBERS */}

          <div className="flex flex-wrap gap-4">

            <div className="flex items-center gap-2">

              <input
                type="number"
                id="bedrooms"
                min="1"
                value={formData.bedrooms}
                onChange={handleChange}
                className="p-3 border border-gray-300 rounded-lg w-24"
                required
              />

              <p>Beds</p>

            </div>

            <div className="flex items-center gap-2">

              <input
                type="number"
                id="regularPrice"
                min="1"
                value={formData.regularPrice}
                onChange={handleChange}
                className="p-3 border border-gray-300 rounded-lg w-28"
                required
              />

              <p>Regular Price</p>

            </div>

            <div className="flex items-center gap-2">

              <input
                type="number"
                id="discountPrice"
                min="1"
                value={formData.discountPrice}
                onChange={handleChange}
                className="p-3 border border-gray-300 rounded-lg w-28"
                required
              />

              <p>Discount Price</p>

            </div>

          </div>

        </div>

        {/* RIGHT SIDE */}

        <div className="flex flex-col flex-1 gap-4">

          <p className="font-semibold">
            Images
          </p>

          {formData.imageUrls.length > 0 && (

            <div className="flex flex-wrap gap-3">

              {formData.imageUrls.map((url, index) => (

                <img
                  key={index}
                  src={url}
                  alt={`listing ${index + 1}`}
                  className="h-24 w-24 object-cover rounded-lg"
                />

              ))}

            </div>

          )}

          <button
            type="submit"
            disabled={loading}
            className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
          >
            {loading
              ? "Updating..."
              : "Update Listing"}
          </button>

        </div>

      </form>

    </main>
  );
}