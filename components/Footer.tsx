import React from 'react';
import Link from 'next/link';
import { FaGithub, FaTelegram, FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { NEXT_PUBLIC_SITE_NAME, NEXT_PUBLIC_FOOTER_DESC, NEXT_PUBLIC_TELEGRAM_CONTACT, NEXT_PUBLIC_WHATSAPP_CONTACT, NEXT_PUBLIC_INSTAGRAM_CONTACT } from '@/config';

const Footer: React.FC = () => {
    const TELEGRAM_LINK = NEXT_PUBLIC_TELEGRAM_CONTACT;
    const WHATSAPP_LINK = NEXT_PUBLIC_WHATSAPP_CONTACT ;
    const INSTAGRAM_LINK = NEXT_PUBLIC_INSTAGRAM_CONTACT;

    return (
        <footer className="font-mont p-4 text-left w-full">
            <div className="container">
                <div className="text-lg font-bold">{NEXT_PUBLIC_SITE_NAME}</div>
                <div className="text-sm text-gray-300 mt-2">
                {NEXT_PUBLIC_FOOTER_DESC} <span className='text-gray-400'></span>
                </div>
                <div className="text-sm mt-2">
                    Contact Us: &nbsp;
                    <div className="inline-flex items-center gap-3">
                        {TELEGRAM_LINK && (
                            <Link href={TELEGRAM_LINK} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 inline-flex items-center">
                                <FaTelegram className="mr-1" aria-hidden="true" />
                                Telegram
                            </Link>
                        )}
                        {WHATSAPP_LINK && (
                            <Link href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-400 inline-flex items-center">
                                <FaWhatsapp className="mr-1" aria-hidden="true" />
                                WhatsApp
                            </Link>
                        )}
                        {INSTAGRAM_LINK && (
                            <Link href={INSTAGRAM_LINK} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-400 inline-flex items-center">
                                <FaInstagram className="mr-1" aria-hidden="true" />
                                Instagram
                            </Link>
                        )}
                    </div>
                </div>
                <div className="text-sm mt-2">
                    © {new Date().getFullYear()} {NEXT_PUBLIC_SITE_NAME} 
                    <Link href="https://github.com/rafsanbasunia/reelnn" target="_blank" rel="noopener noreferrer" className="ml-1 underline inline-flex items-center">
                        <FaGithub className="mr-1" aria-hidden="true" />Made with ❤️
                    </Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;