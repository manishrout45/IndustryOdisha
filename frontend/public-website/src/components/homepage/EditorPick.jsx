import React from "react";

function EditorPick() {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-5">
        Editor's Pick
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((item) => (
          <div key={item} className="border p-4 rounded-lg">
            <h3>
              Editor Pick {item}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
}

export default EditorPick;