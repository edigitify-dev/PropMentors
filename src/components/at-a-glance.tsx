import Image from "next/image";

type StatPhotoProps = {
  variant: "cities" | "leased" | "clients";
  value: string;
  label: string;
};

const photos = {
  cities: { src: "/images/glance/cities.png", width: 761, height: 1024 },
  leased: { src: "/images/glance/leased-space.png", width: 972, height: 1024 },
  clients: { src: "/images/glance/clients.png", width: 586, height: 1024 },
};

function StatPhoto({ variant, value, label }: StatPhotoProps) {
  const photo = photos[variant];
  return (
    <div className={`glance-photo glance-photo-${variant}`}>
      <div className="glance-photo-mask" aria-hidden="true">
        <Image src={photo.src} alt="" width={photo.width} height={photo.height} unoptimized />
      </div>
      <div className="glance-photo-shade" aria-hidden="true" />
      <div className="glance-stat-caption">
        <p className="glance-value">{value}</p>
        <p className="glance-stat-label">{label}</p>
      </div>
    </div>
  );
}

export function AtAGlance() {
  return (
    <section className="glance" id="at-a-glance" aria-labelledby="glance-heading" data-node-id="331:1792">
      <div className="glance-heading">
        <div className="section-badge" data-node-id="382:1689">
          <span className="section-badge-icon" aria-hidden="true">
            <Image src="/images/glance/badge-star.svg" alt="" width={17} height={17} unoptimized />
          </span>
          <span>PROPMENTORS AT A GLANCE</span>
        </div>
        <div className="glance-heading-row">
          <h2 id="glance-heading">Experience you can measure</h2>
          <p>Connecting businesses with the right spaces, backed by experience and proven results.</p>
        </div>
      </div>

      <div className="glance-stats">
        <div className="glance-column">
          <StatPhoto variant="cities" value="5+" label="CITIES" />
          <div className="glance-feature"><p>3 WAYS TO WORK</p></div>
        </div>
        <div className="glance-column glance-column-center">
          <div className="glance-feature"><p>CURATED SPACES</p></div>
          <StatPhoto variant="leased" value="1Mn+" label="SQ.FT. LEASED & TRANSACTED" />
        </div>
        <div className="glance-column">
          <StatPhoto variant="clients" value="100+" label="CLIENTS" />
          <div className="glance-feature glance-feature-destinations"><p>KEY BUSINESS DESTINATIONS</p></div>
        </div>
      </div>
    </section>
  );
}
