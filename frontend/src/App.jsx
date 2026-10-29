import { useEffect, useState, useCallback } from "react";
import "./App.css";

const API = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(/\/$/, "");

const emptyForm = {
  foodId: "", name: "", category: "", cuisine: "",
  ingredients: "", price: "", quantity: "", description: "", imageUrl: "",
};

async function request(path, options) {
  const res = await fetch(API + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.errors ? ": " + data.errors.join(", ") : "";
    throw new Error((data.message || "Loi " + res.status) + detail);
  }
  return data;
}

export default function App() {
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async (keyword) => {
    setLoading(true);
    setError("");
    try {
      const q = keyword ? "?search=" + encodeURIComponent(keyword) : "";
      setFoods(await request("/api/foods" + q));
    } catch (e) {
      setError("Khong tai duoc du lieu: " + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(""); }, [load]);

  const onSearch = (e) => { e.preventDefault(); load(search.trim()); };

  const openAdd = () => {
    setForm(emptyForm); setEditingId(null); setShowForm(true);
    setError(""); setNotice("");
  };

  const openEdit = (f) => {
    setForm({ ...f, ingredients: (f.ingredients || []).join(", ") });
    setEditingId(f.foodId); setShowForm(true);
    setError(""); setNotice("");
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(""); setNotice("");
    const body = {
      foodId: form.foodId, name: form.name, category: form.category,
      cuisine: form.cuisine, ingredients: form.ingredients,
      price: form.price, quantity: form.quantity,
      description: form.description, imageUrl: form.imageUrl,
    };
    try {
      if (editingId) {
        await request("/api/foods/" + editingId, { method: "PUT", body: JSON.stringify(body) });
        setNotice("Cap nhat mon an thanh cong");
      } else {
        await request("/api/foods", { method: "POST", body: JSON.stringify(body) });
        setNotice("Them mon an thanh cong");
      }
      setShowForm(false);
      load(search.trim());
    } catch (e) {
      setError(e.message);
    }
  };

  const onDelete = async (f) => {
    if (!window.confirm("Xoa mon " + f.name + "?")) return;
    setError(""); setNotice("");
    try {
      await request("/api/foods/" + f.foodId, { method: "DELETE" });
      setNotice("Da xoa mon " + f.name);
      if (detail && detail.foodId === f.foodId) setDetail(null);
      load(search.trim());
    } catch (e) {
      setError(e.message);
    }
  };

  const onView = async (f) => {
    setError("");
    try {
      setDetail(await request("/api/foods/" + f.foodId));
    } catch (e) {
      setError(e.message);
    }
  };

  const money = (n) => Number(n).toLocaleString("vi-VN") + " d";

  return (
    <div className="container">
      <h1>Quan ly mon an</h1>

      <form className="bar" onSubmit={onSearch}>
        <input
          placeholder="Tim theo ten, loai mon, vung mien..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit">Tim kiem</button>
        <button type="button" onClick={() => { setSearch(""); load(""); }}>Tat ca</button>
        <button type="button" className="primary" onClick={openAdd}>+ Them mon</button>
      </form>

      {loading && <p className="info">Dang tai du lieu...</p>}
      {error && <p className="error">{error}</p>}
      {notice && <p className="success">{notice}</p>}

      {showForm && (
        <form className="form" onSubmit={onSubmit}>
          <h2>{editingId ? "Cap nhat mon an" : "Them mon an"}</h2>
          <input name="foodId" placeholder="Ma mon (vd F004)" value={form.foodId} onChange={onChange} required />
          <input name="name" placeholder="Ten mon" value={form.name} onChange={onChange} required />
          <input name="category" placeholder="Loai mon" value={form.category} onChange={onChange} required />
          <input name="cuisine" placeholder="Am thuc / vung mien" value={form.cuisine} onChange={onChange} required />
          <input name="ingredients" placeholder="Nguyen lieu (cach nhau boi dau phay)" value={form.ingredients} onChange={onChange} />
          <input name="price" type="number" min="0" placeholder="Gia ban" value={form.price} onChange={onChange} required />
          <input name="quantity" type="number" min="0" placeholder="So luong" value={form.quantity} onChange={onChange} required />
          <input name="imageUrl" placeholder="Duong dan hinh anh (neu co)" value={form.imageUrl} onChange={onChange} />
          <textarea name="description" placeholder="Mo ta" value={form.description} onChange={onChange} />
          <div className="row">
            <button type="submit" className="primary">Luu</button>
            <button type="button" onClick={() => setShowForm(false)}>Huy</button>
          </div>
        </form>
      )}

      {detail && (
        <div className="detail">
          <h2>{detail.name} ({detail.foodId})</h2>
          {detail.imageUrl && <img src={detail.imageUrl} alt={detail.name} />}
          <p><b>Loai:</b> {detail.category} | <b>Vung mien:</b> {detail.cuisine}</p>
          <p><b>Nguyen lieu:</b> {(detail.ingredients || []).join(", ")}</p>
          <p><b>Gia:</b> {money(detail.price)} | <b>So luong:</b> {detail.quantity}</p>
          <p><b>Mo ta:</b> {detail.description}</p>
          <button onClick={() => setDetail(null)}>Dong</button>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>Ma</th><th>Ten mon</th><th>Loai</th><th>Vung mien</th>
            <th>Gia</th><th>SL</th><th>Thao tac</th>
          </tr>
        </thead>
        <tbody>
          {foods.map((f) => (
            <tr key={f.foodId}>
              <td>{f.foodId}</td>
              <td>{f.name}</td>
              <td>{f.category}</td>
              <td>{f.cuisine}</td>
              <td>{money(f.price)}</td>
              <td>{f.quantity}</td>
              <td className="actions">
                <button onClick={() => onView(f)}>Xem</button>
                <button onClick={() => openEdit(f)}>Sua</button>
                <button className="danger" onClick={() => onDelete(f)}>Xoa</button>
              </td>
            </tr>
          ))}
          {!loading && foods.length === 0 && (
            <tr><td colSpan="7" className="empty">Khong co mon an nao</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
