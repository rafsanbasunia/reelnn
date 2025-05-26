import React from "react";
import { useRouter } from "next/router";
import { IoArrowBack, IoHomeOutline } from "react-icons/io5";

const Backward = () => {
  const router = useRouter();

  return (
    <nav
      className="text-white p-4 flex items-center justify-between z-30 absolute top-0 left-0 right-0"
      role="navigation"
    >
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 p-2 rounded-full bg-black/30 hover:bg-black/50 hover:scale-110 hover:shadow-lg transition-all duration-300 ease-in-out transform text-white cursor-pointer"
          aria-label="Go back"
        >
          <IoArrowBack size={24} className="transform transition-transform duration-300 hover:rotate-[-8deg] group-hover:rotate-[-8deg]" />
        </button>
        <button
          onClick={() => router.push('/')}
          className="flex items-center space-x-2 p-2 rounded-full bg-black/30 hover:bg-black/50 hover:scale-110 hover:shadow-lg transition-all duration-300 ease-in-out transform text-white cursor-pointer"
          aria-label="Go to home page"
        >
          <IoHomeOutline size={24} className="transform transition-transform duration-300 hover:animate-pulse group-hover:animate-pulse" />
        </button>
      </div>
    </nav>
  );
};

export default Backward;