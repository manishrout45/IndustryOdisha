import React, { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";


export default function SearchBar() {

  const [keyword, setKeyword] = useState("");

  const navigate = useNavigate();

  const submit = (e) => {

    e.preventDefault();

    if (!keyword.trim()) return;

    navigate(`/search?q=${encodeURIComponent(keyword.trim())}`);

  };

  return (

    <div className="border-b">

      <div className="max-w-7xl mx-auto py-4 px-4">

        <form onSubmit={submit}>

          <div className="relative">

            <input
              value={keyword}
              onChange={(e)=>setKeyword(e.target.value)}
              placeholder="Search news..."
              className="w-full border rounded-full py-3 pl-6 pr-14 outline-none focus:border-blue-500"
            />

            <button
              className="absolute right-5 top-1/2 -translate-y-1/2"
            >

              <Search size={22} />

            </button>

          </div>

        </form>

      </div>

    </div>

  );

}