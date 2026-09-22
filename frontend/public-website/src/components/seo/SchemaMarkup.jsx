import { Helmet } from "react-helmet-async";

function SchemaMarkup({ schema }) {
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}

export default SchemaMarkup;