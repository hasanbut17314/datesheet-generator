
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { CalendarRange, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  // Session state for client-side fetching
  const [session, setSession] = useState<boolean | null>(null); // null indicates loading

  // Fetch session client-side
  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        setSession(!!data.user); // Set to true if user exists, false otherwise
      } catch (error) {
        console.error("Failed to fetch session:", error);
        setSession(false); // Fallback to no session
      }
    }
    fetchSession();
  }, []);

  // Image slider state
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = [
    { src: "/frontp4.jpg", alt: "Campus 1" },
    { src: "/frontp6.jpg", alt: "Campus 5" },
    { src: "/frontp2.jpeg", alt: "Campus 3" },
    { src: "/frontp3.jpg", alt: "Campus 2" },
    { src: "/frontp5.jpg", alt: "Campus 4" },
  ];

  // Footer "Read More" state
  const [showMore, setShowMore] = useState(false);

  // Image slider logic
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

  // Footer toggle logic
  const toggleText = () => {
    setShowMore(!showMore);
  };

  return (
    <div>
      <style jsx global>{`
        body {
          font-family: 'Roboto', sans-serif;
          background-color: #f0f8ff;
          margin: 0;
          padding: 0;
          color: #333;
        }

        .top-banner {
          background-color: #1B461C;
          padding: 10px 25px;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          color: white;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
          height: 50px;
        }

        .top-banner .nav {
          display: flex;
          gap: 30px;
        }

        .top-banner .nav a {
          color: white;
          text-decoration: none;
          font-weight: bold;
          font-size: 16px;
          transition: color 0.3s ease;
        }

        .top-banner .nav a:hover {
          color: #FFD700;
        }

        .logo-banner {
          background-color: white;
          padding: 15px 25px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .logo-banner img {
          height: 60px;
          transition: transform 0.3s ease;
        }

        .logo-banner img:hover {
          transform: scale(1.1);
        }

        .hero {
          position: relative;
          height: 500px;
          overflow: hidden;
        }

        .hero img {
          position: absolute;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          transition: opacity 1s ease-in-out;
        }

        .hero img.active {
          opacity: 1;
        }

        .hero-buttons {
          position: absolute;
          top: 50%;
          width: 100%;
          display: flex;
          justify-content: space-between;
          z-index: 1;
        }

        .hero-buttons button {
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border: none;
          padding: 15px 20px;
          cursor: pointer;
          font-size: 20px;
          border-radius: 50%;
          aspect-ratio: 1/1;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.4);
          transition: transform 0.2s ease, background 0.3s ease;
          margin: 0 20px;
        }

        .hero-buttons button:hover {
          background-color: rgba(0, 0, 0, 0.9);
          transform: scale(1.15);
        }

        .generate-button {
          display: block;
          margin: 40px auto;
          padding: 15px 30px;
          font-size: 18px;
          background-color: #FFD700;
          color: #1B461C;
          border: none;
          cursor: pointer;
          border-radius: 30px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        .generate-button:hover {
          background-color: #ffbf00;
          transform: translateY(-5px);
        }

        .cta-buttons {
          display: flex;
          justify-content: center;
          gap: 30px;
          margin: 40px 0;
          padding-bottom: 40px;
        }

        .cta-buttons button {
          background-color: #32CD32;
          border: none;
          padding: 14px 25px;
          font-size: 16px;
          border-radius: 30px;
          color: white;
          cursor: pointer;
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
          transition: background 0.3s ease;
        }

        .cta-buttons button:hover {
          background-color: #228B22;
        }

        footer {
          background-color: #1B461C;
          color: white;
          text-align: center;
          padding: 20px 20px 40px 20px;
          position: relative;
          bottom: 0;
          width: 100%;
          margin-top: 40px;
        }

        .footer-content {
          max-width: 950px;
          margin: 0 auto;
          text-align: left;
          font-family: 'Playfair Display', serif;
        }

        .footer-content p {
          font-size: 16px;
          line-height: 1.6;
          color: #d3d3d3;
          display: inline;
        }

        .more-text {
          display: ${showMore ? "inline" : "none"};
        }

        .read-more-btn {
          color: #FFD700;
          background-color: transparent;
          border: none;
          cursor: pointer;
          font-size: 16px;
          text-decoration: underline;
          display: inline;
          margin-left: 5px;
        }

        .overlay-text {
          position: absolute;
          top: 60%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: rgb(255, 255, 255);
          font-size: 40px;
          font-weight: 700;
          text-align: center;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
          animation: fadeIn 2s ease-in-out forwards;
          display: inline-block;
          background-color: #15533b8a;
          padding: 10px 15px;
          border-radius: 5px;
        }

        .highlight {
          background-color: #222220;
          padding: 2px 4px;
        }

        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        @media (max-width: 768px) {
          .hero {
            height: 350px;
          }

          .hero-buttons button {
            padding: 12px;
          }

          .generate-button {
            font-size: 16px;
            padding: 12px 25px;
          }

          .cta-buttons {
            flex-direction: column;
            gap: 15px;
          }
        }
      `}</style>

      {/* Top Banner (Header) */}
      <div className="top-banner">
        <div className="nav">
          {session === null ? null : session ? (
            <Link href="/dashboard" className="text-sm font-medium">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/help">Help</Link>
            </>
          )}
        </div>
      </div>

      {/* Logo Banner */}
      <div className="logo-banner">
        <Image
          src="/logo_homepage.png"
          alt="Logo"
          width={360}
          height={60}
          priority
        />
     
      </div>

      {/* Hero Section (Image Slider) */}
      <div className="hero">
        {images.map((image, index) => (
          <Image
            key={image.src}
            src={image.src}
            alt={image.alt}
            className={index === currentIndex ? "active" : ""}
            fill
            style={{ objectFit: "cover" }}
            priority={index === 0}
          />
        ))}
        <div className="hero-buttons">
          <button onClick={prevImage} aria-label="Previous Image">
            ❮
          </button>
          <button onClick={nextImage} aria-label="Next Image">
            ❯
          </button>
        </div>
        <div className="overlay-text">
          Welcome to
          <p>Online Date Sheet Generator</p>
        </div>
      </div>

      {/* Call-to-Action Button */}
      {session !== null && (
        <Link href={session ? "/dashboard" : "/login"}>
          <Button className="generate-button">
            Go to {session ? "Dashboard" : "Login Page"}
          </Button>
        </Link>
      )}

      {/* CTA Buttons */}
      <div className="cta-buttons">
        <Link href="/help">
          <Button>Need Help?</Button>
        </Link>
        <Link href="/contact">
          <Button>Contact Us</Button>
        </Link>
      </div>

      {/* Main Content */}
     
      {/* Footer */}
      <footer>
        <div className="footer-content">
          <p>
            <strong>About Online Date Sheet Generator</strong>
          </p>
          <p>
            Our online date sheet generator streamlines the process of creating
            customized academic schedules, enabling educational institutions and
            students to effortlessly design and manage date sheets that align with
            specific
          </p>
          <span className="more-text">
            requirements. By inputting essential details such as exam dates,
            subjects, and time slots, users can generate organized and
            professional date sheets tailored to their academic calendars. This
            tool aims to enhance efficiency, reduce scheduling conflicts, and
            ensure clarity in academic planning.
          </span>
          <button className="read-more-btn" onClick={toggleText}>
            {showMore ? "Read Less" : "Read More"}
          </button>
        </div>
      </footer>
    </div>
  );
}
