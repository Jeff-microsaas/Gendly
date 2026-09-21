
import React, { useState, useEffect } from 'react';
import { X, Camera, User, CheckCircle2, ChevronDown } from 'lucide-react';
import { Professional, Specialty } from '../types';

interface ProfessionalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (professional: Omit<Professional, 'id'> | Professional) => void;
  initialData?: Professional | null;
  specialties: Specialty[];
}

export const ProfessionalForm: React.FC<ProfessionalFormProps> = ({ isOpen, onClose, onSave, initialData, specialties }) => {
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [specialtyId, setSpecialtyId] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setNickname(initialData.nickname);
      setWhatsapp(initialData.whatsapp);
      setSpecialtyId(initialData.specialtyId);
      setAvatar(initialData.avatar);
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setName('');
    setNickname('');
    setWhatsapp('');
    setSpecialtyId('');
    setAvatar(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...(initialData && { id: initialData.id }),
      name,
      nickname,
      whatsapp,
      specialtyId,
      avatar,
      companyId: '', // App will fill this
    } as Professional);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-lilac-900/30 backdrop-blur-sm p-4 transition-opacity">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/50">
        <div className="flex justify-between items-center p-6 border-b border-cream-200 sticky top-0 bg-white/95 backdrop-blur z-10">
          <div>
             <h2 className="text-2xl font-serif text-gray-800">
               {initialData ? 'Editar Profissional' : 'Novo Profissional'}
             </h2>
             <p className="text-xs text-purple-600 mt-1 font-bold uppercase tracking-wider">Cadastro</p>
          </div>
          <button onClick={onClose} className="text-taupe-400 hover:text-rose-500 transition-colors p-2 hover:bg-rose-50 rounded-full">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-dashed border-purple-200 flex items-center justify-center overflow-hidden bg-purple-50 group-hover:border-purple-400 transition-all shadow-inner">
                {avatar ? (
                  <img src={avatar} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="text-purple-300" size={48} />
                )}
              </div>
              
              <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full shadow-lg border-2 border-white cursor-pointer hover:bg-purple-700 transition-colors">
                <Camera size={18} />
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <p className="mt-3 text-xs font-bold text-taupe-400 uppercase tracking-wide">Foto do Perfil</p>
          </div>

          <div className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-taupe-500 uppercase tracking-widest mb-2">Nome Completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-5 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all text-gray-800"
                placeholder="Ex: Juliana Santos"
              />
            </div>

            {/* Nickname */}
            <div>
              <label className="block text-xs font-bold text-taupe-500 uppercase tracking-widest mb-2">Apelido</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-5 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all text-gray-800"
                placeholder="Ex: Ju"
              />
            </div>

            {/* Specialty Selector */}
            <div>
                <label className="block text-xs font-bold text-taupe-500 uppercase tracking-widest mb-2">Especialidade</label>
                <div className="relative">
                    <select
                        value={specialtyId}
                        onChange={(e) => setSpecialtyId(e.target.value)}
                        required
                        className="w-full px-5 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all text-gray-800 appearance-none cursor-pointer"
                    >
                        <option value="" disabled>Selecione uma especialidade</option>
                        {specialties.map(spec => (
                            <option key={spec.id} value={spec.id}>{spec.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>
                {specialties.length === 0 && (
                     <p className="text-[10px] text-red-400 mt-1">* Cadastre especialidades primeiro na página anterior.</p>
                )}
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-xs font-bold text-taupe-500 uppercase tracking-widest mb-2">WhatsApp</label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-5 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all text-gray-800"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-cream-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-taupe-500 bg-white border border-cream-200 rounded-xl hover:bg-cream-50 focus:outline-none transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-8 py-4 text-sm font-bold uppercase tracking-widest text-white bg-purple-600 rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-200 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={18} />
              Salvar Profissional
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
