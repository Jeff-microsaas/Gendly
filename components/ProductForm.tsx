
import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Layers, Scissors, Check, CheckSquare, Save, Tag } from 'lucide-react';
import { Product, Category } from '../types';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'> | Product) => void;
  initialData?: Product | null;
  itemType: 'SERVICE' | 'PRODUCT';
  availableServices?: Product[]; // Pass existing services to be selected in packages
  defaultSubtype?: 'SINGLE' | 'PACKAGE'; // Force specific mode on open
  categories?: Category[];
  purpose?: 'SALE' | 'STOCK';
}

export const ProductForm: React.FC<ProductFormProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    initialData, 
    itemType, 
    availableServices = [], 
    defaultSubtype = 'SINGLE',
    categories = [],
    purpose
}) => {
  const [subtype, setSubtype] = useState<'SINGLE' | 'PACKAGE'>(defaultSubtype);
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>(''); // Acts as Stock or Limit
  const [minQuantity, setMinQuantity] = useState<string>('5');
  const [categoryId, setCategoryId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);

  // Package Specific
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [sessionCount, setSessionCount] = useState<string>('1');

  const isService = itemType === 'SERVICE';
  const typeLabel = isService ? (subtype === 'PACKAGE' ? 'Pacote' : 'Serviço') : 'Produto';

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setPrice(initialData.price.toString());
      setQuantity(initialData.quantity.toString());
      setMinQuantity(initialData.minQuantity?.toString() || '5');
      setCategoryId(initialData.categoryId || '');
      setDescription(initialData.description);
      setImage(initialData.image);
      
      if (isService) {
          setSubtype(initialData.subtype || 'SINGLE');
          setSelectedServiceIds(initialData.packageItems || []);
          setSessionCount(initialData.sessionCount?.toString() || '1');
      }
    } else {
      resetForm();
      if (isService) {
        setSubtype(defaultSubtype);
      }
    }
  }, [initialData, isOpen, isService, defaultSubtype]);

  const resetForm = () => {
    setName('');
    setPrice('');
    setQuantity('');
    setMinQuantity('5');
    setCategoryId('');
    setDescription('');
    setImage(null);
    setSubtype(defaultSubtype);
    setSelectedServiceIds([]);
    setSessionCount('1');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleServiceSelection = (id: string) => {
    setSelectedServiceIds(prev => 
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSku = initialData?.sku || `${isService ? (subtype === 'PACKAGE' ? 'PKG' : 'SRV') : 'PRD'}-${Math.floor(Math.random() * 10000)}`;

    const payload: any = {
      ...(initialData && { id: initialData.id }),
      name,
      price: parseFloat(price) || 0,
      quantity: parseFloat(quantity) || 0,
      minQuantity: parseFloat(minQuantity) || 5,
      categoryId: categoryId || undefined,
      sku: finalSku,
      description,
      image,
      type: itemType,
      purpose: initialData?.purpose || purpose, // Preserva original ou usa o passado pelo contexto
    };

    if (isService) {
        payload.subtype = subtype;
        if (subtype === 'PACKAGE') {
            payload.packageItems = selectedServiceIds;
            payload.sessionCount = parseInt(sessionCount);
        }
    }

    onSave(payload as Product);
    onClose();
  };

  const selectableServices = availableServices.filter(s => 
    s.subtype !== 'PACKAGE' && 
    s.id !== initialData?.id
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-lilac-900/20 backdrop-blur-sm p-4 transition-opacity">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/50">
        <div className="flex justify-between items-center p-8 border-b border-cream-200 sticky top-0 bg-white/95 backdrop-blur z-10">
          <div>
             <h2 className="text-2xl font-serif text-gray-800">
               {initialData ? `Editar ${typeLabel}` : `Novo ${typeLabel}`}
             </h2>
             <p className="text-xs text-purple-600 mt-1 font-bold uppercase tracking-wider">
               {isService ? 'Catálogo de Serviços' : (purpose === 'STOCK' ? 'Estoque de Materiais' : 'Produtos para Venda')}
             </p>
          </div>
          <button onClick={onClose} className="text-taupe-400 hover:text-rose-500 transition-colors p-2 hover:bg-rose-50 rounded-full">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {isService && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-500">
                {subtype === 'PACKAGE' ? <Layers size={20} className="text-purple-500"/> : <Scissors size={20} className="text-gray-400"/>}
                <span className="text-sm font-bold">
                    {initialData 
                      ? (subtype === 'PACKAGE' ? 'Editando Pacote' : 'Editando Serviço Avulso')
                      : (subtype === 'PACKAGE' ? 'Cadastro de Pacote Promocional' : 'Cadastro de Serviço Avulso')
                    }
                </span>
            </div>
          )}

          <div className="flex justify-center">
            <div className="relative w-40 h-40 rounded-2xl border-4 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 group hover:border-purple-300 transition-all cursor-pointer shadow-inner">
              {image ? (
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-taupe-400 group-hover:text-purple-500 transition-colors">
                  <ImageIcon className="mx-auto mb-2" size={24} strokeWidth={1.5} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Adicionar Foto</span>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-taupe-500 uppercase tracking-widest mb-2">Nome do {typeLabel}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-5 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-200 focus:border-purple-300 outline-none transition-all text-gray-800"
                placeholder={`Ex: ${subtype === 'PACKAGE' ? 'Pacote Noiva Completo' : 'Hidratação Profunda'}`}
              />
            </div>

            {!isService && (
                <div>
                    <label className="block text-xs font-bold text-taupe-500 uppercase tracking-widest mb-2">Categoria</label>
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full px-5 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all text-gray-800"
                    >
                        <option value="">Sem Categoria</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {isService && subtype === 'PACKAGE' && (
                <div className="bg-purple-50 p-5 rounded-2xl border border-purple-100">
                    <label className="block text-xs font-bold text-purple-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Scissors size={14} /> Selecione os Serviços Inclusos
                    </label>
                    {selectableServices.length > 0 ? (
                        <div className="max-h-48 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                            {selectableServices.map(srv => {
                                const isSelected = selectedServiceIds.includes(srv.id);
                                return (
                                    <div 
                                        key={srv.id} 
                                        onClick={() => toggleServiceSelection(srv.id)}
                                        className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-white border-purple-300 shadow-sm' : 'bg-white/50 border-transparent hover:bg-white'}`}
                                    >
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${isSelected ? 'bg-purple-500 border-purple-500 text-white' : 'border-gray-300 bg-white'}`}>
                                            {isSelected && <Check size={12} strokeWidth={4} />}
                                        </div>
                                        <div className="flex-1">
                                            <span className={`text-sm font-bold ${isSelected ? 'text-purple-900' : 'text-gray-600'}`}>{srv.name}</span>
                                            <span className="block text-[10px] text-gray-400">Ref: {srv.sku}</span>
                                        </div>
                                        <span className="text-xs font-bold text-gray-500">R$ {srv.price.toFixed(2)}</span>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-gray-400 text-sm italic">Nenhum serviço avulso cadastrado para compor o pacote.</div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-taupe-500 uppercase tracking-widest mb-2">Valor do {typeLabel} (R$)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-purple-400 font-serif italic font-bold">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="w-full pl-12 pr-5 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-200 focus:border-purple-300 outline-none transition-all font-bold text-gray-800"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              {isService && subtype === 'PACKAGE' ? (
                  <div>
                    <label className="block text-xs font-bold text-taupe-500 uppercase tracking-widest mb-2">Quantidade de Sessões</label>
                    <input
                        type="number"
                        value={sessionCount}
                        onChange={(e) => setSessionCount(e.target.value)}
                        required
                        min="1"
                        className="w-full px-5 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-200 focus:border-purple-300 outline-none transition-all text-gray-800 font-bold"
                        placeholder="Ex: 10"
                    />
                  </div>
              ) : (
                  !isService && (
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-taupe-500 uppercase tracking-widest mb-2">Estoque Atual</label>
                            <input
                                type="number"
                                step="0.01"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                required
                                className="w-full px-5 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-200 focus:border-purple-300 outline-none transition-all text-gray-800"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-taupe-500 uppercase tracking-widest mb-2">Quant. Mínima</label>
                            <input
                                type="number"
                                step="0.01"
                                value={minQuantity}
                                onChange={(e) => setMinQuantity(e.target.value)}
                                required
                                className="w-full px-5 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-200 focus:border-purple-300 outline-none transition-all text-gray-800 font-bold"
                                placeholder="5"
                            />
                        </div>
                    </div>
                  )
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-taupe-500 uppercase tracking-widest">Descrição</label>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-5 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-200 focus:border-purple-300 outline-none transition-all resize-none text-sm leading-relaxed text-taupe-600"
                placeholder={`Detalhes sobre ${isService ? 'o procedimento' : 'o produto'}...`}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-cream-100">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 text-xs font-bold uppercase tracking-widest text-taupe-500 bg-white border border-cream-200 rounded-xl hover:bg-cream-50 focus:outline-none transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-8 py-3 text-sm font-bold uppercase tracking-widest text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
