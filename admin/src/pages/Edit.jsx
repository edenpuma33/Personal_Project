import { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";

const Edit = ({ token }) => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Men",
    subCategory: "Football kits",
    bestseller: false,
    sizes: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to fetch products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      subCategory: product.subCategory,
      bestseller: product.bestSeller,
      sizes: product.sizes || [],
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleSize = (size) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${backendUrl}/api/product/update`,
        {
          id: selectedProduct.id,
          ...formData,
          sizes: JSON.stringify(formData.sizes),
          price: Number(formData.price),
          bestseller: Boolean(formData.bestseller),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Product updated successfully");
        fetchProducts(); // Refresh the product list
        setSelectedProduct(null);
        setFormData({
          name: "",
          description: "",
          price: "",
          category: "Men",
          subCategory: "Football kits",
          bestseller: false,
          sizes: [],
        });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to update product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Edit Products</h1>
      <div className="flex gap-4">
        {/* Product List */}
        <div className="w-1/3">
          <h2 className="mb-2">Select Product to Edit</h2>
          <div className="border p-2 max-h-96 overflow-y-auto">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => handleSelectProduct(product)}
                className="p-2 border-b cursor-pointer hover:bg-gray-100"
              >
                {product.name} - {currency}
                {product.price}
              </div>
            ))}
          </div>
        </div>

        {/* Edit Form */}
        {selectedProduct && (
          <form onSubmit={handleSubmit} className="w-2/3 flex flex-col gap-4">
            <div>
              <p className="mb-2">Product Name</p>
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
                placeholder="Type here"
                required
              />
            </div>
            <div>
              <p className="mb-2">Price</p>
              <input
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
                type="number"
                min="0"
                step="0.01"
                placeholder="25.00"
                required
              />
            </div>
            <div>
              <p className="mb-2">Description</p>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
                rows="4"
                placeholder="Write content here"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="mb-2">Category</p>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Kids">Kids</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>
              <div>
                <p className="mb-2">Sub Category</p>
                <select
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="Kits">Kits</option>
                  <option value="Training">Training</option>
                  <option value="Retro">Retro</option>
                  <option value="Others">Gifts & Accessories</option>
                </select>
              </div>
            </div>
            <div>
              <p className="mb-2">Sizes</p>
              <div className="flex flex-wrap gap-2">
                {["XS", "S", "M", "L", "XL", "2XL"].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`px-3 py-1 rounded ${
                      formData.sizes.includes(size)
                        ? "bg-pink-100"
                        : "bg-slate-200"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2">
              <input
                name="bestseller"
                type="checkbox"
                checked={formData.bestseller}
                onChange={handleInputChange}
              />
              Add to Bestseller
            </label>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-28 py-3 bg-black text-white rounded ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Updating..." : "Update Product"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
export default Edit;
