"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Help() {
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
          <Link href="/contact" className="text-sm font-bold hover:text-secondary">Contact</Link>
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

      <div className="help-section py-16 px-5 max-w-7xl mx-auto text-center">
        <h1 className="font-serif text-5xl text-primary mb-8">Help & Support</h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-10">
          Welcome to the Help Center! Here, you'll find answers to frequently asked questions and resources to assist you in using the Online Date Sheet Generator effectively. If you can't find what you're looking for, feel free to <Link href="/contact" className="text-primary hover:underline">contact us</Link>.
        </p>

        <div className="faq text-left max-w-4xl mx-auto">
          <div className="faq-item mb-8">
            <h3 className="font-serif text-2xl text-primary mb-3">How do I create a date sheet?</h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              To create a date sheet, log in to your admin account, navigate to the "Create Date Sheet" section, and input the required details. Once completed, you can download or share the generated date sheet.
            </p>
          </div>
          <div className="faq-item mb-8">
            <h3 className="font-serif text-2xl text-primary mb-3">Can I edit a date sheet after creating it?</h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              Yes, you can edit a date sheet after creating it. Simply go to the "My Date Sheets" section, select the date sheet you want to edit, and make the necessary changes. Don't forget to save your updates!
            </p>
          </div>
          <div className="faq-item mb-8">
            <h3 className="font-serif text-2xl text-primary mb-3">What if I forget my password?</h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              If you forget your password, click on the "Forgot Password" link on the login page. You'll receive an email with instructions to reset your password.
            </p>
          </div>
        </div>

        <div className="image-grid grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">
          {["help2.png", "help1.png", "help3.png"].map((src, index) => (
            <Image
              key={src}
              src={`/${src}`}
              alt={`Help Image ${index + 1}`}
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