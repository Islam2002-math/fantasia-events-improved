export default function MinimalPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Fantasia Events - Version Minimale</h1>
      <p>Site en ligne et fonctionnel !</p>
      
      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h2>Événements</h2>
        <p>Liste des événements à venir...</p>
      </div>

      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h2>Réservation</h2>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
          <input type="text" placeholder="Nom" style={{ padding: '8px' }} />
          <input type="email" placeholder="Email" style={{ padding: '8px' }} />
          <button type="submit" style={{ padding: '10px', background: '#007cba', color: 'white', border: 'none', cursor: 'pointer' }}>
            Réserver
          </button>
        </form>
      </div>
    </div>
  );
}