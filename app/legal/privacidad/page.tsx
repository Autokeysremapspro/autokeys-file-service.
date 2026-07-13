import LegalLayout from '@/components/legal/LegalLayout'

export default function PrivacidadPage() {
  return (
    <LegalLayout title="Política de privacidad" updated="13 de julio de 2026">
      <p>
        En <strong>Autokeys Remaps Pro</strong> ("nosotros") tratamos los datos personales de las personas
        usuarias de AK Cloud de acuerdo con el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018, de
        Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD).
      </p>

      <h2>Responsable del tratamiento</h2>
      <p>
        <strong>Ana Rosa Morro Bustamante (nombre comercial: Autokeys Remaps Pro)</strong>, NIF/CIF <strong>43214965-N</strong>, con domicilio en
        <strong> Av. Andalucía, 125, Bajo Local, 23350 Puente de Génave, Jaén</strong>. Contacto: <strong>info@autokeyslab.com</strong>.
      </p>

      <h2>Qué datos tratamos</h2>
      <ul>
        <li>Datos identificativos y de contacto: nombre, empresa, email, teléfono, dirección.</li>
        <li>Datos fiscales necesarios para la facturación (NIF/CIF, dirección fiscal).</li>
        <li>Datos de la cuenta: credenciales de acceso, historial de pedidos y comunicaciones de soporte.</li>
        <li>Datos técnicos de los vehículos que nos facilitas para prestar el servicio (marca, modelo, ECU, archivos de programación).</li>
        <li>Datos de pago procesados por PayPal — no almacenamos datos de tarjetas en nuestros servidores.</li>
      </ul>

      <h2>Con qué finalidad tratamos tus datos</h2>
      <ul>
        <li>Gestionar tu alta como distribuidor y tu acceso al portal.</li>
        <li>Prestar el servicio de reprogramación/electrónica ECU que solicitas, incluida la comunicación sobre el estado de tus pedidos.</li>
        <li>Gestionar los pagos y emitir la facturación correspondiente.</li>
        <li>Enviarte notificaciones operativas (aprobación de cuenta, cambios de estado de pedidos, avisos de soporte) por email.</li>
        <li>Cumplir con nuestras obligaciones legales, fiscales y contables.</li>
      </ul>

      <h2>Legitimación</h2>
      <p>
        La base legal para el tratamiento es la ejecución del contrato de prestación de servicios que aceptas al
        registrarte, así como el cumplimiento de obligaciones legales (fiscales y contables) y, en su caso, tu
        consentimiento expreso para comunicaciones adicionales.
      </p>

      <h2>Con quién compartimos tus datos</h2>
      <p>
        Compartimos los datos estrictamente necesarios con proveedores que nos prestan servicio bajo contrato de
        encargo de tratamiento: <strong>Supabase</strong> (alojamiento de base de datos y autenticación),
        <strong> Vercel</strong> (alojamiento de la aplicación), <strong> Resend</strong> (envío de emails
        transaccionales) y <strong>PayPal</strong> (procesamiento de pagos). No cedemos tus datos a terceros con
        fines comerciales.
      </p>

      <h2>Cuánto tiempo conservamos tus datos</h2>
      <p>
        Conservamos tus datos mientras mantengas una cuenta activa en el portal y, tras la baja, durante los
        plazos legalmente exigidos para el cumplimiento de obligaciones fiscales y contables (con carácter
        general, 6 años conforme al Código de Comercio).
      </p>

      <h2>Tus derechos</h2>
      <p>
        Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y
        portabilidad escribiendo a <strong>info@autokeyslab.com</strong>, indicando el derecho que deseas ejercer y
        adjuntando copia de un documento que acredite tu identidad. También puedes presentar una reclamación ante
        la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" target="_blank" rel="noreferrer">www.aepd.es</a>) si consideras que no hemos atendido correctamente tu solicitud.
      </p>

      <h2>Seguridad</h2>
      <p>
        Aplicamos medidas técnicas y organizativas razonables para proteger tus datos frente a accesos no
        autorizados, pérdida o alteración, incluyendo control de acceso restringido y comunicaciones cifradas.
      </p>
    </LegalLayout>
  )
}
