export default function MapPage() {
    return (
        <section className="page-shell">
            <p className="eyebrow">Strategic View</p>
            <h1>Region Map</h1>
            <p className="lede">
                The interactive region map will be implemented in Epic 04.
                This view will allow you to scout provinces and plan moves.
            </p>
            <div style={{
                width: '100%',
                height: '300px',
                background: '#f0f0f0',
                border: '2px dashed #ccc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                marginTop: '20px'
            }}>
                <p style={{ color: '#666' }}>[Map Visualization Placeholder]</p>
            </div>
        </section>
    )
}
