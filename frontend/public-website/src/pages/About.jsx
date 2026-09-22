import React from "react";
import MainLayout from "../layouts/MainLayout";

function About() {
  return (
    <MainLayout>
      <div className="max-w-site mx-auto px-4 py-8 md:py-12">
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-ink mb-4 sm:mb-5">
          About Us
        </h1>

        <p className="text-sm sm:text-base text-ink-muted leading-relaxed max-w-3xl">
          We are an independent news platform committed to delivering accurate,
          reliable and timely news.
        </p>
      </div>
    </MainLayout>
  );
}

export default About;
