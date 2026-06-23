import { useEffect, useState } from "react";

const App = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [nextCursor, setNextCursor] = useState(null);
  const [cursorHistory, setCursorHistory] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchProducts = (category = "", cursor = "") => {
    let url = `${API_URL}/api/products?limit=20`;

    if (category) {
      url += `&category=${category}`;
    }

    if (cursor) {
      url += `&cursor=${cursor}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products);
        setNextCursor(data.nextCursor);
      })
      .catch(console.error);
  };

  const fetchCategories = () => {
    fetch(`${API_URL}/api/products/categories`)
      .then((res) => res.json())
      .then(setCategories)
      .catch(console.error);
  };

  const simulateProducts = () => {
    fetch(`${API_URL}/api/products/simulate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        category: selectedCategory || undefined,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        setCursorHistory([]);
        fetchProducts(selectedCategory);
      })
      .catch(console.error);
  };

  const handleNext = () => {
    if (!nextCursor) return;

    setCursorHistory((prev) => [...prev, nextCursor]);

    fetchProducts(selectedCategory, nextCursor);
  };

  const handlePrevious = () => {
    if (cursorHistory.length <= 1) {
      setCursorHistory([]);
      fetchProducts(selectedCategory);
      return;
    }

    const updatedHistory = [...cursorHistory];
    updatedHistory.pop();

    const previousCursor = updatedHistory[updatedHistory.length - 1];

    setCursorHistory(updatedHistory);

    if (previousCursor) {
      fetchProducts(selectedCategory, previousCursor);
    } else {
      fetchProducts(selectedCategory);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Product Catalog (Cursor Pagination)</h1>

      <div style={{ marginBottom: "20px" }}>
        <label>Category: </label>

        <select
          value={selectedCategory}
          onChange={(e) => {
            const category = e.target.value;

            setSelectedCategory(category);
            setCursorHistory([]);

            fetchProducts(category);
          }}
        >
          <option value="">All Categories</option>

          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <button onClick={simulateProducts} style={{ marginLeft: "20px" }}>
          Simulate Adding 50 Products
        </button>
      </div>

      <div>
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              borderBottom: "1px solid #ccc",
              padding: "10px 0",
            }}
          >
            <strong>{product.name}</strong>
            <br />
            Category: {product.category}
            <br />
            Price: ₹{product.price}
            <br />
            <small>
              ID: {product.id} | Created:{" "}
              {new Date(product.createdAt).toLocaleDateString()}
            </small>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={handlePrevious} disabled={cursorHistory.length === 0}>
          Previous Page
        </button>

        <button
          style={{ marginLeft: "15px" }}
          onClick={handleNext}
          disabled={!nextCursor}
        >
          Next Page
        </button>
      </div>
    </div>
  );
};

export default App;
