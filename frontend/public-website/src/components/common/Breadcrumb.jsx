import React from "react";
import { Link } from "react-router-dom";

function Breadcrumb({
  items = [],
}) {
  return (
    <div className="flex gap-2 text-sm mb-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="flex gap-2"
        >
          <Link
            to={item.link}
            className="text-blue-600"
          >
            {item.name}
          </Link>

          {index !== items.length - 1 && (
            <span>/</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default Breadcrumb;