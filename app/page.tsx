import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-[1100px] mx-auto px-6 flex items-center justify-between h-14">
          <Link href="/" className="text-xl font-extrabold text-[#1B5E7B] no-underline">
            Re<span className="text-[#E8913A]">folder</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Iniciar Sesi&oacute;n
              </Button>
            </Link>
            <Link href="#registro">
              <Button size="sm" className="bg-[#E8913A] hover:bg-[#D07A2B] text-white text-sm font-semibold px-5 rounded-lg">
                Quiero acceso anticipado
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-36 pb-20 text-center bg-gradient-to-br from-white to-[#E8F4F8]">
        <div className="max-w-[1100px] mx-auto px-6">
          <span className="inline-block bg-[#FFF3E6] text-[#E8913A] font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
            Acceso anticipado &mdash; Plazas limitadas
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight max-w-[750px] mx-auto mb-5">
            Deja de perder horas con Excel.{" "}
            <span className="text-[#1B5E7B]">Genera presupuestos de reforma con IA en 2&nbsp;minutos.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-[620px] mx-auto mb-8 leading-relaxed">
            Describe la reforma en tus propias palabras, la inteligencia artificial genera el presupuesto desglosado con precios reales y t&uacute; lo exportas como PDF profesional con tu logo. As&iacute; de f&aacute;cil.
          </p>
          <Link href="#registro">
            <Button className="bg-[#E8913A] hover:bg-[#D07A2B] text-white font-bold text-lg px-9 py-6 rounded-xl shadow-lg shadow-orange-200 hover:-translate-y-0.5 transition-all">
              Reservar mi plaza gratis &rarr;
            </Button>
          </Link>
          <p className="mt-3.5 text-sm text-gray-500">
            <strong className="text-[#E8913A]">Solo 100 plazas</strong> con 1 mes PRO gratis para los primeros profesionales
          </p>
        </div>
      </section>

      {/* PROOF BAR */}
      <div className="border-t border-b border-gray-200 py-7">
        <div className="max-w-[1100px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-5 text-center">
          <div>
            <div className="text-3xl font-extrabold text-[#1B5E7B]">234.000</div>
            <div className="text-sm text-gray-500 mt-0.5">Aut&oacute;nomos de construcci&oacute;n en Espa&ntilde;a</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#1B5E7B]">2&ndash;4 horas</div>
            <div className="text-sm text-gray-500 mt-0.5">Tiempo medio por presupuesto en Excel</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#1B5E7B]">2 min</div>
            <div className="text-sm text-gray-500 mt-0.5">Con Refolder + IA</div>
          </div>
        </div>
      </div>

      {/* PROBLEMA */}
      <section className="py-20 bg-[#F8FAFB]">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E8913A]">El problema</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-3">&iquest;Te suena alguna de estas situaciones?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: "⏱", title: "Tardas 2–4 horas en cada presupuesto", desc: "Copias de uno anterior, ajustas precios a ojo, cambias partidas… y cuando lo envías, el cliente ya ha aceptado el de otro." },
              { icon: "❌", title: "Tus presupuestos no transmiten profesionalidad", desc: "Un Word sin formato, sin logo, sin desglose claro. El cliente compara el tuyo con un PDF profesional de la competencia y elige al otro." },
              { icon: "⚠️", title: "Los precios te bailan y acabas perdiendo margen", desc: "Materiales que han subido, partidas que se te olvidan, márgenes que no cuadran. Un error de cálculo puede costarte cientos de euros." },
              { icon: "📁", title: "\"Presupuesto_v3_FINAL_ definitivo(2).xlsx\"", desc: "¿Te resulta familiar? Quince versiones del mismo archivo, sin saber cuál es la buena. Se acabó el caos de carpetas." },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-7 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-base font-bold mb-2 break-words">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="py-20">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E8913A]">C&oacute;mo funciona</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-3">De la descripci&oacute;n al PDF profesional en 3 pasos</h2>
            <p className="text-lg text-gray-500 max-w-[600px] mx-auto mt-4">Sin curva de aprendizaje. Si sabes escribir un WhatsApp, sabes usar Refolder.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: 1, title: "Describe la reforma", desc: "Escribe lo que necesitas como se lo dirías a un compañero: \"reforma baño 6 m², cambio sanitarios, alicatado completo y mampara\". Sin formularios complicados." },
              { step: 2, title: "La IA genera el presupuesto", desc: "En segundos tienes un presupuesto desglosado con partidas, cantidades, precios unitarios y totales. Con precios de referencia actualizados de tu zona." },
              { step: 3, title: "Revisa, ajusta y envía", desc: "Modifica lo que quieras, añade tu logo y datos fiscales, y descárgalo como PDF profesional. Listo para enviar al cliente en el momento." },
            ].map((item) => (
              <div key={item.step} className="text-center p-8 bg-white rounded-xl shadow-sm">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#1B5E7B] text-white text-xl font-extrabold mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold mb-2.5">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="py-20 bg-[#F8FAFB]">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E8913A]">Ventajas</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-3">Lo que ganas usando Refolder</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: "⚡", title: "Recupera 3 horas por cada presupuesto", desc: "Lo que antes te llevaba una tarde entera, ahora lo resuelves en lo que dura un café. Más tiempo en obra, menos en el ordenador." },
              { icon: "🎯", title: "Presupuestos que cierran más obras", desc: "PDF profesional con tu logo, desglose por capítulos y aspecto de empresa consolidada. Tus clientes lo notarán." },
              { icon: "📈", title: "Precios de referencia siempre actualizados", desc: "Base de datos con precios de materiales y mano de obra por zona geográfica. Deja de buscar precios por internet a última hora." },
              { icon: "💼", title: "Todo organizado en un solo sitio", desc: "Presupuestos, clientes, versiones y estados (enviado, aceptado, rechazado). Sin Excel, sin Word, sin carpetas con 20 archivos." },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start p-6 bg-white rounded-xl border border-gray-200">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#E8F4F8] flex items-center justify-center text-2xl">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-base font-bold mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARA QUIÉN ES / PARA QUIÉN NO */}
      <section className="py-20">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E8913A]">Antes de seguir</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-3">&iquest;Es Refolder para ti?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[800px] mx-auto">
            <div>
              <h3 className="text-lg font-bold text-green-700 flex items-center gap-2 mb-4">✅ Pensada para ti si&hellip;</h3>
              <ul className="space-y-3">
                {[
                  "Eres autónomo o tienes una pequeña empresa de reformas",
                  "Haces presupuestos en Excel, Word o copiando de anteriores",
                  "Pierdes tiempo y a veces clientes por tardar en responder",
                  "Quieres dar una imagen más profesional sin complicarte",
                  "No quieres pagar 400 €/año por un software que no entiendes",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-gray-600">
                    <span className="text-green-600 flex-shrink-0">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-400 flex items-center gap-2 mb-4">🚫 Probablemente no es para ti si&hellip;</h3>
              <ul className="space-y-3">
                {[
                  "Ya usas un ERP completo tipo Presto y estás contento",
                  "Gestionas obra pública con licitaciones complejas",
                  "Necesitas mediciones detalladas con software BIM",
                  "Tu empresa tiene +20 empleados y procesos internos cerrados",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-gray-600">
                    <span className="text-gray-400 flex-shrink-0">&mdash;</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* DATOS DEL SECTOR */}
      <section className="py-20 bg-[#F8FAFB]">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E8913A]">El sector</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-3">Por qu&eacute; ahora y por qu&eacute; esto</h2>
            <p className="text-lg text-gray-500 max-w-[600px] mx-auto mt-4">El mercado est&aacute; cambiando. Quien se adapte primero, gana.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { number: "71%", label: "de las obras en España son reformas, no obra nueva", source: "Fuente: DoubleTrade, 2025" },
              { number: "2026–2027", label: "Facturación electrónica obligatoria para autónomos (VeriFactu)", source: "Fuente: Agencia Tributaria" },
              { number: "60%", label: "de reducción de tiempo con IA en elaboración de presupuestos", source: "Fuente: DIIP AI / Budquo, 2025" },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-7 text-center">
                <div className="text-3xl font-extrabold text-[#1B5E7B] mb-1">{item.number}</div>
                <div className="text-sm text-gray-500 leading-snug">{item.label}</div>
                <div className="text-xs text-gray-400 mt-2">{item.source}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-20">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E8913A]">Planes y precios</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-3">Empieza gratis. Paga solo cuando te convenza.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Plan Gratis */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Gratis</div>
              <div className="text-4xl font-extrabold mb-1">0€ <span className="text-base font-normal text-gray-500">/mes</span></div>
              <div className="text-sm text-gray-500 mb-5 min-h-[40px]">Para probar la herramienta sin compromiso</div>
              <ul className="text-left space-y-2 mb-6">
                {["3 presupuestos al mes", "2 generaciones con IA incluidas", "Exportación PDF básica", "Gestión de clientes"].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-green-600 font-bold text-xs">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="#registro" className="block w-full py-3 border-2 border-[#1B5E7B] text-[#1B5E7B] font-semibold rounded-lg text-center hover:bg-[#1B5E7B] hover:text-white transition-all">
                Probar gratis
              </Link>
            </div>

            {/* Plan Pro */}
            <div className="bg-white border-2 border-[#E8913A] rounded-xl p-8 text-center relative scale-[1.03] hover:shadow-lg transition-shadow">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E8913A] text-white font-bold text-xs px-4 py-1 rounded-full whitespace-nowrap">
                El m&aacute;s elegido
              </span>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Pro</div>
              <div className="text-4xl font-extrabold mb-1">19,90€ <span className="text-base font-normal text-gray-500">/mes</span></div>
              <div className="text-sm text-gray-500 mb-5 min-h-[40px]">Todo lo que necesita un aut&oacute;nomo de reformas</div>
              <ul className="text-left space-y-2 mb-6">
                {["Presupuestos ilimitados", "IA generativa (50 usos/mes)", "Base de precios completa por zona", "PDF profesional con tu logo", "Historial y gestión de clientes"].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-green-600 font-bold text-xs">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="#registro" className="block w-full py-3 bg-[#E8913A] text-white font-semibold rounded-lg text-center hover:bg-[#D07A2B] transition-all">
                Reservar plaza PRO
              </Link>
            </div>

            {/* Plan Business */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Business</div>
              <div className="text-4xl font-extrabold mb-1">39,90€ <span className="text-base font-normal text-gray-500">/mes</span></div>
              <div className="text-sm text-gray-500 mb-5 min-h-[40px]">Para peque&ntilde;as empresas de reformas</div>
              <ul className="text-left space-y-2 mb-6">
                {["Todo lo de PRO incluido", "IA sin límite de usos", "Hasta 3 usuarios", "Plantillas avanzadas por tipo de obra", "Comparador de márgenes"].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-green-600 font-bold text-xs">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="#registro" className="block w-full py-3 border-2 border-[#1B5E7B] text-[#1B5E7B] font-semibold rounded-lg text-center hover:bg-[#1B5E7B] hover:text-white transition-all">
                Contactar
              </Link>
            </div>
          </div>
          <p className="text-center mt-5 text-sm text-gray-500">
            <strong className="text-green-700">30 d&iacute;as de prueba gratuita</strong> con todas las funcionalidades en cualquier plan de pago.
          </p>
        </div>
      </section>

      {/* FORMULARIO DE CAPTACIÓN */}
      <section id="registro" className="py-20 bg-gradient-to-br from-[#1B5E7B] to-[#134A62] text-center">
        <div className="max-w-[1100px] mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Reserva tu acceso anticipado</h2>
          <p className="text-lg text-white/80 max-w-[600px] mx-auto mb-9">
            Estamos ultimando la app. D&eacute;janos tu email y ser&aacute;s de los primeros en probarla. Los 100 primeros tendr&aacute;n 1 mes PRO completamente gratis.
          </p>
          <div className="bg-white rounded-xl p-9 max-w-[500px] mx-auto shadow-2xl">
            <form action="https://formspree.io/f/TU_ID_FORMSPREE" method="POST">
              <label className="block text-sm font-semibold text-gray-900 mb-1.5 text-left" htmlFor="email">Tu email profesional *</label>
              <input
                type="email" id="email" name="email" placeholder="tu@email.com" required
                className="block w-full px-3.5 py-3 border border-gray-200 rounded-lg text-sm mb-4 focus:outline-none focus:border-[#1B5E7B] focus:ring-2 focus:ring-[#1B5E7B]/10"
              />

              <label className="block text-sm font-semibold text-gray-900 mb-1.5 text-left" htmlFor="tipo">&iquest;A qu&eacute; te dedicas? *</label>
              <select
                id="tipo" name="tipo" required
                className="block w-full px-3.5 py-3 border border-gray-200 rounded-lg text-sm mb-4 focus:outline-none focus:border-[#1B5E7B] focus:ring-2 focus:ring-[#1B5E7B]/10 bg-white"
              >
                <option value="" disabled>Selecciona una opci&oacute;n</option>
                <option value="autonomo">Aut&oacute;nomo de reformas / construcci&oacute;n</option>
                <option value="empresa_peq">Empresa de reformas (1–5 empleados)</option>
                <option value="empresa_med">Empresa de construcci&oacute;n (6–20 empleados)</option>
                <option value="arquitecto">Arquitecto / aparejador</option>
                <option value="otro">Otro</option>
              </select>

              <label className="block text-sm font-semibold text-gray-900 mb-1.5 text-left" htmlFor="provincia">Provincia (opcional)</label>
              <select
                id="provincia" name="provincia"
                className="block w-full px-3.5 py-3 border border-gray-200 rounded-lg text-sm mb-4 focus:outline-none focus:border-[#1B5E7B] focus:ring-2 focus:ring-[#1B5E7B]/10 bg-white"
              >
                <option value="">Selecciona provincia</option>
                <option>Álava</option><option>Albacete</option><option>Alicante</option>
                <option>Almería</option><option>Asturias</option><option>Ávila</option>
                <option>Badajoz</option><option>Barcelona</option><option>Burgos</option>
                <option>Cáceres</option><option>Cádiz</option><option>Cantabria</option>
                <option>Castellón</option><option>Ciudad Real</option><option>Córdoba</option>
                <option>A Coruña</option><option>Cuenca</option><option>Girona</option>
                <option>Granada</option><option>Guadalajara</option><option>Guipúzcoa</option>
                <option>Huelva</option><option>Huesca</option><option>Illes Balears</option>
                <option>Jaén</option><option>La Rioja</option><option>Las Palmas</option>
                <option>León</option><option>Lleida</option><option>Lugo</option>
                <option>Madrid</option><option>Málaga</option><option>Murcia</option>
                <option>Navarra</option><option>Ourense</option><option>Palencia</option>
                <option>Pontevedra</option><option>Salamanca</option><option>S.C. Tenerife</option>
                <option>Segovia</option><option>Sevilla</option><option>Soria</option>
                <option>Tarragona</option><option>Teruel</option><option>Toledo</option>
                <option>Valencia</option><option>Valladolid</option><option>Vizcaya</option>
                <option>Zamora</option><option>Zaragoza</option>
              </select>

              <button
                type="submit"
                className="block w-full py-3.5 bg-[#E8913A] text-white font-bold text-base rounded-lg hover:bg-[#D07A2B] transition-colors cursor-pointer"
              >
                Reservar mi plaza gratis →
              </button>
            </form>
            <p className="mt-3 text-xs text-gray-500 text-center">
              Solo usamos tu email para avisarte del lanzamiento. Sin spam. Puedes darte de baja en cualquier momento. Cumplimos con el RGPD.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1A1A2E] text-white/60 text-center py-8 text-sm">
        <div className="max-w-[1100px] mx-auto px-6">
          <p><strong className="text-white/85">Refolder</strong> © 2026</p>
          <p className="mt-1.5">Hecha en Espa&ntilde;a para profesionales de la construcci&oacute;n y reformas.</p>
          <p className="mt-2 text-xs opacity-60">Pol&iacute;tica de privacidad &nbsp;|&nbsp; Aviso legal &nbsp;|&nbsp; Pol&iacute;tica de cookies</p>
        </div>
      </footer>
    </div>
  );
}
