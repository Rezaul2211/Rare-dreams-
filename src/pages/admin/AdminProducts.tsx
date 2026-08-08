import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Product } from '../../types';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        console.error("Error deleting product", error);
        alert('Failed to delete product');
      }
    }
  };

  if (loading) return <div>Loading products...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <Link 
          to="/admin/products/new"
          className="bg-black text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 hover:bg-neutral-800 transition-colors"
        >
          <Plus size={20} />
          <span>Add Product</span>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200 text-sm uppercase tracking-wider text-neutral-500">
              <th className="p-4 font-medium">Product</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Stock</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-neutral-500">
                  No products found. Add your first product!
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="p-4 flex items-center space-x-4">
                    <div className="w-12 h-16 bg-neutral-200 overflow-hidden rounded">
                      {product.images && product.images.length > 0 && (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <span className="font-medium text-neutral-900">{product.name}</span>
                  </td>
                  <td className="p-4 text-neutral-600">{product.category}</td>
                  <td className="p-4 text-neutral-900 font-medium">${product.price.toFixed(2)}</td>
                  <td className="p-4 text-neutral-600">{product.stockQuantity}</td>
                  <td className="p-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                      product.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-800'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Link 
                      to={`/admin/products/edit/${product.id}`}
                      className="inline-flex p-2 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded transition-colors"
                    >
                      <Edit size={18} />
                    </Link>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="inline-flex p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
