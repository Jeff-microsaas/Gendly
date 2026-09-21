
import React, { useState } from 'react';
import { X, Plus, Trash2, Tag } from 'lucide-react';
import { Specialty } from '../types';

interface SpecialtyModalProps {
  isOpen: boolean;
  onClose: () => void;
  specialties: Specialty[];
  onAdd: (name: string) => void;
  onDelete: (id: string) => void;
}

export const SpecialtyModal: React.FC<SpecialtyModalProps> = ({ isOpen, onClose, specialties, onAdd, onDelete }) => {
  const [newSpecialty, setNewSpecialty] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSpecialty.trim()) {
      onAdd(newSpecialty.trim());
      setNewSpecialty('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Especialidades</h2>
            <p className="text-xs text-gray-400">Gerencie as áreas de atuação.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <form onSubmit={handleAdd} className="flex gap-2 mb-6">
            <input
              type="text"
              value={newSpecialty}
              onChange={(e) => setNewSpecialty(e.target.value)}
              placeholder="Nova especialidade (ex: Manicure)"
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
            <button
              type="submit"
              disabled={!newSpecialty.trim()}
              className="px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={20} />
            </button>
          </form>

          <div className="space-y-2">
            {specialties.length > 0 ? (
              specialties.map((spec) => (
                <div key={spec.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-purple-100 transition-colors shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-50 p-2 rounded-lg text-purple-600">
                       <Tag size={16} />
                    </div>
                    <span className="font-bold text-gray-700">{spec.name}</span>
                  </div>
                  <button
                    onClick={() => onDelete(spec.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">
                Nenhuma especialidade cadastrada.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
