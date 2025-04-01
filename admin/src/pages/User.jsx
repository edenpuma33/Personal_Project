import { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Users = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/manageuser/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        // อัปเดต users ด้วยข้อมูลจาก response.data.users
        setUsers(response.data.users);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    try {
      const response = await axios.delete(
        `${backendUrl}/api/manageuser/delete`,
        {
          data: { id: userId },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        toast.success("User deleted successfully");
        setUsers((prev) => prev.filter((user) => user.id !== userId));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Manage Users</h1>
      {isLoading ? (
        <p>Loading users...</p>
      ) : users.length === 0 ? (
        <p className="text-gray-500">No users found</p>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-[1fr_2fr_1fr_1fr] items-center py-2 px-4 border bg-gray-100 text-sm font-semibold">
            <span>ID</span>
            <span>Name</span>
            <span>Email</span>
            <span>Action</span>
          </div>
          {users.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-[1fr_2fr_1fr_1fr] items-center gap-2 py-2 px-4 border hover:bg-gray-50"
            >
              <p>{user.id}</p>
              <p>{user.name}</p>
              <p>{user.email}</p>
              <button
                onClick={() => deleteUser(user.id)}
                className="text-red-500 text-right"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default Users;
