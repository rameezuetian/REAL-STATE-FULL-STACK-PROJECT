import React from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { useRef, useState } from 'react';

import {Link} from 'react-router-dom'

import {
  signInSuccess,
  updateUserFailure,
  updateUserStarts,
  updateUserSuccess,
  deleteUserFailure ,
  deleteUserStarts,
  deleteUserSuccess,
  signOutUserStarts,
  signOutUserSuccess,
  signOutUserFailure
} from '../redux/user/userSlice';

export default function Profile() {
  const { currentUser, loading } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    username: currentUser.username,
    email: currentUser.email,
    password: '',
  });

  const [image, setImage] = useState(currentUser.avatar);
  const [uploading, setUploading] = useState(false);

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const fileRef = useRef(null);

  // =========================
  // IMAGE UPLOAD
  // =========================

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
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error?.message || 'Cloudinary upload failed'
        );
      }

      console.log('Cloudinary:', data);

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
            id: currentUser._id,
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

      dispatch(signInSuccess(updateUser));

      setSuccess(true);

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

  // =========================
  // INPUT CHANGE
  // =========================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  // =========================
  // UPDATE USER
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      dispatch(updateUserStarts());

      setSuccess(false);
      setError('');

      const res = await fetch(
        `/api/user/update/${currentUser._id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
        setError(data.message);
        return;
      }

      console.log('User updated:', data);

      dispatch(updateUserSuccess(data));

      // Update image/state if backend returns avatar
      if (data.avatar) {
        setImage(data.avatar);
      }

      // Show success message
      setSuccess(true);

      // Clear password field
      setFormData({
        ...formData,
        password: '',
      });

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.log('Update failed:', error);

      dispatch(updateUserFailure(error.message));

      setError(error.message);
    }
  };

  const handleDeleteUser = async () =>{
    try {
      dispatch(deleteUserStarts());
      const res = await fetch(`/api/user/delete/${currentUser._id}`,{
        method:'DELETE',
      });
      const data = await res.json();
      if(!res.ok || data.success == false){
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
      
    } catch (error) {
      dispatch(deleteUserFailure(error.message))
    }
  };

  const handleSignOut =async () =>{
    try {
      dispatch(signOutUserStarts());
      const res = await fetch('/api/auth/signout');
      const data = await res.json();
      if(data.success === false){
        dispatch(signOutUserFailure(data.message))
        return;
      }

      dispatch(signOutUserSuccess(data));
      
    } catch (error) {
      dispatch(signOutUserFailure(error.message))
      
    }
  }



  return (
    <div className='p-3 max-w-lg mx-auto'>

      <h1 className='text-3xl font-semibold text-center my-7'>
        Profile
      </h1>

      {/* IMPORTANT: onSubmit */}
      <form
        onSubmit={handleSubmit}
        className='flex flex-col gap-4'
      >

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

        {/* Image Success */}

        {success && (
          <p className='text-green-600 text-sm text-center'>
            Profile updated successfully! ✓
          </p>
        )}

        {/* Error */}

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
          value={formData.username}
          onChange={handleChange}
        />

        {/* Email */}

        <input
          type='email'
          placeholder='Email'
          className='border p-3 rounded-lg'
          id='email'
          value={formData.email}
          onChange={handleChange}
        />

        {/* Password */}

        <input
          type='password'
          placeholder='Password'
          className='border p-3 rounded-lg'
          id='password'
          value={formData.password}
          onChange={handleChange}
        />

        {/* Update Button */}

        <button
  type='submit'
  disabled={loading || uploading}
  className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80'
>
  {loading ? 'Updating...' : 'Update'}
</button>

<Link
  className='bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95'
  to='/create-listing'
>
  Create Listing
</Link>

      </form>

      {/* Delete / Sign Out */}

      <div className='flex justify-between mt-5'>

        <span onClick={handleDeleteUser}  className='text-red-700 cursor-pointer'>
          Delete Account
        </span>

        <span onClick={handleSignOut}  className='text-red-700 cursor-pointer'>
          Sign Out
        </span>

      </div>

    </div>
  );
}