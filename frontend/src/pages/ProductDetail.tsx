import { useParams } from "react-router-dom";

function ProductDetail() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-bg-neutral flex items-center justify-center px-4">
      <p className="text-text-primary">Detalle del producto {id} (próximamente).</p>
    </div>
  );
}

export default ProductDetail;
