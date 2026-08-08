import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, setDoc, getDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Product } from '../../types';
import { ArrowLeft, Save, X, UploadCloud, Image as ImageIcon } from 'lucide-react';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: 'Boys Wear',
    subcategory: '',
    price: 0,
    comparePrice: 0,
    stockQuantity: 0,
    sizeOptions: [],
    colorOptions: [],
    material: '',
    description: '',
    images: [],
    status: 'published',
    sku: ''
  });

  const [imageUrl, setImageUrl] = useState('');
  const [sizeInput, setSizeInput] = useState('');
  const [colorInput, setColorInput] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData(docSnap.data() as Product);
        }
      } catch (error) {
        console.error("Error fetching product", error);
      } finally {
        setFetching(false);
      }
    };
    if (isEditing) fetchProduct();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        alert('Please select valid image files');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setFormData(prev => ({
            ...prev,
            images: [...(prev.images || []), result]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const addImage = () => {
    if (imageUrl) {
      setFormData(prev => ({ ...prev, images: [...(prev.images || []), imageUrl] }));
      setImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  };

  const addArrayItem = (field: 'sizeOptions' | 'colorOptions', input: string, setInput: (v: string) => void) => {
    if (input) {
      setFormData(prev => ({ ...prev, [field]: [...(prev[field] || []), input] }));
      setInput('');
    }
  };

  const removeArrayItem = (field: 'sizeOptions' | 'colorOptions', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing && id) {
        await updateDoc(doc(db, 'products', id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
      } else {
        const newDocRef = doc(collection(db, 'products'));
        await setDoc(newDocRef, {
          ...formData,
          id: newDocRef.id,
          createdAt: serverTimestamp()
        });
      }
      navigate('/admin/products');
    } catch (error) {
      console.error("Error saving product", error);
      alert("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center space-x-4 mb-8">
        <button onClick={() => navigate('/admin/products')} className="p-2 bg-white rounded-full border border-neutral-200 hover:bg-neutral-50 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold tracking-tight">{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold mb-4">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Product Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                <textarea
                  name="description"
                  required
                  rows={6}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Images */}
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold mb-2">Product Images</h2>
              
              {/* Local File Upload Button */}
              <div className="border-2 border-dashed border-neutral-300 rounded-xl p-4 text-center hover:bg-neutral-50 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                  <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-700">
                    <UploadCloud size={20} />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-neutral-900 underline decoration-2">Upload from Phone / PC Storage</span>
                    <p className="text-xs text-neutral-500 mt-0.5">Supports JPG, PNG, WEBP files</p>
                  </div>
                </label>
              </div>

              {/* URL Option as alternative */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-neutral-500 mb-1">Or add image via web URL:</label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 border border-neutral-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-black"
                  />
                  <button type="button" onClick={addImage} className="bg-neutral-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-black">
                    Add URL
                  </button>
                </div>
              </div>

              {/* Image Previews */}
              <div className="grid grid-cols-4 gap-4 mt-4">
                {(formData.images || []).map((img, idx) => (
                  <div key={idx} className="relative aspect-[3/4] bg-neutral-100 rounded-lg overflow-hidden group border border-neutral-200">
                    <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1.5 right-1.5 bg-black/70 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      title="Remove image"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Variants */}
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold mb-4">Variants & Attributes</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Sizes</label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="e.g. S, M, L"
                      value={sizeInput}
                      onChange={(e) => setSizeInput(e.target.value)}
                      className="flex-1 border border-neutral-300 rounded-lg px-3 py-1.5 text-sm outline-none"
                    />
                    <button type="button" onClick={() => addArrayItem('sizeOptions', sizeInput, setSizeInput)} className="bg-neutral-200 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-neutral-300">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(formData.sizeOptions || []).map((size, idx) => (
                      <span key={idx} className="inline-flex items-center bg-neutral-100 px-2 py-1 rounded-md text-sm border border-neutral-200">
                        {size}
                        <button type="button" onClick={() => removeArrayItem('sizeOptions', idx)} className="ml-2 text-neutral-500 hover:text-red-500"><X size={14} /></button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Colors</label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="e.g. Black, White"
                      value={colorInput}
                      onChange={(e) => setColorInput(e.target.value)}
                      className="flex-1 border border-neutral-300 rounded-lg px-3 py-1.5 text-sm outline-none"
                    />
                    <button type="button" onClick={() => addArrayItem('colorOptions', colorInput, setColorInput)} className="bg-neutral-200 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-neutral-300">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(formData.colorOptions || []).map((color, idx) => (
                      <span key={idx} className="inline-flex items-center bg-neutral-100 px-2 py-1 rounded-md text-sm border border-neutral-200">
                        {color}
                        <button type="button" onClick={() => removeArrayItem('colorOptions', idx)} className="ml-2 text-neutral-500 hover:text-red-500"><X size={14} /></button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold mb-4">Organization & Pricing</h2>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black outline-none font-medium"
                >
                  <option value="Boys Wear">Boys Wear</option>
                  <option value="Girls Wear">Girls Wear</option>
                  <option value="Baby Essentials">Baby Essentials</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Price ($)</label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Compare at Price ($)</label>
                <input
                  type="number"
                  name="comparePrice"
                  min="0"
                  step="0.01"
                  value={formData.comparePrice}
                  onChange={handleChange}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  name="stockQuantity"
                  min="0"
                  required
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2 outline-none"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white px-6 py-4 rounded-xl text-lg font-bold hover:bg-neutral-800 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Save size={20} />
              <span>{loading ? 'Saving...' : 'Save Product'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
