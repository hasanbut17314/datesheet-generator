"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Contact() {
  const [showMore, setShowMore] = useState(false);

  const toggleText = () => {
    setShowMore(!showMore);
  };

  return (
    <div className="min-h-screen">
      <div className="top-banner bg-primary text-primary-foreground shadow-lg py-3 px-6 flex justify-end items-center h-[50px]">
        <div className="nav flex gap-8">
          <Link href="/" className="text-sm font-bold hover:text-secondary">Home</Link>
          <Link href="/about" className="text-sm font-bold hover:text-secondary">About</Link>
          <Link href="/help" className="text-sm font-bold hover:text-secondary">Help</Link>
        </div>
      </div>

      <div className="logo-banner bg-card shadow-md py-4 px-6 flex items-center">
        <Image
          src="/logo_homepage.png"
          alt="Logo"
          width={360}
          height={60}
          priority
          className="hover:scale-110 transition-transform duration-300"
        />
      </div>

      <div className="contact-section py-16 px-5 max-w-7xl mx-auto text-center">
        <h1 className="font-serif text-5xl text-primary mb-8">Contact Us</h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-10">
          Have questions or need assistance? We're here to help! Reach out to us using the form below, and we'll get back to you as soon as possible. Your feedback and inquiries are important to us.
        </p>

        <div className="contact-form max-w-lg mx-auto text-left">
          <form>
            <input
              type="text"
              placeholder="Your Name"
              required
              className="w-full p-3 mb-5 border border-border rounded-md text-base bg-background text-foreground"
            />
            <input
              type="email"
              placeholder="Your Email"
              required
              className="w-full p-3 mb-5 border border-border rounded-md text-base bg-background text-foreground"
            />
            <textarea
              placeholder="Your Message"
              required
              className="w-full p-3 mb-5 border border-border rounded-md text-base bg-background text-foreground h-40"
            />
            <Button
              type="submit"
              className="bg-primary text-primary-foreground px-5 py-3 rounded-md hover:bg-primary/80 transition-colors"
            >
              Send Message
            </Button>
          </form>
        </div>

        <div className="image-grid grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">
          {["contact 1.png", "contact 2.png", "contact 4.png"].map((src, index) => (
            <Image
              key={src}
              src={`/${src}`}
              alt={`Contact Image ${index + 1}`}
              width={400}
              height={300}
              className="w-full h-auto rounded-lg shadow-md hover:scale-105 transition-transform duration-300"
            />
          ))}
        </div>
      </div>

      <footer className="bg-primary text-primary-foreground text-center py-5 px-5 mt-20">
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