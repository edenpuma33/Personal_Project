import { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAllOrders = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/list`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        // อัปเดต orders ด้วยข้อมูลจาก response.data.orders (ถ้าไม่มีให้เป็น array ว่าง)
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // อัปเดตสถานะคำสั่งซื้อใน backend และ UI
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/status`,
        { orderId, status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Order status updated successfully");
        // อัปเดต orders โดยเปลี่ยน status ของคำสั่งซื้อที่มี id ตรงกับ orderId
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to update order status: " + error.message);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto bg-white min-h-screen">
      <h3 className="text-xl font-bold mb-6 text-gray-700">Order Page</h3>
      <div className="space-y-4">
        {orders.length === 0 ? (
          <p className="text-gray-500 text-center py-8 text-sm sm:text-base">
            No orders found at the moment.
          </p>
        ) : (
          orders.map((order, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-[0.5fr_1fr_0.5fr] gap-4 border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {/* Items Section */}
              <div className="flex items-start gap-3">
                <img
                  src={assets.parcel_icon}
                  alt="Parcel Icon"
                  className="w-8 h-8 object-contain flex-shrink-0"
                />
                <div className="space-y-1">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, idx) => (
                      <p
                        key={item.id || idx}
                        className="text-xs sm:text-sm text-gray-700 leading-tight"
                      >
                        {item.product?.name || "Unknown Product"} ×{" "}
                        {item.quantity}{" "}
                        <span className="text-gray-500">
                          ({item.size || "N/A"})
                        </span>
                      </p>
                    ))
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-500">
                      No items in this order.
                    </p>
                  )}
                </div>
              </div>

              {/* Order Details */}
              <div className="text-xs sm:text-sm text-gray-600 space-y-2">
                <p>
                  <span className="font-medium text-gray-900">Date:</span>{" "}
                  {new Date(order.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <p>
                  <span className="font-medium text-gray-900">Payment:</span>{" "}
                  {order.paymentMethod}
                </p>
                <p>
                  <span className="font-medium text-gray-900">Total:</span>{" "}
                  <span className="text-green-600">${order.amount}</span>
                </p>
                <p>
                  <span className="font-medium text-gray-900">User ID:</span>{" "}
                  {order.UserId}
                </p>
              </div>

              {/* Address & Status */}
              <div className="flex flex-col gap-2">
                <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium text-gray-900">Name:</span>{" "}
                    {order.address.firstName} {order.address.lastName}
                  </p>
                  <p>
                    <span className="font-medium text-gray-900">Address:</span>{" "}
                    {order.address.street}
                  </p>
                </div>
                <select
                  value={order.status || "Order Placed"} // Default to "Order Placed" if status is undefined
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="Order Placed">Order Placed</option>
                  <option value="Packing">Packing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
