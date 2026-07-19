import { Head, Link, usePage } from '@inertiajs/react';
import { 
    Shirt, 
    Calendar, 
    Truck, 
    Sparkles, 
    HelpCircle, 
    ChevronDown
} from 'lucide-react';
import { useState } from 'react';
import PublicLayout from '@/layouts/PublicLayout';

interface FAQItem {
    question: string;
    answer: string;
}

export default function ComoFunciona() {
    const { auth } = usePage().props;
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const steps = [
        {
            title: "1. Selecciona tu Prenda",
            description: "Explora nuestro catálogo en línea y elige entre elegantes vestidos de gala, ternos a medida, trajes folclóricos y accesorios premium.",
            icon: Shirt,
            color: "text-[#94344c]",
            bgColor: "bg-[#94344c]/10"
        },
        {
            title: "2. Reserva tu Fecha",
            description: "Elige el rango de días en el que usarás el outfit. Nuestro sistema verificará la disponibilidad real para asegurar que tu prenda esté lista.",
            icon: Calendar,
            color: "text-[#dfb279]",
            bgColor: "bg-[#dfb279]/20"
        },
        {
            title: "3. Recoge en la Oficina",
            description: "Acércate a la oficina física de Bienestar Universitario en el campus con tu carné de estudiante. Te entregaremos la prenda planchada y en funda.",
            icon: Truck,
            color: "text-blue-600",
            bgColor: "bg-blue-50"
        },
        {
            title: "4. Devuelve y Reembolsa",
            description: "Usa el traje en tu evento académico o graduación y devuélvelo al concluir. Al verificar que esté en óptimas condiciones, te devolvemos la garantía.",
            icon: Sparkles,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50"
        }
    ];

    const faqs: FAQItem[] = [
        {
            question: "¿Quiénes pueden hacer uso del Armario UNSCH?",
            answer: "El servicio está dirigido exclusivamente a estudiantes matriculados de la Universidad Nacional de San Cristóbal de Huamanga (UNSCH) que cuenten con su matrícula vigente o carné universitario."
        },
        {
            question: "¿Cuánto tiempo dura el alquiler de la prenda?",
            answer: "El alquiler estándar tiene una duración de 48 horas (2 días). Esto te permite retirar la prenda el día anterior a tu evento y devolverla al día siguiente de su realización."
        },
        {
            question: "¿Cómo funciona el depósito de garantía?",
            answer: "Al reservar, se realiza un pago neto de alquiler y un adicional en concepto de garantía. Dicho depósito es retenido en custodia temporal y se reembolsa en su totalidad a tu cuenta de ahorros una vez que devuelvas la prenda en las mismas condiciones en que fue retirada."
        },
        {
            question: "¿Qué ocurre en caso de daños o retraso en la entrega?",
            answer: "Si devuelves la prenda después de la fecha límite establecida, se cobrará una multa por mora diaria (según la configuración del sistema, típicamente S/ 10.00). Si la prenda presenta daños reparables (manchas o roturas menores), se descontará de la garantía el costo del sastre o tintorería."
        },
        {
            question: "¿Las prendas se entregan limpias?",
            answer: "Sí. Todas las prendas de vestir del Armario UNSCH pasan por un riguroso proceso de tintorería y sanitización antes de ser expuestas de nuevo al catálogo, garantizando la higiene y presentación de cada pieza."
        }
    ];

    return (
        <PublicLayout auth={auth as any}>
            <Head title="Cómo Funciona - Armario UNSCH" />

            <div className="bg-[#fdfbfb] min-h-screen py-16">
                <div className="container mx-auto max-w-screen-xl px-4 md:px-8 text-left">
                    
                    {/* Header Principal */}
                    <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#94344c] bg-[#94344c]/10 px-4 py-1.5 rounded-full">Proceso Simple</span>
                        <h1 className="text-4xl font-serif font-black text-[#1a050a] tracking-tight">Cómo Funciona el Armario</h1>
                        <p className="text-xs font-semibold text-[#8a3348]/60 uppercase tracking-wider leading-relaxed">
                            Reserva trajes elegantes para tus ceremonias académicas y graduaciones en 4 sencillos pasos.
                        </p>
                    </div>

                    {/* Timeline de Pasos */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20 relative">
                        {steps.map((step, idx) => (
                            <div 
                                key={idx} 
                                className="bg-white border border-[#ebd7da] rounded-3xl p-6 shadow-sm hover:border-[#dfb279]/35 hover:shadow-md transition-all relative duration-300 group flex flex-col justify-between"
                            >
                                <div className="space-y-4">
                                    <div className={`h-12 w-12 rounded-2xl ${step.bgColor} ${step.color} flex items-center justify-center`}>
                                        <step.icon size={24} />
                                    </div>
                                    <h3 className="font-extrabold text-sm text-[#1a050a] uppercase tracking-wider">{step.title}</h3>
                                    <p className="text-xs text-[#8a3348]/75 leading-relaxed font-semibold">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Sección Informativa Intermedia */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#fcf8f9] border border-[#ebd7da] p-8 md:p-10 rounded-[2.5rem] mb-20">
                        <div className="lg:col-span-8 space-y-4">
                            <h2 className="text-2xl font-serif font-black text-[#1a050a]">Comprometidos con tu presentación profesional</h2>
                            <p className="text-xs text-[#8a3348]/75 leading-relaxed font-semibold">
                                El Armario UNSCH es un programa solidario de Bienestar Universitario. Facilitamos trajes de vestir formales y accesorios a los alumnos de todas las facultades para que representen con honor a nuestra casa de estudios en ponencias, desfiles de gala y su tan ansiada colación.
                            </p>
                        </div>
                        <div className="lg:col-span-4 flex justify-start lg:justify-end gap-3 shrink-0">
                            <Link 
                                href="/catalogo"
                                className="px-7 py-3 bg-[#3d0d16] hover:bg-[#571e26] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                            >
                                Ver prendas
                            </Link>
                        </div>
                    </div>

                    {/* Acordeón de FAQs */}
                    <div className="max-w-3xl mx-auto space-y-6">
                        <h2 className="text-2xl font-serif font-black text-[#1a050a] text-center flex items-center justify-center gap-2 mb-8">
                            <HelpCircle className="text-[#94344c] h-6 w-6" />
                            Preguntas Frecuentes
                        </h2>
                        
                        <div className="space-y-3.5">
                            {faqs.map((faq, idx) => {
                                const isOpen = openFaq === idx;

                                return (
                                    <div 
                                        key={idx} 
                                        className="bg-white border border-[#ebd7da] rounded-2xl overflow-hidden shadow-sm transition-all duration-300"
                                    >
                                        <button
                                            onClick={() => toggleFaq(idx)}
                                            className="w-full px-6 py-4 flex justify-between items-center text-left text-xs font-extrabold uppercase tracking-wider text-[#1a050a] hover:bg-[#fcf8f9] transition-colors cursor-pointer"
                                        >
                                            <span>{faq.question}</span>
                                            <ChevronDown className={`h-4 w-4 text-[#94344c] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        
                                        {isOpen && (
                                            <div className="px-6 pb-5 text-xs text-[#8a3348]/80 leading-relaxed font-semibold animate-in fade-in duration-200">
                                                {faq.answer}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </PublicLayout>
    );
}
