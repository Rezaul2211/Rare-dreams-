import fs from 'fs';
let code = fs.readFileSync('src/pages/Checkout.tsx', 'utf-8');

code = code.replace(
  "import { bdDistricts } from '../lib/bdData';\nimport { bdDistricts } from '../lib/bdData';",
  "import { bdDistricts } from '../lib/bdData';"
);

// Find the index of "Full Address" and the next closing div
const addrStart = code.indexOf("<label className=\"block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5\">Full Address</label>");

if (addrStart > -1) {
  const divStart = code.lastIndexOf("<div>", addrStart);
  
  // Find "Postal Code (Optional)"
  const postalCodeIndex = code.indexOf("Postal Code (Optional)");
  const postalDivEnd = code.indexOf("</div>", code.indexOf("</div>", postalCodeIndex) + 6) + 6;
  
  const originalBlock = code.substring(divStart, postalDivEnd);

  const newBlock = `<div>
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
                <div className="grid grid-cols-2 gap-4">
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
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">Postal Code (Optional)</label>
                    <input 
                      type="text" 
                      name="postalCode" 
                      placeholder="1212" 
                      value={formData.postalCode} 
                      onChange={handleChange} 
                      className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-black rounded-2xl text-sm transition-all"
                    />
                  </div>
                </div>`;
                
  code = code.replace(originalBlock, newBlock);
}

fs.writeFileSync('src/pages/Checkout.tsx', code);
console.log("Success");
