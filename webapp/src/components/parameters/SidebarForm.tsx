// src/components/parameters/SidebarForm.tsx
import React from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

export default function SidebarForm({ open, onClose, title, children }: Props) {
  return (
    <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-lg z-50 transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button onClick={onClose} className="text-red-600 hover:underline">Close</button>
      </div>
      <div className="p-4 overflow-y-auto">{children}</div>
    </div>
  );
}
