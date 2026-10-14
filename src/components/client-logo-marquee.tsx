export function ClientLogoMarquee() {
  return (
    <div className="glance-client-logos">
      <div className="glance-client-logos-window">
        <div className="glance-client-logos-track">
          {[0, 1].map((copy) => (
            <div className="glance-client-logos-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>
              <div
                className="glance-client-logos-art"
                role={copy === 0 ? "img" : undefined}
                aria-label={copy === 0 ? "Client logos including ContraVault AI, Spyne, Kris@Work, TOCAL, Bharat Tender and Milo Drive" : undefined}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
