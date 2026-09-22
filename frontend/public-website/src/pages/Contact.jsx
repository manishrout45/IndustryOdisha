import React from "react";
import MainLayout from "../layouts/MainLayout";

function Contact() {
  return (
    <MainLayout>
      <div className="max-w-site mx-auto px-4 py-8 md:py-12">
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-ink mb-4 sm:mb-5">
          Contact Us
        </h1>

        <div className="space-y-2 text-sm sm:text-base text-ink leading-relaxed">
          <p>
            Email:{" "}
            <a
              href="mailto:info@industryodisha.com"
              className="text-accent hover:underline break-all"
            >
              info@industryodisha.com
            </a>
          </p>
          <p>
            Phone:{" "}
            <a href="tel:+919437000000" className="text-accent hover:underline">
              +91 94370 00000
            </a>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

export default Contact;
