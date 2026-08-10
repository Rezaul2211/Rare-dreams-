import fs from 'fs';
let code = fs.readFileSync('src/pages/admin/AdminLayout.tsx', 'utf-8');

const quickNavBlock = `          <div className="pt-6">
            <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">Quick Navigation</p>
            <Link
              to="/"
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-neutral-800 hover:bg-neutral-100 text-xs font-bold transition-colors border border-neutral-200/80"
            >
              <Store size={18} className="text-amber-500" />
              <span>Back to Main Store</span>
            </Link>
          </div>`;

const newQuickNavBlock = `          <div className="pt-6">
            <Link
              to="/"
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 rounded-2xl bg-amber-50 text-amber-900 hover:bg-amber-100 text-xs font-bold transition-colors border border-amber-200/80 mx-2"
            >
              <Store size={18} className="text-amber-600" />
              <span>Go to Main Store</span>
            </Link>
          </div>`;

code = code.replace(quickNavBlock, newQuickNavBlock);

fs.writeFileSync('src/pages/admin/AdminLayout.tsx', code);
console.log("Admin Sidebar Nav Patched");
