import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import { useNavigate } from "react-router-dom";

function App() {
  const [users, setUsers] = useState([]);
  const [filterusers, setFilterusers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState({ _id: "", name: "", age: "", city: "" });
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewData, setViewData] = useState({ name: "", age: "", city: "" });
  const navigate = useNavigate();

  const getAllUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8000/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
      setFilterusers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      alert("Failed to fetch users. Please try again.");
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      getAllUsers();
    }
  }, [navigate]);

  const handleSearchChange = (e) => {
    const searchText = e.target.value.toLowerCase();
    const filteredUsers = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchText) ||
        user.city.toLowerCase().includes(searchText)
    );
    setFilterusers(filteredUsers);
  };

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this record?");
    if (isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.delete(`http://localhost:8000/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
        setFilterusers(res.data);
      } catch (err) {
        console.error("Error deleting user:", err);
        alert("Failed to delete user. Please try again.");
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setUserData({ _id: "", name: "", age: "", city: "" });
  };

  const handleAddRecord = () => {
    setUserData({ _id: "", name: "", age: "", city: "" });
    setIsModalOpen(true);
  };

  const handleData = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (userData._id) {
        const res = await axios.patch(`http://localhost:8000/users/${userData._id}`, userData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(users.map((user) => (user._id === userData._id ? { ...userData } : user)));
        setFilterusers(
          filterusers.map((user) => (user._id === userData._id ? { ...userData } : user))
        );
        console.log("Update response:", res.data);
        alert("Record Updated Successfully");
      } else {
        const res = await axios.post("http://localhost:8000/users", userData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const newUser = { ...userData, _id: res.data._id };
        setUsers([...users, newUser]);
        setFilterusers([...filterusers, newUser]);
        console.log("Add response:", res.data);
        alert("Record Added Successfully");
      }
      closeModal();
    } catch (err) {
      console.error("Error submitting user data:", err);
      alert("Failed to save user. Please try again.");
    }
  };

  const handleUpdateRecord = (user) => {
    setUserData(user);
    setIsModalOpen(true);
  };

  const handleViewRecord = (user) => {
    setViewData(user);
    setIsViewModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      <div className="container">
        <h3>CRUD Application</h3>
        <div className="input-search">
          <input type="search" placeholder="Search by name or city" onChange={handleSearchChange} />
          <div>
            <button className="btn green" onClick={handleAddRecord}>
              Add Record
            </button>
            <button className="btn red" onClick={handleLogout} style={{ marginLeft: "10px" }}>
              Logout
            </button>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">S.NO</th>
              <th scope="col">NAME</th>
              <th scope="col">AGE</th>
              <th scope="col">CITY</th>
              <th scope="col">VIEW</th>
              <th scope="col">EDIT</th>
              <th scope="col">DELETE</th>
            </tr>
          </thead>
          <tbody>
            {filterusers &&
              filterusers.map((user, index) => (
                <tr key={user._id}>
                  <td>{index + 1}</td>
                  <td>{user.name}</td>
                  <td>{user.age}</td>
                  <td>{user.city}</td>
                  <td>
                    <button className="btn blue" onClick={() => handleViewRecord(user)}>
                      View
                    </button>
                  </td>
                  <td>
                    <button className="btn green" onClick={() => handleUpdateRecord(user)}>
                      Edit
                    </button>
                  </td>
                  <td>
                    <button onClick={() => handleDelete(user._id)} className="btn red">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {isViewModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={() => setIsViewModalOpen(false)}>×</span>
              <h2>View User Details</h2>
              <p><strong>Name:</strong> {viewData.name}</p>
              <p><strong>Age:</strong> {viewData.age}</p>
              <p><strong>City:</strong> {viewData.city}</p>
             
            </div>
          </div>
        )}
        {isModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={closeModal}>×</span>
              <h2>{userData._id ? "Update Record" : "Add Record"}</h2>
              <div className="input-group">
                <label htmlFor="name">User Name</label>
                <input
                  type="text"
                  value={userData.name}
                  name="name"
                  id="name"
                  onChange={handleData}
                />
              </div>
              <div className="input-group">
                <label htmlFor="age">Age</label>
                <input
                  type="number"
                  value={userData.age}
                  name="age"
                  id="age"
                  onChange={handleData}
                />
              </div>
              <div className="input-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  value={userData.city}
                  name="city"
                  id="city"
                  onChange={handleData}
                />
              </div>
              <button className="btn green" onClick={handleSubmit}>
                {userData._id ? "Update Record" : "Add Record"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;