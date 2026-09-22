import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";

export default function Footer() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axiosInstance
      .get("/categories")
      .then((res) => {
        const list =
          res.data?.data?.categories ||
          res.data?.categories ||
          res.data?.data ||
          [];
        setCategories(Array.isArray(list) ? list.slice(0, 8) : []);
      })
      .catch(() => setCategories([]));
  }, []);

  return (
    <footer className="mt-16 bg-ink text-white">
      <div className="max-w-site mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <h2 className="font-display text-2xl font-bold">Industry Odisha</h2>
            <p className="mt-3 text-sm text-white/65 leading-relaxed">
              Trusted headlines, analysis and local stories — delivered with
              clarity for readers across Odisha and beyond.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4">
              Sections
            </h3>
            <ul className="space-y-2 text-sm text-white/80">
              {categories.length ? (
                categories.map((cat) => (
                  <li key={cat._id}>
                    <Link
                      to={`/category/${cat.slug}`}
                      className="hover:text-white transition"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>Politics</li>
                  <li>Business</li>
                  <li>Sports</li>
                  <li>Entertainment</li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4">
              Quick links
            </h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <Link to="/about" className="hover:text-white">
                  About us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-white">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-white">
                  Search
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  className="hover:text-white text-left"
                  onClick={() =>
                    window.dispatchEvent(new CustomEvent("open-subscribe"))
                  }
                >
                  Subscribe to newsletter
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4">
              Follow us
            </h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li>Facebook</li>
              <li>X (Twitter)</li>
              <li>Instagram</li>
              <li>YouTube</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-sm text-white/45">
          © {new Date().getFullYear()} Industry Odisha. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
