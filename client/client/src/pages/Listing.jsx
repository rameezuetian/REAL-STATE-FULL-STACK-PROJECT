import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { useSelector } from 'react-redux';

import 'swiper/css'; 
import 'swiper/css/navigation';

import {
  FaBath,
  FaBed,
  FaChair,
  FaMapMarkerAlt,
  FaParking,
  FaShare,
} from 'react-icons/fa';

import Contact from '../components/Contact';

export default function Listing() {
  const { listingId } = useParams();

  const { currentUser } = useSelector((state) => state.user);

  const [listing, setListing] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [copied, setCopied] = useState(false);

  const [contact, setContact] = useState(false);

  // ==========================================
  // FETCH LISTING
  // ==========================================

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        setError('');

        if (!listingId) {
          setError('Listing ID is missing.');
          setLoading(false);
          return;
        }

        const res = await fetch(
          `/api/listing/get/${listingId}`
        );

        /*
          Check response before trying to parse JSON.
          This prevents:
          Unexpected token '<', "<!DOCTYPE..." is not valid JSON
        */

        const contentType = res.headers.get('content-type');

        if (!contentType?.includes('application/json')) {
          throw new Error(
            `Server returned ${res.status} ${res.statusText}`
          );
        }

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.message || 'Failed to fetch listing'
          );
        }

        if (data.success === false) {
          throw new Error(
            data.message || 'Listing not found'
          );
        }

        setListing(data);
      } catch (error) {
        console.log('Fetch listing error:', error);

        setError(
          error.message || 'Something went wrong!'
        );

        setListing(null);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId]);

  // ==========================================
  // SHARE LISTING
  // ==========================================

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(
        window.location.href
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.log('Copy error:', error);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="p-3">
        <p className="text-center my-7 text-2xl">
          Loading...
        </p>
      </main>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error || !listing) {
    return (
      <main className="p-3">
        <p className="text-center my-7 text-2xl text-red-600">
          {error || 'Listing not found!'}
        </p>
      </main>
    );
  }

  // ==========================================
  // LISTING DATA
  // ==========================================

  const imageUrls = Array.isArray(listing.imageUrls)
    ? listing.imageUrls
    : [];

  const regularPrice =
    Number(listing.regularPrice) || 0;

  const discountPrice =
    Number(listing.discountPrice) || 0;

  const finalPrice = listing.offer
    ? discountPrice
    : regularPrice;

  const priceOff = regularPrice - discountPrice;

  // ==========================================
  // UI
  // ==========================================

  return (
    <main>
      {/* ======================================
          IMAGES
      ====================================== */}

      {imageUrls.length > 0 ? (
        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={10}
          slidesPerView={1}
        >
          {imageUrls.map((url, index) => (
            <SwiperSlide key={`${url}-${index}`}>
              <div
                className="h-87.5 sm:h-112.5 md:h-137.5"
                style={{
                  backgroundImage: `url(${url})`,
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: 'cover',
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className="h-87.5 sm:h-112.5 md:h-137.5 bg-gray-200 flex items-center justify-center">
          <p className="text-gray-500">
            No images available
          </p>
        </div>
      )}

      {/* ======================================
          SHARE BUTTON
      ====================================== */}

      <div
        onClick={handleShare}
        className="
          fixed
          top-[13%]
          right-[3%]
          z-10
          border
          rounded-full
          w-12
          h-12
          flex
          justify-center
          items-center
          bg-slate-100
          cursor-pointer
          shadow-md
        "
      >
        <FaShare className="text-slate-500" />
      </div>

      {/* ======================================
          COPIED MESSAGE
      ====================================== */}

      {copied && (
        <p
          className="
            fixed
            top-[23%]
            right-[5%]
            z-10
            rounded-md
            bg-slate-100
            p-2
            shadow-md
          "
        >
          Link copied!
        </p>
      )}

      {/* ======================================
          LISTING DETAILS
      ====================================== */}

      <div
        className="
          flex
          flex-col
          max-w-4xl
          mx-auto
          p-3
          my-7
          gap-4
        "
      >
        {/* NAME + PRICE */}

        <p className="text-2xl font-semibold">
          {listing.name} - $
          {finalPrice.toLocaleString('en-US')}

          {listing.type === 'rent' && ' / month'}
        </p>

        {/* ADDRESS */}

        <p
          className="
            flex
            items-center
            mt-2
            gap-2
            text-slate-600
            text-sm
          "
        >
          <FaMapMarkerAlt className="text-green-700" />

          {listing.address}
        </p>

        {/* SALE / RENT + OFFER */}

        <div className="flex flex-wrap gap-4">
          <p
            className="
              bg-red-900
              w-full
              max-w-50
              text-white
              text-center
              p-1
              rounded-md
            "
          >
            {listing.type === 'rent'
              ? 'For Rent'
              : 'For Sale'}
          </p>

          {listing.offer && (
            <p
              className="
                bg-green-900
                w-full
                max-w-50
                text-white
                text-center
                p-1
                rounded-md
              "
            >
              $
              {priceOff.toLocaleString('en-US')}
              {' '}OFF
            </p>
          )}
        </div>

        {/* DESCRIPTION */}

        <p className="text-slate-800">
          <span className="font-semibold text-black">
            Description -{' '}
          </span>

          {listing.description}
        </p>

        {/* ==================================
            FEATURES
        ================================== */}

        <ul
          className="
            text-green-900
            font-semibold
            text-sm
            flex
            flex-wrap
            items-center
            gap-4
            sm:gap-6
          "
        >
          {/* BEDROOMS */}

          <li className="flex items-center gap-1 whitespace-nowrap">
            <FaBed className="text-lg" />

            {listing.bedrooms > 1
              ? `${listing.bedrooms} beds`
              : `${listing.bedrooms} bed`}
          </li>

          {/* BATHROOMS */}

          <li className="flex items-center gap-1 whitespace-nowrap">
            <FaBath className="text-lg" />

            {listing.bathrooms > 1
              ? `${listing.bathrooms} baths`
              : `${listing.bathrooms} bath`}
          </li>

          {/* PARKING */}

          <li className="flex items-center gap-1 whitespace-nowrap">
            <FaParking className="text-lg" />

            {listing.parking
              ? 'Parking spot'
              : 'No Parking'}
          </li>

          {/* FURNISHED */}

          <li className="flex items-center gap-1 whitespace-nowrap">
            <FaChair className="text-lg" />

            {listing.furnished
              ? 'Furnished'
              : 'Unfurnished'}
          </li>
        </ul>

        {/* ==================================
            CONTACT LANDLORD
        ================================== */}

        {currentUser &&
          listing.userRef !== currentUser._id &&
          !contact && (
            <button
              onClick={() => setContact(true)}
              className="
                bg-slate-700
                text-white
                rounded-lg
                uppercase
                hover:opacity-95
                p-3
              "
            >
              Contact landlord
            </button>
          )}
          {contact && <Contact/>}

        {/* CONTACT COMPONENT */}

        {contact && (
          <Contact listing={listing} />
        )}
      </div>
    </main>
  );
}