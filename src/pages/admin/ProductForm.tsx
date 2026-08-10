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
    category: 'Boys Item',
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

    Array.from(files).forEach((file: File) => {
      if (!file.type.startsWith('image/')) {
        alert('Please select valid image files');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 1200;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);

            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            
            setFormData(prev => ({
              ...prev,
              images: [...(prev.images || []), compressedBase64]
            }));
          };
          img.src = result;
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
    <div className="max-w-4xl mx-auto px-2 sm:px-6 py-4 w-full overflow-hidden">
      <div className="flex items-center space-x-3 mb-6">
        <button onClick={() => navigate('/admin/products')} className="p-2 bg-white rounded-full border border-neutral-200 hover:bg-neutral-50 transition-colors shrink-0">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 truncate">{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6 w-full min-w-0">
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4 w-full min-w-0">
              <h2 className="text-base sm:text-lg font-bold">Basic Information</h2>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1">Product Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  placeholder="e.g. Premium Cotton Shirt"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1">Description</label>
                <textarea
                  name="description"
                  required
                  rows={5}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  placeholder="Detailed product description..."
                />
              </div>
            </div>

            {/* Images */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4 w-full min-w-0">
              <h2 className="text-base sm:text-lg font-bold">Product Images</h2>
              
              {/* Local File Upload Button */}
              <div className="border-2 border-dashed border-neutral-300 rounded-2xl p-4 text-center hover:bg-neutral-50 transition-colors w-full">
                <input
                  type="file"
                  id="file-upload"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                  <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-700 shrink-0">
                    <UploadCloud size={20} />
                  </div>
                  <div className="text-center px-2">
                    <span className="text-xs sm:text-sm font-bold text-neutral-900 underline decoration-2 block">Upload from Phone / PC Storage</span>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Supports JPG, PNG, WEBP files</p>
                  </div>
                </label>
              </div>

              {/* URL Option as alternative */}
              <div className="pt-2 w-full">
                <label className="block text-xs font-semibold text-neutral-500 mb-1">Or add image via web URL:</label>
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 border border-neutral-300 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:border-black min-w-0"
                  />
                  <button type="button" onClick={addImage} className="bg-neutral-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-black shrink-0">
                    Add URL
                  </button>
                </div>
              </div>

              {/* Image Previews */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4 w-full">
                {(formData.images || []).map((img, idx) => (
                  <div key={idx} className="relative aspect-[3/4] bg-neutral-100 rounded-xl overflow-hidden group border border-neutral-200">
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
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4 w-full min-w-0">
              <h2 className="text-base sm:text-lg font-bold">Variants & Attributes</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
                <div className="w-full min-w-0">
                  <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1">Sizes</label>
                  <div className="flex items-center space-x-2 mb-2 w-full">
                    <input
                      type="text"
                      placeholder="e.g. S, M, L, XL"
                      value={sizeInput}
                      onChange={(e) => setSizeInput(e.target.value)}
                      className="flex-1 min-w-0 border border-neutral-300 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:border-black"
                    />
                    <button type="button" onClick={() => addArrayItem('sizeOptions', sizeInput, setSizeInput)} className="bg-neutral-900 text-white px-3 sm:px-4 py-2 rounded-xl text-xs font-bold shrink-0 hover:bg-black">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(formData.sizeOptions || []).map((size, idx) => (
                      <span key={idx} className="inline-flex items-center bg-neutral-100 px-2.5 py-1 rounded-lg text-xs font-semibold border border-neutral-200">
                        {size}
                        <button type="button" onClick={() => removeArrayItem('sizeOptions', idx)} className="ml-1.5 text-neutral-400 hover:text-red-500"><X size={12} /></button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="w-full min-w-0">
                  <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1">Colors</label>
                  <div className="flex items-center space-x-2 mb-2 w-full">
                    <input
                      type="text"
                      placeholder="e.g. Black, White, Red"
                      value={colorInput}
                      onChange={(e) => setColorInput(e.target.value)}
                      className="flex-1 min-w-0 border border-neutral-300 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:border-black"
                    />
                    <button type="button" onClick={() => addArrayItem('colorOptions', colorInput, setColorInput)} className="bg-neutral-900 text-white px-3 sm:px-4 py-2 rounded-xl text-xs font-bold shrink-0 hover:bg-black">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(formData.colorOptions || []).map((color, idx) => (
                      <span key={idx} className="inline-flex items-center bg-neutral-100 px-2.5 py-1 rounded-lg text-xs font-semibold border border-neutral-200">
                        {color}
                        <button type="button" onClick={() => removeArrayItem('colorOptions', idx)} className="ml-1.5 text-neutral-400 hover:text-red-500"><X size={12} /></button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 w-full min-w-0">
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4 w-full min-w-0">
              <h2 className="text-base sm:text-lg font-bold">Organization & Pricing</h2>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-black outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-black outline-none font-medium"
                >
                  <option value="Boys Item">Boys Item</option>
                  <option value="Girls Item">Girls Item</option>
                  <option value="Baby Item">Baby Item</option>
                  <option value="Footwear Item">Footwear Item</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1">Selling Price (৳)</label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1">Original / Compare Price (৳)</label>
                <input
                  type="number"
                  name="comparePrice"
                  min="0"
                  step="0.01"
                  value={formData.comparePrice}
                  onChange={handleChange}
                  className="w-full border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm outline-none"
                  placeholder="Regular price before discount"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1">
                  Discount / Offer Badge (%)
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    name="discount"
                    min="0"
                    max="100"
                    value={formData.discount || ''}
                    onChange={handleChange}
                    placeholder="e.g. 20 for 20% OFF"
                    className="w-full border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm outline-none font-bold text-red-600 focus:border-red-500"
                  />
                  
                  {/* Preset Offer Percentage Buttons */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[10, 15, 20, 25, 30, 50].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => {
                          const basePrice = formData.comparePrice || formData.price || 0;
                          const discountedPrice = basePrice > 0 ? Math.round(basePrice * (1 - pct / 100)) : formData.price;
                          setFormData(prev => ({
                            ...prev,
                            discount: pct,
                            comparePrice: basePrice > 0 ? basePrice : (prev.price ? Math.round(prev.price / (1 - pct / 100)) : 0),
                            price: basePrice > 0 ? discountedPrice : prev.price
                          }));
                        }}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                          formData.discount === pct
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        {pct}% OFF
                      </button>
                    ))}
                    {formData.discount ? (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, discount: undefined }))}
                        className="px-2 py-1 text-xs font-medium text-neutral-500 hover:text-red-600 underline"
                      >
                        Clear Offer
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Flash Sale Toggle */}
              <div>
                <label className="flex items-center space-x-3 cursor-pointer p-3 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="isFlashSale"
                      checked={formData.isFlashSale || false}
                      onChange={(e) => setFormData(prev => ({ ...prev, isFlashSale: e.target.checked }))}
                      className="sr-only"
                    />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${formData.isFlashSale ? 'bg-red-600' : 'bg-neutral-300'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.isFlashSale ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-neutral-900 flex items-center gap-1">
                      <span>⚡ Flash Sale Badge</span>
                    </span>
                    <span className="text-[10px] text-neutral-500">Enable this to show a prominent flash sale tag on this product</span>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  name="stockQuantity"
                  min="0"
                  required
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  className="w-full border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm outline-none"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white px-6 py-4 rounded-2xl text-base font-bold hover:bg-neutral-800 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 shadow-md"
            >
              <Save size={18} />
              <span>{loading ? 'Saving...' : 'Save Product'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
