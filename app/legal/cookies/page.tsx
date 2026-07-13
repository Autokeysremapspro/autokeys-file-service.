import LegalLayout from '@/components/legal/LegalLayout'

export default function CookiesPage() {
  return (
    <LegalLayout title="Política de cookies" updated="13 de julio de 2026">
      <p>
        Este portal utiliza cookies técnicas propias, estrictamente necesarias para su funcionamiento. No
        utilizamos cookies de publicidad ni de seguimiento de terceros con fines comerciales.
      </p>

      <h2>Cookies que utilizamos</h2>
      <ul>
        <li><strong>Cookies de sesión y autenticación</strong> (Supabase): permiten identificarte y mantener tu sesión iniciada mientras usas el portal. Son estrictamente necesarias — sin ellas no podrías acceder a tu cuenta.</li>
        <li><strong>Cookies de preferencias</strong>: recuerdan ajustes básicos de tu sesión (por ejemplo, si marcaste "recordarme" al iniciar sesión).</li>
      </ul>
      <p>
        Al ser cookies técnicas estrictamente necesarias para el funcionamiento del servicio, no requieren tu
        consentimiento previo conforme al artículo 22.2 de la LSSI-CE.
      </p>

      <h2>Cómo gestionar las cookies</h2>
      <p>
        Puedes eliminar o bloquear las cookies desde la configuración de tu navegador. Ten en cuenta que si
        bloqueas las cookies de sesión, no podrás iniciar sesión ni utilizar las áreas privadas del portal.
      </p>
    </LegalLayout>
  )
}
