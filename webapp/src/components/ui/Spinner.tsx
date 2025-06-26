// src/components/ui/Spinner.tsx
import React from 'react';

export default function Spinner() {
  return (
    <div className="flex justify-center">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
    </div>
  );
}
