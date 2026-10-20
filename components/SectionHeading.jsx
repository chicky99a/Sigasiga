export default function SectionHeading({ id, asset, children }) {
  return <h2 id={id} className="section-heading">
    <img src={`/assets/${asset}`} alt={children} />
  </h2>;
}
