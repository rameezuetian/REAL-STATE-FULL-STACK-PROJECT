import React, { useState } from "react";

export default function Contact({ listing }) {
  const [message, setMessage] = useState(
    `Hello, I am interested in ${listing.name}.`
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Message:", message);
    console.log("Listing:", listing._id);

    // You can connect this to your backend later.
  };

  return (
    <div className="border p-4 rounded-lg mt-4">
      <h2 className="text-xl font-semibold mb-3">
        Contact Landlord
      </h2>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="border p-3 rounded-lg w-full"
        rows="4"
        placeholder="Write your message..."
      />

      <button
        onClick={handleSubmit}
        className="bg-slate-700 text-white p-3 rounded-lg mt-3 w-full uppercase hover:opacity-95"
      >
        Send Message
      </button>
    </div>
  );
}