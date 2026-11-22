export default function ShopLoading() {
  return (
    <main className="atelier atelier-wrap shop-view" aria-busy="true">
      <p className="eyebrow">RORECLUB / Collection</p>
      <h1>Shop the collection.</h1>
      <p role="status">Loading pieces…</p>
      <div className="product-grid" aria-hidden="true">
        {[0, 1, 2, 3].map((n) => (
          <div key={n} className="skeleton-piece rc-product-stage" />
        ))}
      </div>
    </main>
  );
}
