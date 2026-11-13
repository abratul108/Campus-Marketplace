import "./ProductCard.css";

function ProductCard({product}) {
  return (
    <div className="card">

      <img 
        src="https://via.placeholder.com/200"
        alt={product.name}
      />

      <h3>{product.name}</h3>

      <p>Price: {product.price} Tk</p>

      <p>Category: {product.category}</p>

      <button>View Details</button>

    </div>
  );
}

export default ProductCard;