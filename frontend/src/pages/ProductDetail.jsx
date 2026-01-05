import React from 'react';
import { useParams } from 'react-router-dom';

const ProductDetail = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-ivory py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-light text-charcoal text-center mb-12">
          Détail Produit
        </h1>
        <p className="text-center text-stone">Produit ID: {id}</p>
      </div>
    </div>
  );
};

export default ProductDetail;
