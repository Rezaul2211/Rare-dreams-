import fs from 'fs';
let code = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf-8');

code = code.replace(
  "    totalProducts: 0,\n  });",
  "    totalProducts: 0,\n  });\n\n  const [statusCounts, setStatusCounts] = useState({ pending: 0, processing: 0, shipped: 0, delivered: 0, total: 0 });"
);

const orderCountBlock = `        try {
          const ordersSnap = await getDocs(collection(db, 'orders'));
          orderCount = ordersSnap.size;
          ordersSnap.forEach((doc) => {
            const data = doc.data();
            totalSalesVal += (data.totalAmount || data.total || 0);
          });
        } catch {
          orderCount = 0;
        }`;

const newOrderCountBlock = `        let pCount = 0, prCount = 0, sCount = 0, dCount = 0;
        try {
          const ordersSnap = await getDocs(collection(db, 'orders'));
          orderCount = ordersSnap.size;
          ordersSnap.forEach((doc) => {
            const data = doc.data();
            totalSalesVal += (data.totalAmount || data.total || 0);
            const status = (data.status || 'pending').toLowerCase();
            if (status === 'pending') pCount++;
            else if (status === 'processing') prCount++;
            else if (status === 'shipped') sCount++;
            else if (status === 'delivered') dCount++;
          });
          setStatusCounts({ pending: pCount, processing: prCount, shipped: sCount, delivered: dCount, total: orderCount });
        } catch {
          orderCount = 0;
        }`;

code = code.replace(orderCountBlock, newOrderCountBlock);

const getStatusUI = `            {/* SVG Donut Chart */}
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Pending arc (Amber) 25.6% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#F59E0B" strokeWidth="15" strokeDasharray="61 178" strokeDashoffset="0" />
                {/* Processing arc (Blue) 32.9% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#3B82F6" strokeWidth="15" strokeDasharray="78 161" strokeDashoffset="-61" />
                {/* Shipped arc (Green) 26.4% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#10B981" strokeWidth="15" strokeDasharray="63 176" strokeDashoffset="-139" />
                {/* Delivered arc (Purple) 15.1% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#8B5CF6" strokeWidth="15" strokeDasharray="36 203" strokeDashoffset="-202" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-sm sm:text-base font-bold text-neutral-900 leading-none">1,248</span>
                <span className="text-[9px] sm:text-[10px] text-neutral-400 uppercase font-semibold mt-0.5">Total</span>
              </div>
            </div>
            {/* Donut Legend Items */}
            <div className="flex-1 space-y-2 text-[11px] sm:text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="font-medium text-neutral-600">Pending</span>
                </div>
                <span className="font-semibold text-neutral-800">320 (25.6%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span className="font-medium text-neutral-600">Processing</span>
                </div>
                <span className="font-semibold text-neutral-800">410 (32.9%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-medium text-neutral-600">Shipped</span>
                </div>
                <span className="font-semibold text-neutral-800">330 (26.4%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  <span className="font-medium text-neutral-600">Delivered</span>
                </div>
                <span className="font-semibold text-neutral-800">188 (15.1%)</span>
              </div>
            </div>`;

const newStatusUI = `            {/* SVG Donut Chart */}
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#F59E0B" strokeWidth="15" strokeDasharray={\`\${(statusCounts.pending/Math.max(statusCounts.total, 1))*239} 239\`} strokeDashoffset="0" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#3B82F6" strokeWidth="15" strokeDasharray={\`\${(statusCounts.processing/Math.max(statusCounts.total, 1))*239} 239\`} strokeDashoffset={\`-\${(statusCounts.pending/Math.max(statusCounts.total, 1))*239}\`} />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#10B981" strokeWidth="15" strokeDasharray={\`\${(statusCounts.shipped/Math.max(statusCounts.total, 1))*239} 239\`} strokeDashoffset={\`-\${((statusCounts.pending + statusCounts.processing)/Math.max(statusCounts.total, 1))*239}\`} />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#8B5CF6" strokeWidth="15" strokeDasharray={\`\${(statusCounts.delivered/Math.max(statusCounts.total, 1))*239} 239\`} strokeDashoffset={\`-\${((statusCounts.pending + statusCounts.processing + statusCounts.shipped)/Math.max(statusCounts.total, 1))*239}\`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-sm sm:text-base font-bold text-neutral-900 leading-none">{statusCounts.total}</span>
                <span className="text-[9px] sm:text-[10px] text-neutral-400 uppercase font-semibold mt-0.5">Total</span>
              </div>
            </div>
            {/* Donut Legend Items */}
            <div className="flex-1 space-y-2 text-[11px] sm:text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="font-medium text-neutral-600">Pending</span>
                </div>
                <span className="font-semibold text-neutral-800">{statusCounts.pending} ({statusCounts.total > 0 ? Math.round((statusCounts.pending/statusCounts.total)*100) : 0}%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span className="font-medium text-neutral-600">Processing</span>
                </div>
                <span className="font-semibold text-neutral-800">{statusCounts.processing} ({statusCounts.total > 0 ? Math.round((statusCounts.processing/statusCounts.total)*100) : 0}%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-medium text-neutral-600">Shipped</span>
                </div>
                <span className="font-semibold text-neutral-800">{statusCounts.shipped} ({statusCounts.total > 0 ? Math.round((statusCounts.shipped/statusCounts.total)*100) : 0}%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  <span className="font-medium text-neutral-600">Delivered</span>
                </div>
                <span className="font-semibold text-neutral-800">{statusCounts.delivered} ({statusCounts.total > 0 ? Math.round((statusCounts.delivered/statusCounts.total)*100) : 0}%)</span>
              </div>
            </div>`;

code = code.replace(getStatusUI, newStatusUI);
fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', code);
console.log("Admin Dashboard Patched");
