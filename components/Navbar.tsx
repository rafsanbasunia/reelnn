import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineHome, AiOutlineUser } from "react-icons/ai";
import { BsCollectionPlay, BsSearch } from "react-icons/bs";
import { FiChevronDown, FiChevronUp, FiMenu, FiX } from "react-icons/fi";
import { NEXT_PUBLIC_SITE_NAME } from "@/config";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from 'next/router';

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
  const router = useRouter();
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

  const closeUserMenu = () => {
    setIsUserMenuOpen(false);
  };

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

      const userButtonElement = document.querySelector(
        '[aria-label="User menu"], [aria-label="Login"]'
      );
      
      const clickedUserButton = userButtonElement?.contains(
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
        isUserMenuOpen &&
        !clickedUserButton &&
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
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
    }

    function handleEscKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
        setIsSearchActive(false);
        setIsUserMenuOpen(false); 
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isSearchActive, isUserMenuOpen]); 


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
                isSearchActive ? "bg-gray-700" : "hover:bg-gray-700/30"
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
                    width: breakpoint === 0 ? "150px" : breakpoint === 1 ? "200px" : "392px", 
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
          
          {/* User Avatar - Improved UI */}
          <div className="relative" ref={userMenuRef}>
            <motion.button
              className="p-1 hover:bg-gray-800/30 rounded-full transition-colors flex items-center justify-center"
              whileHover={iconHoverAnimation}
              whileTap={iconTapAnimation}
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              aria-label={user ? "User menu" : "Login"}
            >
              {user && user.photoUrl ? (
                <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-500 shadow-md">
                  <img
                    src={user.photoUrl}
                    alt={`${user.firstName}'s avatar`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLElement).parentElement?.classList.add('bg-gray-700');
                      (e.target as HTMLElement).parentElement?.setAttribute('data-icon', 'user');
                    }}
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-700/80 flex items-center justify-center shadow-md border border-gray-600">
                  <AiOutlineUser size={16} />
                </div>
              )}
            </motion.button>

            {/* User Menu Dropdown */}
            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  className="absolute right-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-xl py-2 z-10 border border-gray-700"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  role="menu"
                >
                  {user ? (
                    <>
                      <div className="px-4 py-3 border-b border-gray-800/80">
                        <div className="flex items-center gap-3 mb-2">
                          {user.photoUrl ? (
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-600">
                              <img
                                src={user.photoUrl}
                                alt={`${user.firstName}'s avatar`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                              <AiOutlineUser size={18} />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-white">{user.firstName} {user.lastName}</div>
                            <div className="text-xs text-gray-400">{user.username ? `@${user.username}` : ''}</div>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-2">
                        <button
                          onClick={() => { 
                            logout();
                            closeUserMenu();
                          }}
                          className="w-full flex items-center justify-center gap-2 bg-red-500/80 hover:bg-red-600 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors"
                          role="menuitem"
                        >
                          <span>Logout</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="px-4 py-2">
                      <button
                        className="w-full flex items-center justify-center gap-2 bg-blue-500/90 hover:bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors"
                        role="menuitem"
                        onClick={() => {
                          closeUserMenu();
                          router.push('/login'); 
                        }}
                      >
                        <AiOutlineUser size={16} />
                        <span>Sign In</span>
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Search Results Component */}
      <div className="fixed top-16 right-0 md:right-4 z-50 w-full md:max-w-md">
        <Search
          isVisible={isSearchActive}
          searchQuery={searchQuery}
          ref={searchContainerRef}
        />
      </div>
    </>
  );
}
