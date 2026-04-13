"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function Header() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100 && !scrolled) setScrolled(true);
            if (window.scrollY < 10 && scrolled) setScrolled(false);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [scrolled]);

    return (
        <nav className="sticky top-0 z-50 w-full bg-light-background grid grid-cols-2 transition-all duration-300">
            <div className="logo w-full py-2 px-2">
                <Image
                    src={"/Palfinger_big.png"}
                    alt=""
                    width={scrolled ? 100 : 200}
                    height={scrolled ? 100 : 500}
                />
            </div>

            <ul className="flex items-center justify-end gap-8 pr-4">
                <li><a href="#" className="text-sm font-medium hover:text-gray-600">Home</a></li>
                <li><a href="#" className="text-sm font-medium hover:text-gray-600">Products</a></li>
                <li><a href="#" className="text-sm font-medium hover:text-gray-600">Contact</a></li>
            </ul>
        </nav>
    );
}
