import { useState, useEffect } from "react";

const API_URL = "http://localhost:5000";

export default function AdminDashboardModern() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [loggedIn, setLoggedIn] = useState(Boolean(token));
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [activeSection, setActiveSection] = useState("Products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [newProduct, setNewProduct] = useState({
    title: "",
    price: "",
    desc: "",
    image: "",
  });
  const [editingProductId, setEditingProductId] = useState(null);
  const [editProductData, setEditProductData] = useState({});

  // --- Login ---
  const handleLogin = (e) => {
    e.preventDefault();
    const { email, password } = loginData;
    if (email === "admin@gmail.com" && password === "admin123") {
      const fakeToken = "admin-token-123";
      localStorage.setItem("token", fakeToken);
      setToken(fakeToken);
      setLoggedIn(true);
    } else alert("Invalid admin credentials");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    setToken("");
  };

  // --- Fetch data ---
  useEffect(() => {
    if (!loggedIn) return;
    let mounted = true;

    fetch(API_URL + "/products")
      .then((r) => r.json())
      .then((d) => {
        if (mounted) setProducts(Array.isArray(d) ? d : []);
      })
      .catch(console.log);

    fetch(API_URL + "/orders", { headers: { "x-access-token": token } })
      .then((r) => r.json())
      .then((d) => {
        if (mounted) setOrders(Array.isArray(d) ? d : []);
      })
      .catch(console.log);

    fetch(API_URL + "/users", { headers: { "x-access-token": token } })
      .then((r) => r.json())
      .then((d) => {
        if (mounted) setUsers(Array.isArray(d) ? d : []);
      })
      .catch(console.log);

    return () => {
      mounted = false;
    };
  }, [loggedIn, token]);

  const sections = ["Products", "Orders", "Users"];

  // --- Product CRUD ---
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const product = { ...newProduct, price: Number(newProduct.price) };
    try {
      const res = await fetch(API_URL + "/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
        body: JSON.stringify(product),
      });
      if (!res.ok) throw new Error("Failed to add product");
      const saved = await res.json();
      setProducts([product, ...products]);
      setNewProduct({ title: "", price: "", desc: "", image: "" });
      alert("Product added successfully");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const res = await fetch(API_URL + `/products/${id}`, {
        method: "DELETE",
        headers: { "x-access-token": token },
      });
      if (!res.ok) throw new Error("Failed to delete");
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProductId(product._id);
    setEditProductData({ ...product });
  };
  const handleSaveEdit = async (id) => {
    try {
      const res = await fetch(API_URL + `/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
        body: JSON.stringify({
          ...editProductData,
          price: Number(editProductData.price),
        }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setProducts(products.map((p) => (p._id === id ? editProductData : p)));
      setEditingProductId(null);
    } catch (err) {
      alert(err.message);
    }
  };
  const handleCancelEdit = () => setEditingProductId(null);

  if (!loggedIn) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontFamily: "Arial",
        }}
      >
        <form
          onSubmit={handleLogin}
          style={{
            background: "#f4f6f8",
            padding: "30px",
            borderRadius: "10px",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ textAlign: "center" }}>Admin Login</h2>
          <input
            type="email"
            required
            placeholder="Email"
            value={loginData.email}
            onChange={(e) =>
              setLoginData({ ...loginData, email: e.target.value })
            }
            style={inputStyle}
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={loginData.password}
            onChange={(e) =>
              setLoginData({ ...loginData, password: e.target.value })
            }
            style={inputStyle}
          />
          <button type="submit" style={btnStyleGreen}>
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Arial" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "220px",
          background: "#1E1E2F",
          color: "#fff",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h2 style={{ marginBottom: "30px" }}>Admin Panel</h2>
        {sections.map((s) => (
          <div
            key={s}
            onClick={() => setActiveSection(s)}
            style={{
              padding: "10px 15px",
              marginBottom: "10px",
              borderRadius: "5px",
              cursor: "pointer",
              background: activeSection === s ? "#4CAF50" : "transparent",
              transition: "0.2s",
            }}
          >
            {s}
          </div>
        ))}
        <button
          onClick={handleLogout}
          style={{ marginTop: "auto", ...btnStyleRed, width: "100%" }}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px", background: "#f4f6f8" }}>
        <h1>{activeSection}</h1>

        {activeSection === "Products" && (
          <>
            <section style={{ margin: "20px 0" }}>
              <h2>Add Product</h2>
              <form
                onSubmit={handleAddProduct}
                style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
              >
                <input
                  placeholder="Title"
                  value={newProduct.title}
                  required
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, title: e.target.value })
                  }
                  style={inputStyle}
                />
                <input
                  placeholder="Price"
                  type="number"
                  value={newProduct.price}
                  required
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, price: e.target.value })
                  }
                  style={inputStyle}
                />
                <input
                  placeholder="Description"
                  value={newProduct.desc}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, desc: e.target.value })
                  }
                  style={inputStyle}
                />
                <input
                  placeholder="Image URL"
                  value={newProduct.image}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, image: e.target.value })
                  }
                  style={inputStyle}
                />
                <button type="submit" style={btnStyleGreen}>
                  Add
                </button>
              </form>
            </section>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
              {products.map((p) => (
                <div key={p._id} style={cardStyle}>
                  {editingProductId === p._id ? (
                    <>
                      <input
                        value={editProductData.title}
                        onChange={(e) =>
                          setEditProductData({
                            ...editProductData,
                            title: e.target.value,
                          })
                        }
                        style={inputStyle}
                      />
                      <input
                        type="number"
                        value={editProductData.price}
                        onChange={(e) =>
                          setEditProductData({
                            ...editProductData,
                            price: e.target.value,
                          })
                        }
                        style={inputStyle}
                      />
                      <input
                        value={editProductData.desc}
                        onChange={(e) =>
                          setEditProductData({
                            ...editProductData,
                            desc: e.target.value,
                          })
                        }
                        style={inputStyle}
                      />
                      <input
                        value={editProductData.image}
                        onChange={(e) =>
                          setEditProductData({
                            ...editProductData,
                            image: e.target.value,
                          })
                        }
                        style={inputStyle}
                      />
                      <div
                        style={{
                          display: "flex",
                          gap: "5px",
                          marginTop: "5px",
                        }}
                      >
                        <button
                          onClick={() => handleSaveEdit(p._id)}
                          style={btnStyleGreen}
                        >
                          Save
                        </button>
                        <button onClick={handleCancelEdit} style={btnStyleGray}>
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {p.image && (
                        <img
                          src={p.image}
                          alt={p.title}
                          style={{
                            width: "100%",
                            height: "140px",
                            objectFit: "cover",
                            borderRadius: "5px",
                          }}
                        />
                      )}
                      <h3>{p.title}</h3>
                      <p>₹{p.price}</p>
                      <p>{p.desc}</p>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: "10px",
                        }}
                      >
                        <button
                          onClick={() => handleEditProduct(p)}
                          style={btnStyleBlue}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p._id)}
                          style={btnStyleRed}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {activeSection === "Orders" && (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="2">No orders yet</td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o._id}>
                    <td>{o._id}</td>
                    <td>₹{o.amount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeSection === "Users" && (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="2">No users yet</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.fullname}</td>
                    <td>{u.email}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// --- Styles ---
const inputStyle = {
  padding: "5px 8px",
  borderRadius: "5px",
  border: "1px solid #ccc",
  minWidth: "150px",
};
const btnStyleGreen = {
  padding: "5px 12px",
  background: "#4CAF50",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  borderRadius: "5px",
};
const btnStyleRed = {
  padding: "5px 12px",
  background: "#f44336",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  borderRadius: "5px",
};
const btnStyleBlue = {
  padding: "5px 12px",
  background: "#2196F3",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  borderRadius: "5px",
};
const btnStyleGray = {
  padding: "5px 12px",
  background: "#9E9E9E",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  borderRadius: "5px",
};
const cardStyle = {
  border: "1px solid #ddd",
  borderRadius: "10px",
  padding: "10px",
  width: "220px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  transition: "0.2s",
  cursor: "pointer",
  textAlign: "center",
};
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  background: "#fff",
  padding: "10px",
  borderRadius: "8px",
};
