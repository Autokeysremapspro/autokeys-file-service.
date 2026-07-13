import LegalLayout from '@/components/legal/LegalLayout'

export default function TerminosPage() {
  return (
    <LegalLayout title="Términos y condiciones" updated="13 de julio de 2026">
      <p>
        Estos Términos y Condiciones regulan el acceso y uso de AK Cloud, el portal de <strong>Autokeys Remaps
        Pro</strong> para la gestión de solicitudes de reprogramación y electrónica de unidades de control
        electrónico (ECU). El registro o el uso del portal implica la aceptación íntegra de estos términos.
      </p>

      <h2>1. Quién puede usar este servicio</h2>
      <p>
        AK Cloud está dirigido exclusivamente a profesionales del sector (talleres, distribuidores e
        instaladores). El alta como distribuidor requiere aprobación expresa por parte de Autokeys Remaps Pro, que
        se reserva el derecho a rechazar o suspender cualquier cuenta a su criterio.
      </p>

      <h2>2. Descripción del servicio</h2>
      <p>
        Prestamos servicios técnicos de modificación de software de unidades de control electrónico (ECU) sobre
        archivos de programación que el cliente nos facilita voluntariamente, incluyendo — entre otros — ajustes
        de potencia (Stage 1, Stage 2), desactivación de sistemas anticontaminación (EGR, DPF, AdBlue/SCR) y otras
        soluciones que se detallan en el catálogo del portal.
      </p>

      <h2>3. Uso previsto y responsabilidad del cliente — IMPORTANTE</h2>
      <p>
        <strong>Algunas de las soluciones ofrecidas (incluyendo, sin limitación, la desactivación de EGR, DPF y
        AdBlue/SCR) modifican el comportamiento de los sistemas anticontaminación del vehículo respecto a su
        configuración de fábrica.</strong> En la mayoría de jurisdicciones, la circulación por vías públicas con
        estos sistemas desactivados puede constituir una infracción administrativa o incumplir la normativa de
        homologación e inspección técnica de vehículos (ITV) vigente.
      </p>
      <p>
        Autokeys Remaps Pro presta un <strong>servicio técnico bajo demanda del cliente</strong> y no supervisa ni
        controla el uso final que se dé al vehículo tras la modificación. El cliente que solicita el servicio (y,
        en su caso, el distribuidor que lo intermedia) declara conocer la normativa aplicable en su país o región,
        y asume bajo su exclusiva responsabilidad:
      </p>
      <ul>
        <li>Verificar si el uso previsto (circuito cerrado, competición, uso agrícola/industrial fuera de vía pública, u otro) es conforme a la legislación aplicable.</li>
        <li>Las consecuencias administrativas, sancionadoras o de cualquier otra índole derivadas del uso del vehículo modificado en vía pública.</li>
        <li>Restablecer la configuración de fábrica si la normativa aplicable así lo exige antes de circular por vía pública.</li>
      </ul>
      <p>
        Autokeys Remaps Pro queda exonerada de cualquier responsabilidad derivada de un uso del vehículo contrario
        a la normativa vigente en el lugar donde este circule.
      </p>

      <h2>4. Precios y pago</h2>
      <p>
        Los precios de cada solución se muestran en el portal antes de confirmar el pedido, en euros e IVA
        incluido salvo indicación en contrario. El pago se realiza en el momento de solicitar el servicio, a
        través de PayPal, o queda incluido sin coste adicional cuando el servicio está cubierto por el plan de
        suscripción activo del distribuidor, dentro de los límites de dicho plan.
      </p>

      <h2>5. Planes de suscripción</h2>
      <p>
        Los planes de suscripción (Free, Essential, Performance u otros que se publiquen) tienen una duración
        determinada y pueden incluir un número máximo de solicitudes diarias y un catálogo de servicios cubiertos
        sin coste adicional, según se detalla en el portal en el momento de la contratación. La renovación de un
        plan de pago requiere confirmación por parte de Autokeys Remaps Pro tras verificar el cobro correspondiente.
      </p>

      <h2>6. Plazos de entrega</h2>
      <p>
        Los plazos de entrega mostrados en el portal son orientativos y pueden variar según la carga de trabajo y
        la complejidad técnica de cada solicitud. Informaremos al cliente de cualquier retraso significativo a
        través del propio portal o por email.
      </p>

      <h2>7. Cancelaciones y devoluciones</h2>
      <p>
        Un pedido puede cancelarse antes de que su procesamiento técnico haya comenzado, solicitándolo a través
        del portal de soporte. Si el pedido ya se ha pagado y se cancela antes de iniciar el trabajo, se gestionará
        la devolución del importe correspondiente. Una vez iniciado o finalizado el trabajo técnico sobre el
        archivo, no se admiten devoluciones, dado el carácter personalizado e irrepetible del servicio prestado.
      </p>

      <h2>8. Propiedad de los archivos</h2>
      <p>
        El cliente garantiza que dispone de los derechos necesarios sobre el archivo de programación ECU que sube
        al portal. Autokeys Remaps Pro únicamente conserva los archivos el tiempo necesario para prestar el
        servicio y su seguimiento, conforme a lo indicado en la <a href="/legal/privacidad">Política de
        Privacidad</a>.
      </p>

      <h2>9. Modificación de estos términos</h2>
      <p>
        Podemos actualizar estos Términos y Condiciones para reflejar cambios en el servicio o en la normativa
        aplicable. Publicaremos la versión vigente en esta misma página, indicando la fecha de última
        actualización.
      </p>

      <h2>10. Legislación y jurisdicción</h2>
      <p>
        Estos términos se rigen por la legislación española. Cualquier controversia se someterá a los juzgados y
        tribunales que correspondan conforme a derecho.
      </p>
    </LegalLayout>
  )
}
