import fs from 'fs';
let code = fs.readFileSync('src/pages/Checkout.tsx', 'utf-8');

code = code.replace(
  "import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';",
  "import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';\nimport { bdDistricts } from '../lib/bdData';"
);

code = code.replace(
  "    address: '',\n    city: '',",
  "    address: '',\n    district: 'Dhaka',\n    upazila: '',\n    city: '',"
);

code = code.replace(
  "  const shipping = subtotal > 2000 ? 0 : 60;",
  "  const shipping = formData.district === 'Dhaka' ? 60 : 120;"
);

code = code.replace(
  "        address: formData.address,\n        city: formData.city,",
  "        address: formData.address,\n        district: formData.district,\n        upazila: formData.upazila,\n        city: formData.city,"
);

code = code.replace(
  "                <div>\n                  <label className=\"block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5\">Full Address</label>\n                  <input \n                    type=\"text\" \n                    name=\"address\" \n                    placeholder=\"House/Road No., Area, Thana\" \n                    required \n                    value={formData.address} \n                    onChange={handleChange} \n                    className=\"w-full bg-neutral-50 border border-neutral-200 px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-black rounded-2xl text-sm transition-all\"\n                  />\n                </div>\n                <div className=\"grid grid-cols-2 gap-4\">\n                  <div>\n                    <label className=\"block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5\">City / District</label>\n                    <input \n                      type=\"text\" \n                      name=\"city\" \n                      placeholder=\"e.g. Dhaka\" \n                      required \n                      value={formData.city} \n                      onChange={handleChange} \n                      className=\"w-full bg-neutral-50 border border-neutral-200 px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-black rounded-2xl text-sm transition-all\"\n                    />\n                  </div>",
  `                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">Full Address (House, Road, Area)</label>
                  <input 
                    type="text" 
                    name="address" 
                    placeholder="House/Road No., Area, Thana" 
                    required 
                    value={formData.address} 
                    onChange={handleChange} 
                    className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-black rounded-2xl text-sm transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">District</label>
                    <select
                      name="district"
                      required
                      value={formData.district}
                      onChange={handleChange}
                      className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-black rounded-2xl text-sm transition-all appearance-none"
                    >
                      {bdDistricts.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">Upazila / Area</label>
                    <input 
                      type="text" 
                      name="upazila" 
                      placeholder="e.g. Mirpur, Gulshan" 
                      required 
                      value={formData.upazila} 
                      onChange={handleChange} 
                      className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-black rounded-2xl text-sm transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">City (Optional)</label>
                    <input 
                      type="text" 
                      name="city" 
                      placeholder="e.g. Dhaka" 
                      value={formData.city} 
                      onChange={handleChange} 
                      className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-black rounded-2xl text-sm transition-all"
                    />
                  </div>`
);

code = code.replace(
  "{shipping === 0 ? <span className=\"text-emerald-600 font-bold uppercase text-xs\">FREE</span> : `৳ ${shipping.toFixed(0)}`}",
  "`৳ ${shipping.toFixed(0)}`"
);

fs.writeFileSync('src/pages/Checkout.tsx', code);
