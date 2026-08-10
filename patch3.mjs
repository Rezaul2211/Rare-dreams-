import fs from 'fs';
let code = fs.readFileSync('src/pages/Account.tsx', 'utf-8');

// Add import
code = code.replace(
  "import { useAuthStore } from '../store/useAuthStore';",
  "import { useAuthStore } from '../store/useAuthStore';\nimport { bdDistricts } from '../lib/bdData';"
);

// Add states
code = code.replace(
  "  const [addrCity, setAddrCity] = useState('');",
  "  const [addrCity, setAddrCity] = useState('');\n  const [addrDistrict, setAddrDistrict] = useState('Dhaka');\n  const [addrUpazila, setAddrUpazila] = useState('');"
);

// Update handleAddAddress
code = code.replace(
  "const newAddr: AddressItem = { id: Date.now().toString(), name: addrName, phone: addrPhone, address: addrStreet, city: addrCity, postalCode: addrPostal, isDefault: addrDefault };",
  "const newAddr = { id: Date.now().toString(), name: addrName, phone: addrPhone, address: addrStreet, city: addrCity, district: addrDistrict, upazila: addrUpazila, postalCode: addrPostal, isDefault: addrDefault };"
);

// Update reset form
code = code.replace(
  "setAddrStreet(''); setAddrCity(''); setAddrPostal(''); setAddrDefault(false); setShowAddressForm(false);",
  "setAddrStreet(''); setAddrCity(''); setAddrDistrict('Dhaka'); setAddrUpazila(''); setAddrPostal(''); setAddrDefault(false); setShowAddressForm(false);"
);

// Update form HTML
const oldForm = `                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 mb-1">City / District</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Dhaka, Chittagong, etc."
                      value={addrCity} 
                      onChange={(e) => setAddrCity(e.target.value)}
                      className="w-full text-xs bg-white border border-neutral-200 rounded-xl px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 mb-1">Postal Code</label>
                    <input 
                      type="text" 
                      placeholder="1212"
                      value={addrPostal} 
                      onChange={(e) => setAddrPostal(e.target.value)}
                      className="w-full text-xs bg-white border border-neutral-200 rounded-xl px-3 py-2"
                    />
                  </div>
                </div>`;

const newForm = `                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 mb-1">District</label>
                    <select
                      required
                      value={addrDistrict}
                      onChange={(e) => setAddrDistrict(e.target.value)}
                      className="w-full text-xs bg-white border border-neutral-200 rounded-xl px-3 py-2 appearance-none"
                    >
                      {bdDistricts.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 mb-1">Upazila / Area</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Mirpur"
                      value={addrUpazila} 
                      onChange={(e) => setAddrUpazila(e.target.value)}
                      className="w-full text-xs bg-white border border-neutral-200 rounded-xl px-3 py-2"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 mb-1">City (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="Dhaka"
                      value={addrCity} 
                      onChange={(e) => setAddrCity(e.target.value)}
                      className="w-full text-xs bg-white border border-neutral-200 rounded-xl px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 mb-1">Postal Code (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="1212"
                      value={addrPostal} 
                      onChange={(e) => setAddrPostal(e.target.value)}
                      className="w-full text-xs bg-white border border-neutral-200 rounded-xl px-3 py-2"
                    />
                  </div>
                </div>`;
                
code = code.replace(oldForm, newForm);

fs.writeFileSync('src/pages/Account.tsx', code);
console.log("Account Patch Success");
