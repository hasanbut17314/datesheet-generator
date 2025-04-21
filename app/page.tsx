"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [session, setSession] = useState<boolean | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMore, setShowMore] = useState(false);

  const images = [
    { src: "/frontp4.jpg", alt: "Campus 1" },
    { src: "/frontp6.jpg", alt: "Campus 5" },
    { src: "/frontp2.jpeg", alt: "Campus 3" },
    { src: "/frontp3.jpg", alt: "Campus 2" },
    { src: "/frontp5.jpg", alt: "Campus 4" },
  ];

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        setSession(!!data.user);
      } catch (error) {
        console.error("Failed to fetch session:", error);
        setSession(false);
      }
    }
    fetchSession();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const toggleText = () => {
    setShowMore(!showMore);
  };

  return (
    <div className="min-h-screen">
      <div className="top-banner bg-primary text-primary-foreground shadow-lg py-3 px-6 flex justify-end items-center h-[50px]">
        <div className="nav flex gap-8">
          {session === null ? null : session ? (
            <Link href="/dashboard" className="text-sm font-bold hover:text-secondary">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/about" className="text-sm font-bold hover:text-secondary">About</Link>
              <Link href="/contact" className="text-sm font-bold hover:text-secondary">Contact</Link>
              <Link href="/help" className="text-sm font-bold hover:text-secondary">Help</Link>
            </>
          )}
        </div>
      </div>

      <div className="logo-banner bg-card shadow-md py-4 px-6 text-center">
        <Image
          src="/logo_homepage.png"
          alt="Logo"
          width={360}
          height={60}
          priority
          className="hover:scale-110 transition-transform duration-300"
        />
      </div>

      <div className="hero relative h-[500px] overflow-hidden">
        {images.map((image, index) => (
          <Image
            key={image.src}
            src={image.src}
            alt={image.alt}
            className={`absolute inset-0 object-cover transition-opacity duration-1000 ${index === currentIndex ? "opacity-100" : "opacity-0"}`}
            fill
            priority={index === 0}
          />
        ))}
        <div className="hero-buttons absolute top-1/2 w-full flex justify-between z-10 px-5">
          <button
            onClick={prevImage}
            aria-label="Previous Image"
            className="bg-black/70 text-white p-4 rounded-full shadow-lg hover:bg-black/90 hover:scale-110 transition-all duration-200"
          >
            ❮
          </button>
          <button
            onClick={nextImage}
            aria-label="Next Image"
            className="bg-black/70 text-white p-4 rounded-full shadow-lg hover:bg-black/90 hover:scale-110 transition-all duration-200"
          >
            ❯
          </button>
        </div>
        <div className="overlay-text absolute top-[60%] left-1/2 -translate-x-1/2 text-white text-4xl font-bold text-center shadow-text animate-fadeIn bg-primary/50 px-4 py-2 rounded-md">
          Welcome to
          <p>Online Date Sheet Generator</p>
        </div>
      </div>

      {session !== null && (
  <Link href={session ? "/dashboard" : "/login"}>
    <Button
      className="
        generate-button 
        block mx-auto my-12 
        
        text-xl sm:text-lg 
        bg-primary text-primary-foreground 
        rounded-full 
        font-serif 
        bg-gradient-to-r from-primary to-primary/90 
        shadow-lg hover:shadow-xl 
        hover:scale-105 hover:-translate-y-2 
        focus:ring-4 focus:ring-primary/50 
        transition-all duration-300 ease-in-out 
        animate-pulse-once
      "
    >
      Go to {session ? "Dashboard" : "Login Page"}
    </Button>
  </Link>
)}

      <div className="cta-buttons flex justify-center gap-8 my-10 pb-10">
        <Link href="/about">
          <Button className="bg-primary text-primary-foreground px-6 py-3 rounded-full hover:bg-primary/80 shadow-lg transition-colors">
            About Us
          </Button>
        </Link>
        <Link href="/contact">
          <Button className="bg-primary text-primary-foreground px-6 py-3 rounded-full hover:bg-primary/80 shadow-lg transition-colors">
            Contact Us
          </Button>
        </Link>
        <Link href="/help">
          <Button className="bg-primary text-primary-foreground px-6 py-3 rounded-full hover:bg-primary/80 shadow-lg transition-colors">
            Help
          </Button>
        </Link>
      </div>

      <footer className="bg-primary text-primary-foreground text-center py-5 px-5 mt-10">
        <div className="footer-content max-w-[950px] mx-auto text-left font-serif">
          <p className="text-lg inline">
            <strong>About Online Date Sheet Generator</strong>
          </p>
          <p className="text-base text-muted-foreground inline">
            Our online date sheet generator streamlines the process of creating customized academic schedules, enabling educational institutions and students to effortlessly design and manage date sheets that align with specific
          </p>
          <span className={`text-base text-muted-foreground ${showMore ? "inline" : "hidden"}`}>
            requirements. By inputting essential details such as exam dates, subjects, and time slots, users can generate organized and professional date sheets tailored to their academic calendars. This tool aims to enhance efficiency, reduce scheduling conflicts, and ensure clarity in academic planning.
          </span>
          <button
            className="read-more-btn text-secondary bg-transparent border-none cursor-pointer text-base underline inline ml-2"
            onClick={toggleText}
          >
            {showMore ? "Read Less" : "Read More"}
          </button>
        </div>
      </footer>
    </div>
  );
}
