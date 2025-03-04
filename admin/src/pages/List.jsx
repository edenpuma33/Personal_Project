import axios from "axios";
import { useEffect, useState } from "react";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const fetchList = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  const removeProduct = async (id) => {
    try {
      const response = await axios.delete(`${backendUrl}/api/product/remove`, {
        data: { id },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        toast.success(response.data.message);
        setList((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (error) {
      toast.error("Failed to remove product");
    }
  };

  const handleEdit = (productId) => {
    navigate(`/edit?productId=${productId}`); // Navigate to edit page with product ID as query param
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div>
      <p className="mb-2 text-lg font-semibold">All Products List</p>
      {isLoading ? (
        <p>Loading products...</p>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="hidden md:grid grid-cols-[1fr_3fr_2fr_1fr_1fr_1fr] items-center py-2 px-4 border bg-gray-100 text-sm font-semibold">
            <span>Image</span>
            <span>Name</span>
            <span>Category</span>
            <span>Price</span>
            <span>Edit</span>
            <span>Action</span>
          </div>
          {list.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_2fr_1fr_1fr_1fr] items-center gap-2 py-2 px-4 border hover:bg-gray-50"
            >
              <img
                className="w-12 h-12 object-cover"
                src={item.image[0]}
                alt={item.name}
              />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>
                {currency}
                {item.price}
              </p>
              <button
                onClick={() => handleEdit(item.id)}
                className="text-blue-500 flex text-right md:text-center"
              >
                Edit
              </button>
              <button
                onClick={() => removeProduct(item.id)}
                className="text-red-500 flex text-right md:text-center"
              >
                X
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default List;
