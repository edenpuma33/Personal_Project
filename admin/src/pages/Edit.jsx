import { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { useSearchParams, useNavigate } from "react-router-dom";

const Edit = ({ token }) => {
  // เก็บข้อมูลสินค้าที่ดึงมาจาก backend
  const [selectedProduct, setSelectedProduct] = useState(null);
  // เก็บข้อมูลฟอร์มที่แก้ไขได้ (ชื่อ, คำอธิบาย, ราคา, หมวดหมู่, ฯลฯ)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Men",
    subCategory: "Football kits",
    bestseller: false,
    sizes: [],
  });
  // newImages: เก็บไฟล์รูปภาพใหม่ที่ผู้ใช้เลือกอัปโหลด (สูงสุด 5 รูป)
  const [newImages, setNewImages] = useState({
    image1: null,
    image2: null,
    image3: null,
    image4: null,
    image5: null,
  });

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // ดึงข้อมูลสินค้าจาก backend โดยใช้ productId
  const fetchProductById = async (productId) => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        const product = response.data.product;
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
      } else {
        toast.error(response.data.message);
        navigate("/list");
      }
    } catch (error) {
      toast.error("Failed to fetch product details");
      navigate("/list");
    }
  };

  useEffect(() => {
    const productId = searchParams.get("productId");
    if (productId) {
      fetchProductById(productId);
    } else {
      toast.error("No product ID provided");
      navigate("/list");
    }
  }, [token, searchParams, navigate]);

  // อัปเดต formData เมื่อผู้ใช้กรอกข้อมูล
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value, // ถ้าเป็น checkbox ใช้ checked (boolean); ถ้าไม่ใช่ ใช้ value
    }));
  };

  // อัปเดต newImages เมื่อผู้ใช้เลือกไฟล์รูปภาพ
  const handleImageChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setNewImages((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  // Toggle ขนาดสินค้าใน array sizes ถ้ามีอยู่แล้ว ลบออก ถ้าไม่มี เพิ่มเข้าไป
  const toggleSize = (size) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  // สร้าง FormData และเพิ่มข้อมูลทั้งหมด
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("id", selectedProduct.id);
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("price", Number(formData.price));
    formDataToSend.append("category", formData.category);
    formDataToSend.append("subCategory", formData.subCategory);
    formDataToSend.append("sizes", JSON.stringify(formData.sizes));
    formDataToSend.append("bestseller", Boolean(formData.bestseller));

    // เพิ่มไฟล์รูปภาพใหม่ (ถ้ามี)
    if (newImages.image1) formDataToSend.append("image1", newImages.image1);
    if (newImages.image2) formDataToSend.append("image2", newImages.image2);
    if (newImages.image3) formDataToSend.append("image3", newImages.image3);
    if (newImages.image4) formDataToSend.append("image4", newImages.image4);
    if (newImages.image5) formDataToSend.append("image5", newImages.image5);

    try {
      const response = await axios.post(
        `${backendUrl}/api/product/update`,
        formDataToSend,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );
      if (response.data.success) {
        toast.success("Product updated successfully");
        navigate("/list");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to update product");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Edit Product</h1>
      { selectedProduct ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                  className={`px-3 py-1 rounded ${formData.sizes.includes(size) ? "bg-pink-100" : "bg-slate-200"}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          {/* แสดงรูปภาพปัจจุบัน */}
          {selectedProduct.image && (
            <div className="mb-4">
              <p className="mb-2">Current Images</p>
              <div className="flex flex-wrap gap-2">
                {selectedProduct.image.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Image ${index + 1}`}
                    className="w-20 h-20 object-cover"
                  />
                ))}
              </div>
            </div>
          )}
          {/* Input สำหรับอัปโหลดรูปภาพใหม่ */}
          <div>
            <p className="mb-2">Upload New Images (optional)</p>
            <input type="file" name="image1" onChange={handleImageChange} className="mb-2" />
            <input type="file" name="image2" onChange={handleImageChange} className="mb-2" />
            <input type="file" name="image3" onChange={handleImageChange} className="mb-2" />
            <input type="file" name="image4" onChange={handleImageChange} className="mb-2" />
            <input type="file" name="image5" onChange={handleImageChange} className="mb-2" />
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
            className={`w-28 py-3 bg-[#034694] text-white rounded`}
          >
          </button>
        </form>
      ) : (
        <p className="text-gray-500">No product selected. Please select a product from the list.</p>
      )}
    </div>
  );
};

export default Edit;