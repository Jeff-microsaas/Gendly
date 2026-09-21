
import React, { useState, useMemo } from 'react';
import { Package, Search, Plus, Minus, Edit, Trash2, Tag, Layers, CheckCircle2, X, Users, Box, Save, AlertTriangle, Zap } from 'lucide-react';
import { Product, Category } from '../types';

interface InventoryPageProps {
  products: Product[];
  categories: Category[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onNewProduct: () => void;
  onAddCategory: (name: string, unit: 'Litros' | 'ML' | 'Kg' | 'Unidade', quantity: number, peopleCount: number) => void;
  onSaveCategory: (cat: Category) => void;
  onDeleteCategory: (id: string) => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({ 
  products, 
  categories,
  onUpdateQuantity, 
  onEditProduct, 
  onDeleteProduct,
  onNewProduct,
  onAddCategory,
  onSaveCategory,
  onDeleteCategory
}) => {
  const [activeTab, setActiveTab] = useState<'ITEMS' | 'CATEGORIES'>('ITEMS');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [unit, setUnit] = useState<'Litros' | 'ML' | 'Kg' | 'Unidade'>('Unidade');
  const [quantity, setQuantity] = useState<string>('1');
  const [peopleCount, setPeopleCount] = useState<string>('1');

  const inventoryItems = useMemo(() => {
    return products.filter(p => 
      p.type === 'PRODUCT' && 
      (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [products, searchTerm]);

  const lowStockCount = useMemo(() => {
    return inventoryItems.filter(p => p.quantity < (p.minQuantity || 5)).length;
  }, [inventoryItems]);

  const filteredCategories = useMemo(() => {
      return categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [categories, searchTerm]);

  const handleOpenNewCategory = () => {
      setEditingCategory(null);
      setNewCategoryName('');
      setUnit('Unidade');
      setQuantity('1');
      setPeopleCount('1');
      setIsCategoryModalOpen(true);
  };

  const handleAddCategory = (e: React.FormEvent) => {
      e.preventDefault();
      const pCount = parseInt(peopleCount);
      if (!newCategoryName.trim() || !pCount || pCount < 1) {
          alert("O Rendimento (Pessoas) é obrigatório e deve ser maior que 0.");
          return;
      }

      if (editingCategory) {
          onSaveCategory({
              ...editingCategory,
              name: newCategoryName.trim(),
              unit,
              quantity: parseFloat(quantity) || 0,
              peopleCount: pCount
          });
          setEditingCategory(null);
      } else {
          onAddCategory(
              newCategoryName.trim(),
              unit,
              parseFloat(quantity) || 0,
              pCount
          );
      }
      
      setNewCategoryName('');
      setUnit('Unidade');
      setQuantity('1');
      setPeopleCount('1');
      setIsCategoryModalOpen(false);
  };

  const handleEditCategory = (cat: Category) => {
      setEditingCategory(cat);
      setNewCategoryName(cat.name);
      setUnit(cat.unit);
      setQuantity(cat.quantity.toString());
      setPeopleCount(cat.peopleCount.toString());
      setIsCategoryModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-2.5 rounded-2xl text-purple-600 shadow-sm">
            <Package size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 leading-tight tracking-tight">Estoque</h2>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Gestão de Materiais</p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            {activeTab === 'ITEMS' ? (
                <button 
                  onClick={onNewProduct}
                  className="w-full md:w-auto bg-purple-600 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-100 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Plus size={18} /> Novo Item
                </button>
            ) : (
                <button 
                  onClick={handleOpenNewCategory}
                  className="w-full md:w-auto bg-purple-600 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-100 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Plus size={18} /> Incluir Nova Categoria
                </button>
            )}
        </div>
      </div>

      <div className="flex justify-center md:justify-start">
        <div className="inline-flex p-1.5 bg-gray-200/50 backdrop-blur-sm rounded-[20px] border border-gray-100 shadow-inner">
            <button 
                onClick={() => { setActiveTab('ITEMS'); setSearchTerm(''); }}
                className={`flex items-center gap-3 px-8 py-3 rounded-[16px] text-sm font-black transition-all duration-300 ${
                    activeTab === 'ITEMS' 
                    ? 'bg-white text-purple-600 shadow-md ring-1 ring-black/5' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                }`}
            >
                <Package size={18} className={activeTab === 'ITEMS' ? 'text-purple-600' : 'text-gray-400'} />
                <span>ITENS</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                    activeTab === 'ITEMS' ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-500'
                }`}>
                    {inventoryItems.length}
                </span>
            </button>
            
            <button 
                onClick={() => { setActiveTab('CATEGORIES'); setSearchTerm(''); }}
                className={`flex items-center gap-3 px-8 py-3 rounded-[16px] text-sm font-black transition-all duration-300 ${
                    activeTab === 'CATEGORIES' 
                    ? 'bg-white text-purple-600 shadow-md ring-1 ring-black/5' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                }`}
            >
                <Tag size={18} className={activeTab === 'CATEGORIES' ? 'text-purple-600' : 'text-gray-400'} />
                <span>CATEGORIAS</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                    activeTab === 'CATEGORIES' ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-500'
                }`}>
                    {categories.length}
                </span>
            </button>
        </div>
      </div>

      {activeTab === 'ITEMS' && (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-300">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                  <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Total Geral</div>
                  <div className="text-xl font-black text-gray-800">{inventoryItems.length}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                  <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Valor em Estoque</div>
                  <div className="text-xl font-black text-emerald-600">
                      R$ {inventoryItems.reduce((acc, p) => acc + (p.price * p.quantity), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className={`p-4 rounded-2xl border shadow-sm flex items-center justify-between ${lowStockCount > 0 ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'}`}>
                  <div className={`${lowStockCount > 0 ? 'text-red-400' : 'text-gray-400'} text-[10px] font-black uppercase tracking-widest`}>Críticos</div>
                  <div className={`text-xl font-black ${lowStockCount > 0 ? 'text-red-600' : 'text-gray-800'}`}>{lowStockCount}</div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-3 border-b border-gray-100 bg-gray-50/30">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Buscar item pelo nome ou SKU..." 
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-xs shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="divide-y divide-gray-100">
                    {/* Compact Header */}
                    <div className="hidden lg:grid grid-cols-12 gap-2 px-6 py-2.5 bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                        <div className="col-span-4">Produto / Referência</div>
                        <div className="col-span-2 text-center">Capacidade</div>
                        <div className="col-span-2 text-center">Estoque</div>
                        <div className="col-span-2 text-center">Quantidade</div>
                        <div className="col-span-1 text-right">Preço</div>
                        <div className="col-span-1 text-right">Ações</div>
                    </div>

                    {inventoryItems.length > 0 ? inventoryItems.map(p => {
                        const cat = categories.find(c => c.id === p.categoryId);
                        const isLow = p.quantity < (p.minQuantity || 5);
                        const potentialServings = cat ? Math.floor(p.quantity * cat.peopleCount) : 0;

                        return (
                            <div key={p.id} className="grid grid-cols-1 lg:grid-cols-12 gap-2 px-4 lg:px-6 py-2 items-center hover:bg-gray-50/80 transition-colors">
                                
                                <div className="col-span-1 lg:col-span-4 flex items-center gap-3">
                                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200 shadow-sm">
                                        {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <Package className="text-gray-300" size={24}/>}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-bold text-gray-800 text-sm truncate">{p.name}</div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <div className="text-[9px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded inline-block">#{p.sku}</div>
                                            {isLow && (
                                                <span className="flex items-center gap-0.5 text-[8px] font-black text-red-500 uppercase animate-pulse">
                                                    <AlertTriangle size={8} /> Baixo
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* NOVO: CAPACIDADE TOTAL */}
                                <div className="col-span-1 lg:col-span-2 text-center">
                                    {cat ? (
                                        <div className="flex flex-col items-center">
                                            <span className="inline-flex px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase border border-emerald-100 gap-1.5 items-center">
                                                <Zap size={10} className="fill-emerald-400 text-emerald-400" />
                                                {potentialServings} Pessoas
                                            </span>
                                            <span className="text-[7px] text-gray-400 font-bold uppercase mt-1 tracking-tighter">Capacidade Real</span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-300 text-[9px] italic">Sem Categoria</span>
                                    )}
                                </div>

                                <div className="col-span-1 lg:col-span-2 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className={`text-[10px] font-black uppercase ${isLow ? 'text-red-500' : 'text-gray-600'}`}>
                                            {Math.floor(p.quantity)} un
                                        </span>
                                        <span className="text-[7px] text-gray-400 font-bold uppercase tracking-tighter">Físico Disponível</span>
                                    </div>
                                </div>

                                <div className="col-span-1 lg:col-span-2">
                                    <div className="flex items-center justify-center">
                                        <div className="flex items-center bg-gray-100 rounded-xl p-0.5 border border-gray-200 shadow-inner">
                                            <button 
                                                onClick={() => onUpdateQuantity(p.id, Math.max(0, p.quantity - 1))}
                                                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Minus size={12} strokeWidth={4} />
                                            </button>
                                            <div className={`px-3 font-black text-xs min-w-[32px] text-center ${isLow ? 'text-red-600' : 'text-gray-700'}`}>
                                                {Math.floor(p.quantity)}
                                            </div>
                                            <button 
                                                onClick={() => onUpdateQuantity(p.id, p.quantity + 1)}
                                                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-emerald-500 transition-colors"
                                            >
                                                <Plus size={12} strokeWidth={4} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-1 lg:col-span-1 text-right">
                                    <span className="text-xs font-black text-gray-700">R$ {p.price.toFixed(2).replace('.', ',')}</span>
                                </div>

                                <div className="col-span-1 lg:col-span-1 flex justify-end gap-1">
                                    <button onClick={() => onEditProduct(p)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Editar">
                                        <Edit size={16}/>
                                    </button>
                                    <button onClick={() => onDeleteProduct(p.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Excluir">
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="text-center py-16 text-gray-400">
                            <Box size={40} className="mx-auto mb-2 opacity-10" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Estoque vazio</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {activeTab === 'CATEGORIES' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div className="md:col-span-1">
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm sticky top-4">
                    <h3 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2 uppercase tracking-widest">
                        {editingCategory ? <Edit className="text-blue-500" size={16} /> : <Tag className="text-purple-500" size={16} />}
                        {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                    </h3>
                    <form onSubmit={handleAddCategory} className="space-y-3">
                        <div>
                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Nome</label>
                            <input 
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Ex: Shampoos"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-xs transition-all"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Unidade</label>
                                <select 
                                    value={unit} 
                                    onChange={(e) => setUnit(e.target.value as any)}
                                    className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-xs appearance-none"
                                >
                                    <option value="Litros">Litros</option>
                                    <option value="ML">ML</option>
                                    <option value="Kg">Kg</option>
                                    <option value="Unidade">Unidade</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Qtd Total</label>
                                <input 
                                    type="number"
                                    step="0.1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-xs transition-all"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-purple-600 uppercase tracking-widest mb-1 ml-1">Rendimento (Pessoas) *</label>
                            <input 
                                type="number"
                                min="1"
                                value={peopleCount}
                                onChange={(e) => setPeopleCount(e.target.value)}
                                className="w-full px-4 py-3 bg-purple-50 border border-purple-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-xs transition-all font-bold text-purple-800"
                                required
                            />
                            <p className="text-[8px] text-purple-400 mt-1 ml-1 font-bold uppercase">Campo Obrigatório para baixar estoque proporcional</p>
                        </div>
                        <div className="flex gap-2 pt-2">
                            {editingCategory && (
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setEditingCategory(null);
                                        setNewCategoryName('');
                                        setUnit('Unidade');
                                        setQuantity('1');
                                        setPeopleCount('1');
                                    }}
                                    className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all text-[10px] uppercase tracking-widest"
                                >
                                    Sair
                                </button>
                            )}
                            <button 
                                type="submit"
                                className="flex-[2] py-3 bg-purple-600 text-white font-black rounded-2xl hover:bg-purple-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-purple-100 text-[10px] uppercase tracking-widest"
                            >
                                {editingCategory ? 'Salvar' : 'Criar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="md:col-span-2 space-y-3">
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Buscar categoria..."
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-xs"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        {filteredCategories.length > 0 ? filteredCategories.map(cat => {
                            const itemCount = products.filter(p => p.categoryId === cat.id && p.type === 'PRODUCT').length;
                            return (
                                <div key={cat.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-2xl hover:border-purple-200 hover:bg-purple-50/10 transition-all group">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                                            <Tag size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-bold text-gray-800 text-sm truncate leading-tight">{cat.name}</div>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{cat.quantity} {cat.unit}</span>
                                                <span className="text-[10px] font-bold text-gray-300">•</span>
                                                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-tight">Rende {cat.peopleCount} p.</span>
                                                <span className="text-[10px] font-bold text-gray-300">•</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{itemCount} itens</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => handleEditCategory(cat)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => onDeleteCategory(cat.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            )
                        }) : (
                            <div className="text-center py-10 text-gray-400">
                                <p className="text-[10px] font-bold uppercase tracking-widest">Nenhuma categoria encontrada</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
