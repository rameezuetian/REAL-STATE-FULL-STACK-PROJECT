import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRef, useState } from 'react';
import { signInSuccess } from '../redux/user/userSlice';

export default function Profile() {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [image, setImage] = useState(currentUser.avatar);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const fileRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setUploading(true);
    setSuccess(false);
    setError('');

    const formData = new FormData();

    formData.append('file', file);

    formData.append(
      'upload_preset',
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
    );

    try {
      // Upload image to Cloudinary
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Cloudinary upload failed');
      }

      console.log('Cloudinary:', data);

      // Show uploaded image immediately
      setImage(data.secure_url);

      // Save image URL to MongoDB
      const updateRes = await fetch(
        `/api/user/update/${currentUser._id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            avatar: data.secure_url,
          }),
        }
      );

      const updateUser = await updateRes.json();

      if (!updateRes.ok) {
        throw new Error(
          updateUser.message || 'Failed to update profile'
        );
      }

      console.log('Updated User:', updateUser);

      // Update Redux
      dispatch(signInSuccess(updateUser));

      // Show success message
      setSuccess(true);

      // Hide message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

    } catch (error) {
      console.log('Image upload failed:', error);
      setError(error.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className='p-3 max-w-lg mx-auto'>

      <h1 className='text-3xl font-semibold text-center my-7'>
        Profile
      </h1>

      <form className='flex flex-col gap-4'>

        {/* File Input */}
        <input
          type='file'
          ref={fileRef}
          hidden
          accept='image/*'
          onChange={handleFileChange}
        />

        {/* Profile Image */}
        <img
          onClick={() =>
            !uploading && fileRef.current.click()
          }
          src={image}
          alt='profile'
          className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2'
        />

        {/* Success Message */}
        {success && (
          <p className='text-green-600 text-sm text-center'>
            Profile picture uploaded successfully! ✓
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p className='text-red-600 text-sm text-center'>
            {error}
          </p>
        )}

        {/* Username */}
        <input
          type='text'
          placeholder='Username'
          className='border p-3 rounded-lg'
          id='username'
          value={currentUser.username}
          readOnly
        />

        {/* Email */}
        <input
          type='email'
          placeholder='Email'
          className='border p-3 rounded-lg'
          id='email'
          value={currentUser.email}
          readOnly
        />

        {/* Password */}
        <input
          type='password'
          placeholder='Password'
          className='border p-3 rounded-lg'
          id='password'
        />

        {/* Update Button */}
        <button
          disabled={uploading}
          className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80'
        >
          {uploading ? 'Uploading...' : 'Update'}
        </button>

      </form>

      {/* Delete / Sign Out */}
      <div className='flex justify-between mt-5'>

        <span className='text-red-700 cursor-pointer'>
          Delete Account
        </span>

        <span className='text-red-700 cursor-pointer'>
          Sign Out
        </span>

      </div>

    </div>
  );
}