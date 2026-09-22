import { Link } from "react-router-dom";

function CategoryCard({
  category,
}) {
  return (
    <Link
      to={`/category/${category.slug}`}
      className="block border rounded-lg p-5 hover:shadow"
    >
      <h3 className="font-bold">
        {category.name}
      </h3>

      <p className="text-gray-500 mt-2">
        {category.totalArticles} Articles
      </p>
    </Link>
  );
}

export default CategoryCard;