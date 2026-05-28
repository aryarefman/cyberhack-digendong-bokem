"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  X, 
  Check, 
  AlertTriangle,
  Info,
  MessageSquare,
  Edit3,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  lot: string;
  status: "Optimal" | "Low Stock Warning" | "Critical Expiry";
}

export default function InventoryMasterPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal / Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  
  // Form fields
  const [formData, setFormData] = useState({
    name: "",
    category: "Essential Oil",
    quantity: "",
    unit: "Liters",
    lot: "",
    status: "Optimal" as "Optimal" | "Low Stock Warning" | "Critical Expiry"
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Toast feedback state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Seed initial data matching mockup & extra entries
  const SEED_DATA: InventoryItem[] = [
    {
      id: "inv-1",
      name: "Lavender\nAngustifolia",
      category: "Essential Oil",
      quantity: 450.5,
      unit: "Liters",
      lot: "LOT-8821A",
      status: "Optimal"
    },
    {
      id: "inv-2",
      name: "Eucalyptus\nGlobulus",
      category: "Essential Oil",
      quantity: 12.0,
      unit: "Liters",
      lot: "LOT-9932B",
      status: "Low Stock Warning"
    },
    {
      id: "inv-3",
      name: "Vanilla Planifolia",
      category: "Natural Extract",
      quantity: 85.2,
      unit: "Kg",
      lot: "LOT-7719C",
      status: "Critical Expiry"
    },
    {
      id: "inv-4",
      name: "Pure Java Vetiver Oil",
      category: "Essential Oil",
      quantity: 350.0,
      unit: "Liters",
      lot: "LOT-8812D",
      status: "Optimal"
    },
    {
      id: "inv-5",
      name: "Premium Cinnamon Bark",
      category: "Spices & Herbs",
      quantity: 6.8,
      unit: "Kg",
      lot: "LOT-9922F",
      status: "Low Stock Warning"
    },
    {
      id: "inv-6",
      name: "Sumatran Patchouli Extract",
      category: "Natural Extract",
      quantity: 280.0,
      unit: "Kg",
      lot: "LOT-7712E",
      status: "Optimal"
    },
    {
      id: "inv-7",
      name: "Synthetic Ambergris Fixative",
      category: "Synthetic Extract",
      quantity: 15.0,
      unit: "Liters",
      lot: "LOT-1122G",
      status: "Critical Expiry"
    }
  ];

  // Initialize data from localStorage or seed
  useEffect(() => {
    const stored = localStorage.getItem("aromasys_inventory_master");
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        setItems(SEED_DATA);
        localStorage.setItem("aromasys_inventory_master", JSON.stringify(SEED_DATA));
      }
    } else {
      setItems(SEED_DATA);
      localStorage.setItem("aromasys_inventory_master", JSON.stringify(SEED_DATA));
    }
  }, []);

  // Save to localStorage
  const saveItems = (updated: InventoryItem[]) => {
    setItems(updated);
    localStorage.setItem("aromasys_inventory_master", JSON.stringify(updated));
  };

  const triggerToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.lot.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All Categories" || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Unique categories list
  const categoriesList = ["All Categories", "Essential Oil", "Natural Extract", "Spices & Herbs", "Synthetic Extract"];

  // Paginated items
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [filteredItems.length, totalPages, currentPage]);

  // Open modal for Create
  const handleCreateOpen = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      category: "Essential Oil",
      quantity: "",
      unit: "Liters",
      lot: `LOT-${Math.floor(1000 + Math.random() * 9000)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
      status: "Optimal"
    });
    setFormErrors({});
    setModalOpen(true);
  };

  // Open modal for Edit
  const handleEditOpen = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name.replace("\n", " "),
      category: item.category,
      quantity: item.quantity.toString(),
      unit: item.unit,
      lot: item.lot,
      status: item.status
    });
    setFormErrors({});
    setModalOpen(true);
  };

  // Delete Handler
  const handleDeleteItem = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name.replace("\n", " ")}?`)) {
      const updated = items.filter(i => i.id !== id);
      saveItems(updated);
      triggerToast(`Removed "${name.replace("\n", " ")}" from inventory`, "info");
    }
  };

  // Submit Handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Material name is required";
    if (!formData.quantity || isNaN(Number(formData.quantity)) || Number(formData.quantity) <= 0) {
      errors.quantity = "Enter a valid positive number";
    }
    if (!formData.lot.trim()) errors.lot = "Active tracking lot is required";
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      triggerToast("Please fix the validation errors", "error");
      return;
    }

    // Format name to add a newline for Lavender or Eucalyptus to match mockup
    let formattedName = formData.name.trim();
    if (formattedName.toLowerCase().startsWith("lavender") && !formattedName.includes("\n")) {
      formattedName = formattedName.replace(/lavender\s+/i, "Lavender\n");
    } else if (formattedName.toLowerCase().startsWith("eucalyptus") && !formattedName.includes("\n")) {
      formattedName = formattedName.replace(/eucalyptus\s+/i, "Eucalyptus\n");
    }

    if (editingItem) {
      // Edit
      const updated = items.map(i => {
        if (i.id === editingItem.id) {
          return {
            ...i,
            name: formattedName,
            category: formData.category,
            quantity: parseFloat(formData.quantity),
            unit: formData.unit,
            lot: formData.lot.trim(),
            status: formData.status
          };
        }
        return i;
      });
      saveItems(updated);
      triggerToast(`Updated inventory for "${formData.name}"`);
    } else {
      // Add
      const newItem: InventoryItem = {
        id: `inv-${Date.now()}`,
        name: formattedName,
        category: formData.category,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        lot: formData.lot.trim(),
        status: formData.status
      };
      saveItems([newItem, ...items]);
      triggerToast(`Successfully registered "${formData.name}"`);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-16 text-left relative font-sans">
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(44, 116, 47, 0.12);
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(44, 116, 47, 0.25);
        }
      `}} />
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 border ${
              toast.type === "success" 
                ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                : toast.type === "error"
                ? "bg-rose-50 border-rose-200 text-red-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
          >
            {toast.type === "success" && <Check className="w-5 h-5 text-emerald-600 shrink-0" />}
            {toast.type === "error" && <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />}
            {toast.type === "info" && <Info className="w-5 h-5 text-blue-600 shrink-0" />}
            <span className="text-sm font-semibold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-neutral-800 text-3xl font-bold font-sans"
      >
        Inventory Master
      </motion.div>

      {/* Controls Row with entrance animation */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
        className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        
        {/* Left Search & Category Dropdown */}
        <div className="flex-1 max-w-[576px] flex justify-start items-start gap-3 w-full">
          
          {/* Search Pill */}
          <div className="flex-1 relative inline-flex flex-col justify-start items-start">
            <input
              type="text"
              placeholder="Search Master Data..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-lime-400/20 text-[#1C1B1F] text-sm font-normal font-sans placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-lime-400"
            />
            <div className="h-5 left-[12px] top-[11px] absolute flex flex-col justify-start items-start opacity-50">
              <Search className="w-3.5 h-3.5 text-stone-700" />
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="w-48 relative inline-flex flex-col justify-start items-start">
            <button
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              className="w-full pl-3 pr-8 py-2 relative bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-lime-400/20 inline-flex justify-between items-center text-green-950 text-sm font-normal font-sans leading-5 focus:outline-none"
            >
              <span className="truncate">{selectedCategory}</span>
              <ChevronDown className="w-4 h-4 text-stone-700 shrink-0 absolute right-3" />
            </button>

            <AnimatePresence>
              {categoryDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setCategoryDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute left-0 mt-10 w-full bg-white border border-stone-200 rounded-lg shadow-lg z-20 p-2 space-y-1 max-h-48 overflow-y-auto"
                  >
                    {categoriesList.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setCategoryDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
                          selectedCategory === cat 
                            ? "bg-[#2C742F]/10 text-[#2C742F]" 
                            : "text-[#1C1B1F] hover:bg-stone-50"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Add New Record Button */}
        <button
          onClick={handleCreateOpen}
          className="px-6 py-2.5 bg-green-800 hover:bg-green-900 rounded-[43px] flex justify-center items-center gap-2 text-white text-xs font-semibold font-sans leading-4 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] active:scale-[0.98] transition-transform duration-100 shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-white" />
          <span>Add New Record</span>
        </button>

      </motion.div>

      {/* Table Container Card - styled with #F5FBF3, entrance animation, and border shadow */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        className="w-full bg-[#F5FBF3] rounded-xl shadow-[0px_4px_12px_rgba(143,177,87,0.05)] border border-lime-400/20 overflow-hidden flex flex-col justify-start items-start"
      >
        
        {/* Table wrapper with scroll - max height set to 500px to accommodate 10 items beautifully */}
        <div className="w-full overflow-y-auto max-h-[500px] custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-[#2C742F]/5 border-b border-lime-400/20 text-stone-700 text-sm font-bold tracking-wide">
                <th className="px-6 py-4 w-48 sticky top-0 bg-[#F5FBF3] z-10 font-sans border-b border-lime-400/10">Material Name</th>
                <th className="px-6 py-4 w-36 sticky top-0 bg-[#F5FBF3] z-10 font-sans border-b border-lime-400/10">Category</th>
                <th className="px-6 py-4 w-28 sticky top-0 bg-[#F5FBF3] z-10 font-sans border-b border-lime-400/10">Quantity</th>
                <th className="px-6 py-4 w-24 sticky top-0 bg-[#F5FBF3] z-10 font-sans border-b border-lime-400/10">Unit</th>
                <th className="px-6 py-4 w-44 sticky top-0 bg-[#F5FBF3] z-10 font-sans border-b border-lime-400/10">Active Tracking Lot</th>
                <th className="px-6 py-4 w-44 sticky top-0 bg-[#F5FBF3] z-10 font-sans border-b border-lime-400/10">Status</th>
                <th className="px-6 py-4 w-28 text-center sticky top-0 bg-[#F5FBF3] z-10 font-sans border-b border-lime-400/10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lime-400/10">
              {paginatedItems.map((item, idx) => {
                
                // Badge styles
                let categoryBadge = "bg-lime-300/30 text-lime-800";
                
                let statusBadge = "";
                let statusDot = "";
                if (item.status === "Optimal") {
                  statusBadge = "bg-emerald-100 text-lime-800 outline-lime-800/10";
                  statusDot = "bg-lime-800";
                } else if (item.status === "Low Stock Warning") {
                  statusBadge = "bg-[#FF8900]/10 text-amber-500 outline-[#FF8900]/20";
                  statusDot = "bg-[#FF8900]";
                } else if (item.status === "Critical Expiry") {
                  statusBadge = "bg-red-700/10 text-red-700 outline-red-700/20";
                  statusDot = "bg-red-700";
                }

                return (
                  <motion.tr 
                    key={item.id} 
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut", delay: idx * 0.04 }}
                    className="hover:bg-white/40 transition-colors"
                  >
                    {/* Material Name */}
                    <td className="px-6 py-5 text-green-950 text-sm font-semibold font-sans leading-5 whitespace-pre-line">
                      {item.name}
                    </td>

                    {/* Category */}
                    <td className="px-6 py-5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-normal font-sans inline-flex justify-start items-center ${categoryBadge}`}>
                        {item.category}
                      </span>
                    </td>

                    {/* Quantity */}
                    <td className="px-6 py-5 text-stone-700 text-sm font-normal font-sans leading-5">
                      {item.quantity.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                    </td>

                    {/* Unit */}
                    <td className="px-6 py-5 text-stone-700 text-sm font-normal font-sans leading-5">
                      {item.unit}
                    </td>

                    {/* Lot */}
                    <td className="px-6 py-5 text-lime-800 text-sm font-normal font-sans leading-5">
                      {item.lot}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full outline outline-1 outline-offset-[-1px] text-xs font-normal font-sans ${statusBadge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                        <span className={item.status === "Low Stock Warning" ? "font-sans text-amber-500" : ""}>
                          {item.status}
                        </span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditOpen(item)}
                          className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 transition-colors shadow-sm"
                          title="Edit Record"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-stone-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id, item.name)}
                          className="p-1.5 rounded-lg border border-rose-100 bg-white hover:bg-rose-50/50 text-red-600 hover:text-red-700 transition-colors shadow-sm"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-stone-500 font-semibold text-sm">
                    No matching inventory items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination Row */}
        <div className="self-stretch px-5 py-3.5 border-t border-[#2C742F]/10 flex items-center justify-between">
          <p className="text-xs text-stone-500">
            Showing{" "}
            <span className="font-semibold text-[#1C1B1F]">
              {filteredItems.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredItems.length)}
            </span>{" "}
            of <span className="font-semibold text-[#1C1B1F]">{filteredItems.length}</span> entries
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-stone-300/60 bg-white text-stone-500 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg border text-xs font-bold transition-colors ${
                  currentPage === page
                    ? "bg-[#2C742F] border-[#2C742F] text-white"
                    : "border-stone-300/60 bg-white text-stone-600 hover:bg-stone-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-stone-300/60 bg-white text-stone-500 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </motion.div>

      {/* Dynamic Slide-Over / Modal CRUD Dialog */}
      <AnimatePresence>
        {modalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 m-auto max-w-lg h-fit bg-white rounded-3xl p-6 shadow-2xl z-50 overflow-hidden border border-stone-200/40 text-left flex flex-col justify-start"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-stone-100 pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-lg font-bold text-neutral-800">
                    {editingItem ? "Edit Inventory Record" : "Add New Record"}
                  </h3>
                </div>
                <button 
                  onClick={() => setModalOpen(false)} 
                  className="p-1 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form content */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                
                {/* Material Name */}
                <div className="space-y-1.5">
                  <label className="text-stone-700 text-xs font-bold uppercase tracking-wider block">Material Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3.5 py-2 bg-white rounded-xl border ${
                      formErrors.name ? "border-red-500 focus:ring-red-500" : "border-stone-300 focus:border-[#2C742F]"
                    } focus:outline-none text-sm text-[#1C1B1F] font-medium transition-colors`}
                    placeholder="e.g. Lavender Angustifolia"
                  />
                  {formErrors.name && (
                    <span className="text-red-600 text-xs font-semibold">{formErrors.name}</span>
                  )}
                </div>

                {/* Category Dropdown select */}
                <div className="space-y-1.5">
                  <label className="text-stone-700 text-xs font-bold uppercase tracking-wider block">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-stone-300 focus:border-[#2C742F] focus:outline-none text-sm text-[#1C1B1F] font-semibold transition-colors"
                  >
                    <option value="Essential Oil">Essential Oil</option>
                    <option value="Natural Extract">Natural Extract</option>
                    <option value="Spices & Herbs">Spices & Herbs</option>
                    <option value="Synthetic Extract">Synthetic Extract</option>
                  </select>
                </div>

                {/* Quantity & Unit */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-stone-700 text-xs font-bold uppercase tracking-wider block">Quantity</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className={`w-full px-3.5 py-2 bg-white rounded-xl border ${
                        formErrors.quantity ? "border-red-500" : "border-stone-300 focus:border-[#2C742F]"
                      } focus:outline-none text-sm text-[#1C1B1F] font-medium transition-colors`}
                      placeholder="e.g. 450.5"
                    />
                    {formErrors.quantity && (
                      <span className="text-red-600 text-xs font-semibold">{formErrors.quantity}</span>
                    )}
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-stone-700 text-xs font-bold uppercase tracking-wider block">Unit</label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-stone-300 focus:border-[#2C742F] focus:outline-none text-sm text-[#1C1B1F] font-semibold transition-colors"
                    >
                      <option value="Liters">Liters</option>
                      <option value="Kg">Kg</option>
                      <option value="ml">ml</option>
                      <option value="g">g</option>
                    </select>
                  </div>
                </div>

                {/* Active Tracking Lot */}
                <div className="space-y-1.5">
                  <label className="text-stone-700 text-xs font-bold uppercase tracking-wider block">Active Tracking Lot</label>
                  <input
                    type="text"
                    value={formData.lot}
                    onChange={(e) => setFormData({ ...formData, lot: e.target.value })}
                    className={`w-full px-3.5 py-2 bg-white rounded-xl border ${
                      formErrors.lot ? "border-red-500" : "border-stone-300 focus:border-[#2C742F]"
                    } focus:outline-none text-sm text-[#1C1B1F] font-medium transition-colors`}
                    placeholder="e.g. LOT-8821A"
                  />
                  {formErrors.lot && (
                    <span className="text-red-600 text-xs font-semibold">{formErrors.lot}</span>
                  )}
                </div>

                {/* Status Selection */}
                <div className="space-y-1.5">
                  <label className="text-stone-700 text-xs font-bold uppercase tracking-wider block">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-stone-300 focus:border-[#2C742F] focus:outline-none text-sm text-[#1C1B1F] font-semibold transition-colors"
                  >
                    <option value="Optimal">Optimal</option>
                    <option value="Low Stock Warning">Low Stock Warning</option>
                    <option value="Critical Expiry">Critical Expiry</option>
                  </select>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-sm font-semibold hover:bg-stone-50 active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-green-800 hover:bg-green-900 text-white text-sm font-semibold shadow-md active:scale-95 transition-all"
                  >
                    {editingItem ? "Save Changes" : "Register Batch"}
                  </button>
                </div>

              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Assistant FAB */}
      <motion.button 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.4 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#FF8900] hover:bg-[#ff9c20] text-white rounded-full flex items-center justify-center shadow-lg z-40 focus:outline-none cursor-pointer"
        title="Need Help?"
      >
        <img src="/chatbot.png" alt="Chatbot" className="w-8 h-8 object-contain" />
      </motion.button>

    </div>
  );
}
