import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineHome } from "react-icons/ai";
import { BsCollectionPlay, BsSearch } from "react-icons/bs";
import { FiChevronDown, FiChevronUp, FiMenu, FiX, FiLogOut, FiUser, FiCalendar, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { NEXT_PUBLIC_SITE_NAME } from "@/config";
import { useAuth } from '@/context/AuthContext';

import Link from "next/link";
import Search from "./Search";

export function useBreakpoint() {
  const [breakpointIndex, setBreakpointIndex] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1024) setBreakpointIndex(2);
      else if (width >= 768) setBreakpointIndex(1);
      else setBreakpointIndex(0);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return breakpointIndex;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [logoImageError, setLogoImageError] = useState(false); 
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleSearch = () => {
    setIsSearchActive(!isSearchActive);
    if (!isSearchActive) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  };

  const closeMenus = () => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  // Effect for preloading logo and handling error
  useEffect(() => {
    const img = new Image();
    img.src = "/logo.png";
    img.onerror = () => {
      setLogoImageError(true);
    };
  }, []); 

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const searchButtonElement = document.querySelector(
        '[aria-label="Search"]'
      );

      const clickedSearchButton = searchButtonElement?.contains(
        event.target as Node
      );


      if (
        isSearchActive &&
        !clickedSearchButton &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node) &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchActive(false);
      }


      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }

      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }


    function handleEscKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
        setIsSearchActive(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isSearchActive]); 

  // Reusable animation variants
  const iconHoverAnimation = { scale: 1.1 };
  const iconTapAnimation = { scale: 0.9 };
  const navItemHoverAnimation = { y: -2 };
  const logoHoverAnimation = { scale: 1.05 };
  const logoTapAnimation = { scale: 0.95 };
  const breakpoint = useBreakpoint();

  return (
    <>
      <nav
        className="text-white p-3 sm:p-4 flex items-center justify-between z-30 fixed top-0 left-0 right-0 bg-gradient-to-b from-black/90 to-transparent"
        role="navigation"
      >
        {/* Mobile menu button  */}
        <div className="md:hidden">
          <motion.button
            className="p-2 hover:bg-gray-800/30 rounded-full transition-colors"
            whileHover={iconHoverAnimation}
            whileTap={iconTapAnimation}
            onClick={toggleMobileMenu}
            aria-label="Menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </motion.button>
        </div>

        {/* Left side */}
        <div className="hidden md:flex items-center space-x-6">
          <motion.a
            href="/"
            className="flex items-center space-x-1.5 px-3 py-1.5 hover:bg-gray-800/30 rounded-full transition-colors"
            whileHover={navItemHoverAnimation}
            aria-label="Home"
          >
            <AiOutlineHome size={18} />
            <span>Home</span>
          </motion.a>

          {/* Browse with Dropdown */}
          <div className="relative" >
            <motion.button
              className="flex items-center space-x-1.5 px-3 py-1.5 hover:bg-gray-800/30 rounded-full transition-colors"
              onClick={toggleDropdown}
              whileHover={navItemHoverAnimation}
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              <BsCollectionPlay size={18} />
              <span>Browse</span>
              {isDropdownOpen ? (
                <FiChevronUp size={16} />
              ) : (
                <FiChevronDown size={16} />
              )}
            </motion.button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  className="absolute mt-2 w-48 bg-gray-900 rounded-md shadow-lg py-1 z-10 border border-gray-800"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  role="menu"
                >
                  <Link
                    href="/browse/movie"
                    className="block px-4 py-2 hover:bg-gray-800 transition-colors"
                    role="menuitem"
                    onClick={closeMenus}
                  >
                    Movies
                  </Link>
                  <Link
                    href="/browse/show"
                    className="block px-4 py-2 hover:bg-gray-800 transition-colors"
                    role="menuitem"
                    onClick={closeMenus}
                  >
                    Series
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center Logo  */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Link href="/">
            <motion.div
              className="flex items-center justify-center"
              whileHover={logoHoverAnimation}
              whileTap={logoTapAnimation}
              aria-label={`${NEXT_PUBLIC_SITE_NAME} Home`}
            >
              {logoImageError ? (
                <span className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-pink-500 bg-clip-text text-transparent">{`${NEXT_PUBLIC_SITE_NAME}`}</span>
              ) : (
                <img
                  src="/logo.png"
                  alt={`${NEXT_PUBLIC_SITE_NAME} Logo`}
                  width={40}
                  height={40}
                  className="w-10 h-10"
                  onError={() => {
                    if (!logoImageError) {
                      setLogoImageError(true);
                    }
                  }}
                />
              )}
            </motion.div>
          </Link>
        </div>

        {/* Right side - Icons */}
        <div className="flex items-center space-x-3 md:space-x-4">
          <div className="relative flex items-center">
            <motion.button
              className={`p-2 ${
                isSearchActive ? "bg-gray-700" : "hover:bg-red-400/30"
              } rounded-full transition-colors`}
              whileHover={!isSearchActive ? iconHoverAnimation : {}}
              whileTap={!isSearchActive ? iconTapAnimation : {}}
              onClick={toggleSearch}
              aria-label="Search"
            >
              <BsSearch size={18} />
            </motion.button>

            <AnimatePresence>
              {isSearchActive && (
                <motion.div 
                  className="absolute right-0 flex items-center"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ 
                    width: breakpoint === 0 ? "150px" : breakpoint === 1 ? "200px" : "320px", 
                    opacity: 1 
                  }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search movies, shows..."
                    className="w-full bg-gray-900/90 backdrop-blur-md text-white border border-gray-700 rounded-lg py-1.5 sm:py-2 px-3 sm:px-4 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 text-xs sm:text-sm shadow-lg"
                    aria-label="Search input"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User menu - Desktop */}
          {user && (
            <div className="hidden md:flex items-center relative">
              <motion.button
                className="relative focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-label="User menu"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
              >
                {user.photoUrl ? (
                  <img 
                    src={user.photoUrl} 
                    alt={`${user.firstName}'s profile`}
                    className="w-9 h-9 rounded-full border-2 border-transparent hover:border-blue-400 transition-all duration-200"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                    {user.firstName?.charAt(0).toUpperCase()}
                  </div>
                )}
                
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
              </motion.button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    ref={userMenuRef}
                    className="absolute right-0 mt-3 top-full w-80 bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    role="menu"
                  >
                    {/* User Profile Header */}
                    <div className="relative bg-gradient-to-br from-blue-600/20 to-purple-600/20 px-6 py-4 border-b border-gray-700/50">
                      <div className="flex items-center space-x-4">
                        {user.photoUrl ? (
                          <img 
                            src={user.photoUrl} 
                            alt={user.firstName}
                            className="w-14 h-14 rounded-full border-3 border-white/20 shadow-lg"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            {user.firstName?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-white truncate">
                            {user.firstName} {user.lastName || ''}
                          </h3>
                          <p className="text-sm text-blue-300 truncate flex items-center">
                            <FiUser className="w-3 h-3 mr-1" />
                            @{user.username || 'No username'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* User Stats */}
                    {user.backendUser && (
                      <div className="px-6 py-4 bg-gray-800/30">
                        <div className="grid grid-cols-2 gap-4">
                          

                          
                        </div>

                        {/* Member Since */}
                        <div className="mt-4 flex items-center justify-center bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
                          <FiCalendar className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-xs text-gray-400">Member since </span>
                          <span className="text-xs text-white font-medium ml-1">
                            {new Date(user.backendUser.registration_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="p-4 bg-gray-800/20">
                      <motion.button
                        onClick={logout}
                        className="w-full flex items-center justify-center space-x-2 bg-red-600/90 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-red-500/25"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        role="menuitem"
                      >
                        <FiLogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Mobile Menu Panel  */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              ref={mobileMenuRef}
              className="fixed inset-0 z-50 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={toggleMobileMenu}
              ></div>

              {/* Mobile Menu Content */}
              <motion.div
                className="absolute left-0 top-0 h-full w-2/3 max-w-xs bg-gray-900 shadow-lg p-5"
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "tween", ease: "easeOut" }}
              >
                <div className="flex flex-col space-y-6">
                  {/* Mobile Navigation Links */}
                  <Link
                    href="/"
                    className="flex items-center space-x-3 p-2 hover:bg-gray-800 rounded-md"
                  >
                    <AiOutlineHome size={20} />
                    <span>Home</span>
                  </Link>

                  <div>
                    <div
                      className="flex items-center justify-between p-2 hover:bg-gray-800 rounded-md cursor-pointer"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <div className="flex items-center space-x-3">
                        <BsCollectionPlay size={20} />
                        <span>Browse</span>
                      </div>
                      {isDropdownOpen ? <FiChevronUp /> : <FiChevronDown />}
                    </div>

                    {/* Browsing Categories Submenu */}
                    {isDropdownOpen && (
                      <div className="ml-9 mt-1 space-y-2">
                        <Link
                          href="/browse/movie"
                          className="block p-2 hover:bg-gray-800 rounded-md"
                        >
                          Movies
                        </Link>
                        <Link
                          href="/browse/show"
                          className="block p-2 hover:bg-gray-800 rounded-md"
                        >
                          Series
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Mobile User Menu */}
                  {user && (
                    <div className="border-t border-gray-700/50 pt-6">
                      <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-xl p-4 border border-gray-700/30">
                        <div className="flex items-center space-x-4 mb-4">
                          {user.photoUrl ? (
                            <img 
                              src={user.photoUrl} 
                              alt={user.firstName}
                              className="w-12 h-12 rounded-full border-2 border-white/20"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                              {user.firstName?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-bold text-white truncate">
                              {user.firstName} {user.lastName || ''}
                            </h3>
                            <p className="text-sm text-blue-300 truncate">
                              @{user.username || 'No username'}
                            </p>
                          </div>
                        </div>
                        
                    
                        
                        <motion.button
                          onClick={logout}
                          className="w-full flex items-center justify-center space-x-2 bg-red-600/90 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <FiLogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </motion.button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Search Results Component */}
      <Search
        isVisible={isSearchActive}
        searchQuery={searchQuery}
        ref={searchContainerRef}
      />
    </>
  );
}
