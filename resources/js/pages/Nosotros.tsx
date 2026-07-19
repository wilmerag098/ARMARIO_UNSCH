import { Head, usePage } from '@inertiajs/react';
import { 
    Heart, 
    Sparkles, 
    Users, 
    Award, 
    Layers, 
    Target
} from 'lucide-react';
import PublicLayout from '@/layouts/PublicLayout';

export default function Nosotros() {
    const { auth } = usePage().props;

    const values = [
        {
            title: "Solidaridad",
            description: "Nacemos con el fin de apoyarnos mutuamente. Facilitamos el acceso a ropa formal de alta costura sin costo excesivo para que la situación económica no limite tu potencial.",
            icon: Heart,
            color: "text-red-600",
            bgColor: "bg-red-50"
        },
        {
            title: "Sostenibilidad",
            description: "Promovemos la economía circular textil. A través del alquiler y cuidado compartido, extendemos la vida útil de trajes elegantes y reducimos la contaminación.",
            icon: Sparkles,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50"
        },
        {
            title: "Inclusión y Equidad",
            description: "Buscamos que cada estudiante de la UNSCH se sienta valorado y seguro en ceremonias de graduación, ponencias académicas y sustentaciones de tesis.",
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-50"
        },
        {
            title: "Calidad y Excelencia",
            description: "Mantener estándares impecables de tintorería y presentación en cada terno, vestido y accesorio, brindando una experiencia de vestir digna y profesional.",
            icon: Award,
            color: "text-[#dfb279]",
            bgColor: "bg-[#dfb279]/20"
        }
    ];

    const stats = [
        { count: "1,200+", label: "Estudiantes Vestidos" },
        { count: "250+", label: "Trajes en Catálogo" },
        { count: "28", label: "Escuelas Profesionales" },
        { count: "100%", label: "Orgullo Sancristobalino" }
    ];

    return (
        <PublicLayout auth={auth as any}>
            <Head title="Nosotros - Armario UNSCH" />

            <div className="bg-[#fdfbfb] min-h-screen py-16">
                <div className="container mx-auto max-w-screen-xl px-4 md:px-8 text-left space-y-20">
                    
                    {/* Hero de Nosotros */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-7 space-y-6">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#94344c] bg-[#94344c]/10 px-4 py-1.5 rounded-full">Nuestra Esencia</span>
                            <h1 className="text-4xl lg:text-5xl font-serif font-black text-[#1a050a] tracking-tight leading-none">
                                Vistiendo el futuro de la UNSCH
                            </h1>
                            <p className="text-xs font-semibold text-[#8a3348]/60 uppercase tracking-wider leading-relaxed">
                                Reduciendo la brecha de oportunidades a través de la elegancia y la solidaridad.
                            </p>
                            <p className="text-xs text-[#8a3348]/80 leading-relaxed font-semibold">
                                El Armario UNSCH es un programa social gestionado por la Dirección de Bienestar Universitario. Nuestra misión es proveer trajes de vestir elegantes a estudiantes sancristobalianos de escasos recursos económicos, eliminando las barreras financieras para que asistan con plena confianza y distinción a sus ponencias de tesis, congresos y ceremonias de graduación.
                            </p>
                        </div>
                        <div className="lg:col-span-5 relative">
                            <div className="absolute inset-0 bg-[#3d0d16]/10 rounded-[2.5rem] transform rotate-3" />
                            <div className="relative rounded-[2.5rem] overflow-hidden border-2 border-[#ebd7da] aspect-[4/3] bg-[#fcf8f9]">
                                <img 
                                    src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=800&auto=format&fit=crop" 
                                    alt="Estudiantes UNSCH" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Misión y Visión */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white border border-[#ebd7da] p-8 rounded-[2rem] shadow-sm space-y-4 hover:border-[#dfb279]/35 transition-colors">
                            <div className="h-10 w-10 rounded-xl bg-[#94344c]/10 text-[#94344c] flex items-center justify-center">
                                <Target size={20} />
                            </div>
                            <h2 className="font-extrabold text-sm uppercase tracking-wider text-[#1a050a]">Nuestra Misión</h2>
                            <p className="text-xs text-[#8a3348]/85 leading-relaxed font-semibold">
                                Promover la inclusión y equidad social facilitando prendas de gala y trajes de vestir formales a los alumnos universitarios de la UNSCH. Fomentamos la economía textil circular, garantizando una imagen profesional y de orgullo sancristobalino.
                            </p>
                        </div>

                        <div className="bg-white border border-[#ebd7da] p-8 rounded-[2rem] shadow-sm space-y-4 hover:border-[#dfb279]/35 transition-colors">
                            <div className="h-10 w-10 rounded-xl bg-[#dfb279]/20 text-[#c19a6b] flex items-center justify-center">
                                <Layers size={20} />
                            </div>
                            <h2 className="font-extrabold text-sm uppercase tracking-wider text-[#1a050a]">Nuestra Visión</h2>
                            <p className="text-xs text-[#8a3348]/85 leading-relaxed font-semibold">
                                Consolidarnos como el modelo de bienestar universitario de referencia nacional en sostenibilidad e inclusión social, con un stock diversificado de prendas de gala y un sistema logístico digital automatizado de alta eficiencia.
                            </p>
                        </div>
                    </div>

                    {/* Valores */}
                    <div className="space-y-12">
                        <div className="text-center max-w-xl mx-auto space-y-2">
                            <h2 className="text-2xl font-serif font-black text-[#1a050a]">Valores Sancristobalianos</h2>
                            <p className="text-xs text-[#8a3348]/60 font-semibold uppercase tracking-wider">Principios rectores de nuestro servicio solidario</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {values.map((val, idx) => (
                                <div key={idx} className="bg-white border border-[#ebd7da] p-6 rounded-2xl shadow-sm space-y-4">
                                    <div className={`h-10 w-10 rounded-xl ${val.bgColor} ${val.color} flex items-center justify-center shrink-0`}>
                                        <val.icon size={18} />
                                    </div>
                                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#1a050a]">{val.title}</h3>
                                    <p className="text-[11px] text-[#8a3348]/80 leading-relaxed font-semibold">{val.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Estadísticas */}
                    <div className="bg-[#1c050a] border border-[#ebd7da]/15 p-8 md:p-12 rounded-[2.5rem] text-center text-white relative overflow-hidden">
                        <div className="absolute -left-20 -top-20 w-64 h-64 bg-[#dfb279]/5 rounded-full blur-3xl" />
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                            {stats.map((stat, idx) => (
                                <div key={idx} className="space-y-1.5">
                                    <div className="text-3xl md:text-4xl font-serif font-black text-[#dfb279]">{stat.count}</div>
                                    <div className="text-[10px] text-[#d2a9b1] font-bold uppercase tracking-wider">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </PublicLayout>
    );
}
