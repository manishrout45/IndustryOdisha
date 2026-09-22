import React from "react";
import { useState } from "react";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-6">
        Register
      </h1>

      <form className="space-y-4">
        <input
          name="name"
          placeholder="Name"
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <button
          className="w-full bg-red-600 text-white p-3 rounded"
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;