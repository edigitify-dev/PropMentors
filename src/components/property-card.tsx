import Image from "next/image";
import Link from "next/link";
import { formatProjectPrice, projectHref, type Project } from "../data/projects";

export function PropertyCard({ property, className = "" }: { property: Project; className?: string }) {
  const image = property.cover;
  return (
    <article className={`property-card ${className}`}>
      <Link className="property-card-trigger" href={projectHref(property)} aria-label={`View project: ${property.name}`} />
      <div className="property-photo">
        <div className="property-photo-mask">
          <Image src={image.src} alt={image.alt} width={image.width} height={image.height} unoptimized
            style={{ top: `${-image.cropTop / 260 * 100}%`, width: `${image.cropWidth / 400 * 100}%`, height: `${image.cropHeight / 260 * 100}%` }} />
        </div>
        <div className="property-badges"><span>{property.category}</span><span>{property.badge}</span></div>
      </div>
      <div className="property-details">
        <p className="property-price">{formatProjectPrice(property.price)}</p>
        <h3>{property.name}</h3>
        <p className="property-location">{property.locationLabel}</p>
        <ul className="property-amenities" aria-label="Property features">
          {property.features.map((feature, index) => <li key={feature}>
            {index > 0 && <Image src="/images/spaces/detail-dot.svg" alt="" width={4} height={4} unoptimized />}
            <span>{feature}</span>
          </li>)}
        </ul>
      </div>
    </article>
  );
}
