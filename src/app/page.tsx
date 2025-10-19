export default function HomePage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '3em', color: '#6b46c1', textAlign: 'center', marginBottom: '30px' }}>
        Fantasia Events
      </h1>
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <p style={{ fontSize: '1.2em', color: '#4b5563', marginBottom: '20px' }}>
          Site en ligne et fonctionnel ! Découvrez des expériences inoubliables.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button style={{ 
            padding: '12px 24px', 
            fontSize: '1.1em',
            background: '#6b46c1', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            Découvrir les événements
          </button>
          <button style={{ 
            padding: '12px 24px', 
            fontSize: '1.1em',
            background: 'transparent', 
            color: '#6b46c1', 
            border: '2px solid #6b46c1', 
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            Mon compte
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ border: '1px solid #d1d5db', borderRadius: '8px', padding: '20px', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#1f2937', marginBottom: '10px' }}>Concert Jazz et Blues</h3>
          <p style={{ color: '#6b7280', marginBottom: '15px' }}>Soirée musicale avec les meilleurs artistes de jazz et blues de la région.</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#6b46c1', fontWeight: 'bold' }}>45€</span>
            <span style={{ fontSize: '0.9em', color: '#9ca3af' }}>15 Feb 2024</span>
          </div>
        </div>
        
        <div style={{ border: '1px solid #d1d5db', borderRadius: '8px', padding: '20px', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#1f2937', marginBottom: '10px' }}>Festival Gastronomique</h3>
          <p style={{ color: '#6b7280', marginBottom: '15px' }}>Découvrez les saveurs du monde avec nos chefs étoilés.</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#6b46c1', fontWeight: 'bold' }}>35€</span>
            <span style={{ fontSize: '0.9em', color: '#9ca3af' }}>20 Feb 2024</span>
          </div>
        </div>
        
        <div style={{ border: '1px solid #d1d5db', borderRadius: '8px', padding: '20px', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#1f2937', marginBottom: '10px' }}>Spectacle de Danse</h3>
          <p style={{ color: '#6b7280', marginBottom: '15px' }}>Ballet moderne et danses contemporaines par la troupe nationale.</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#6b46c1', fontWeight: 'bold' }}>55€</span>
            <span style={{ fontSize: '0.9em', color: '#9ca3af' }}>25 Feb 2024</span>
          </div>
        </div>
      </div>

      <div style={{ background: '#f9fafb', padding: '30px', borderRadius: '8px', marginTop: '40px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#1f2937' }}>Contact</h2>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '500px', margin: '0 auto' }}>
          <input 
            type="text" 
            placeholder="Nom" 
            style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1em' }} 
          />
          <input 
            type="email" 
            placeholder="Email" 
            style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1em' }} 
          />
          <button 
            type="submit" 
            style={{ 
              padding: '12px', 
              background: '#6b46c1', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontSize: '1em'
            }}
          >
            Envoyer
          </button>
        </form>
      </div>
      
      <footer style={{ textAlign: 'center', marginTop: '50px', padding: '20px', borderTop: '1px solid #e5e7eb' }}>
        <p style={{ color: '#6b7280' }}>© 2024 Fantasia Events - Déployé avec succès !</p>
      </footer>
    </div>
  )
}
