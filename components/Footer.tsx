import React from 'react';
import Link from 'next/link';
import { FaGithub } from 'react-icons/fa';
import { NEXT_PUBLIC_SITE_NAME, NEXT_PUBLIC_FOOTER_DESC, NEXT_PUBLIC_FOOTER_CONTACT } from '@/config';

const Footer: React.FC = () => {
    return (
        <footer className="font-mont p-4 text-left w-full">
            <div className="container">
                <div className="text-lg font-bold">{NEXT_PUBLIC_SITE_NAME}</div>
                <div className="text-sm text-gray-300 mt-2">
                {NEXT_PUBLIC_FOOTER_DESC} <span className='text-gray-400'>{NEXT_PUBLIC_FOOTER_CONTACT}</span>
                </div>
                <div className="text-sm mt-2">
                    © {new Date().getFullYear()} {NEXT_PUBLIC_SITE_NAME} 
                    <Link href="https://github.com/rafsanbasunia/reelnn" target="_blank" rel="noopener noreferrer" className="ml-1 underline inline-flex items-center">
                        <FaGithub className="mr-1" aria-hidden="true" />GitHub
                    </Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;