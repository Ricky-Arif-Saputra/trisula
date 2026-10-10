import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Map, 
  Network, 
  Users, 
  HandHeart, 
  Waypoints, 
  BookOpen, 
  Target, 
  Brain, 
  Flag 
} from 'lucide-react';
import { ScreenType, MathCategory } from '../../types';
import { useAuth } from '../Auth/AuthProvider';

interface BerandaScreenProps {
  onNavigate: (screen: ScreenType, category?: MathCategory) => void;
  onOpenTeacherMode: () => void; // Keeping prop to avoid breaking router, though not used in UI
}

export const BerandaScreen: React.FC<BerandaScreenProps> = ({
  onNavigate,
}) => {
  const { userName } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="w-full min-h-screen bg-(--color-beranda-bg) text-(--color-beranda-mauve) font-sans overflow-x-hidden">
      <motion.div 
        className="max-w-4xl mx-auto px-6 py-16 lg:py-24 flex flex-col gap-24"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        
        {/* 1. HERO SECTION */}
        <motion.section variants={itemVariants} className="flex flex-col items-center text-center gap-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-(--color-beranda-blush) border border-(--color-beranda-mauve)/10 text-(--color-beranda-mauve) text-xs font-semibold tracking-widest uppercase">
            <Sparkles size={14} className="text-(--color-beranda-gold)" />
            <span>Matematika Realistik</span>
          </div>
          
          <div className="flex flex-col gap-4">
            <h1 className="font-serif text-5xl lg:text-6xl text-(--color-beranda-mauve) leading-[1.15] tracking-tight">
              Halo, {userName || 'Pembelajar'}!
            </h1>
            <h2 className="font-serif text-3xl lg:text-4xl text-(--color-beranda-mauve-light) font-medium">
              Selamat datang di ruang berekspresi.
            </h2>
          </div>
          
          <p className="text-(--color-beranda-mauve-light) text-lg max-w-2xl leading-relaxed">
            Di sini, matematika dipelajari dari masalah nyata yang bermakna. Tidak sekadar menghafal, 
            namun membangun nalar untuk menemukan kembali konsep secara bertahap.
          </p>
          
          <button
            onClick={() => onNavigate('materi')}
            className="mt-4 px-10 py-4 rounded-full bg-(--color-beranda-mauve) text-(--color-beranda-bg) font-medium tracking-wide hover:bg-(--color-beranda-mauve-light) transition-colors duration-300 shadow-lg shadow-(--color-beranda-mauve)/20 focus:outline-none focus:ring-4 focus:ring-(--color-beranda-gold)/30 cursor-pointer"
          >
            Mulai Belajar
          </button>
        </motion.section>

        {/* 2. APA ITU RME */}
        <motion.section variants={itemVariants} className="w-full">
          <div className="bg-(--color-beranda-blush) rounded-3xl p-10 lg:p-14 border border-(--color-beranda-mauve)/10 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <h3 className="font-serif text-3xl text-(--color-beranda-mauve) mb-6 flex items-center gap-3">
              <BookOpen className="text-(--color-beranda-gold)" size={28} />
              Apa itu RME?
            </h3>
            <p className="text-(--color-beranda-mauve-light) text-lg leading-relaxed">
              Realistic Mathematics Education (RME) adalah pendekatan yang meyakini bahwa matematika adalah aktivitas manusia. 
              Pembelajaran dimulai dari situasi atau masalah di dunia nyata yang dapat Anda bayangkan, yang kemudian menjadi 
              jembatan untuk menyusun pemahaman matematis secara intuitif dan mandiri.
            </p>
          </div>
        </motion.section>

        {/* 3. 4 TAHAP RME DI TRISULA */}
        <motion.section variants={itemVariants} className="w-full flex flex-col gap-10">
          <div className="text-center">
            <h3 className="font-serif text-4xl text-(--color-beranda-mauve)">4 Tahap RME di TRISULA</h3>
          </div>

          <div className="relative max-w-2xl mx-auto w-full pt-4 pb-8">
            {/* Vertical Line */}
            <div className="absolute left-[27px] lg:left-1/2 lg:-ml-[1px] top-8 bottom-8 w-[2px] bg-(--color-beranda-gold)/30"></div>

            <div className="flex flex-col gap-12">
              {/* Tahap 1 */}
              <div className="relative flex flex-col lg:flex-row items-start lg:items-center w-full group">
                <div className="lg:w-1/2 lg:pr-12 lg:text-right flex flex-col gap-1 pl-20 lg:pl-0 order-2 lg:order-1 mt-1 lg:mt-0">
                  <h4 className="font-serif text-2xl text-(--color-beranda-mauve)">Diketahui</h4>
                  <p className="text-(--color-beranda-mauve-light) leading-relaxed">
                    Memahami konteks dunia nyata, mengidentifikasi informasi penting dari narasi masalah.
                  </p>
                </div>
                <div className="absolute left-0 lg:left-1/2 lg:-translate-x-1/2 w-14 h-14 rounded-full bg-(--color-beranda-bg) border-2 border-(--color-beranda-gold) flex items-center justify-center text-(--color-beranda-gold) z-10 shadow-sm transition-transform duration-500 group-hover:scale-110">
                  <Map size={24} />
                </div>
                <div className="lg:w-1/2 lg:pl-12 order-3 lg:order-2 hidden lg:block"></div>
              </div>

              {/* Tahap 2 */}
              <div className="relative flex flex-col lg:flex-row items-start lg:items-center w-full group">
                <div className="lg:w-1/2 lg:pr-12 hidden lg:block order-1"></div>
                <div className="absolute left-0 lg:left-1/2 lg:-translate-x-1/2 w-14 h-14 rounded-full bg-(--color-beranda-bg) border-2 border-(--color-beranda-gold) flex items-center justify-center text-(--color-beranda-gold) z-10 shadow-sm transition-transform duration-500 group-hover:scale-110">
                  <Target size={24} />
                </div>
                <div className="lg:w-1/2 lg:pl-12 flex flex-col gap-1 pl-20 lg:pl-0 order-2 mt-1 lg:mt-0">
                  <h4 className="font-serif text-2xl text-(--color-beranda-mauve)">Ditanya</h4>
                  <p className="text-(--color-beranda-mauve-light) leading-relaxed">
                    Merumuskan inti permasalahan matematis yang perlu diselesaikan dari konteks tersebut.
                  </p>
                </div>
              </div>

              {/* Tahap 3 */}
              <div className="relative flex flex-col lg:flex-row items-start lg:items-center w-full group">
                <div className="lg:w-1/2 lg:pr-12 lg:text-right flex flex-col gap-1 pl-20 lg:pl-0 order-2 lg:order-1 mt-1 lg:mt-0">
                  <h4 className="font-serif text-2xl text-(--color-beranda-mauve)">Pengerjaan</h4>
                  <p className="text-(--color-beranda-mauve-light) leading-relaxed">
                    Menyusun model (matematisasi) dan menghitung solusi dengan strategi mandiri.
                  </p>
                </div>
                <div className="absolute left-0 lg:left-1/2 lg:-translate-x-1/2 w-14 h-14 rounded-full bg-(--color-beranda-bg) border-2 border-(--color-beranda-gold) flex items-center justify-center text-(--color-beranda-gold) z-10 shadow-sm transition-transform duration-500 group-hover:scale-110">
                  <Brain size={24} />
                </div>
                <div className="lg:w-1/2 lg:pl-12 order-3 lg:order-2 hidden lg:block"></div>
              </div>

              {/* Tahap 4 */}
              <div className="relative flex flex-col lg:flex-row items-start lg:items-center w-full group">
                <div className="lg:w-1/2 lg:pr-12 hidden lg:block order-1"></div>
                <div className="absolute left-0 lg:left-1/2 lg:-translate-x-1/2 w-14 h-14 rounded-full bg-(--color-beranda-bg) border-2 border-(--color-beranda-gold) flex items-center justify-center text-(--color-beranda-gold) z-10 shadow-sm transition-transform duration-500 group-hover:scale-110">
                  <Flag size={24} />
                </div>
                <div className="lg:w-1/2 lg:pl-12 flex flex-col gap-1 pl-20 lg:pl-0 order-2 mt-1 lg:mt-0">
                  <h4 className="font-serif text-2xl text-(--color-beranda-mauve)">Kesimpulan</h4>
                  <p className="text-(--color-beranda-mauve-light) leading-relaxed">
                    Menerjemahkan kembali hasil matematis ke dalam bahasa dunia nyata dan mengevaluasinya.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 4. KARAKTERISTIK RME */}
        <motion.section variants={itemVariants} className="w-full flex flex-col gap-10">
          <div className="text-center">
            <h3 className="font-serif text-4xl text-(--color-beranda-mauve)">Karakteristik RME</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-transparent border border-(--color-beranda-mauve)/15 rounded-3xl p-8 hover:bg-(--color-beranda-blush)/50 transition-colors duration-300">
              <Network className="text-(--color-beranda-gold) mb-4" size={28} />
              <h4 className="font-serif text-xl text-(--color-beranda-mauve) mb-2">Penggunaan Konteks Nyata</h4>
              <p className="text-(--color-beranda-mauve-light) text-sm leading-relaxed">
                Situasi nyata dijadikan titik tolak belajar.
              </p>
            </div>
            
            <div className="bg-transparent border border-(--color-beranda-mauve)/15 rounded-3xl p-8 hover:bg-(--color-beranda-blush)/50 transition-colors duration-300">
              <Waypoints className="text-(--color-beranda-gold) mb-4" size={28} />
              <h4 className="font-serif text-xl text-(--color-beranda-mauve) mb-2">Penggunaan Model</h4>
              <p className="text-(--color-beranda-mauve-light) text-sm leading-relaxed">
                Menjembatani realitas konkret menuju matematika abstrak secara halus.
              </p>
            </div>
            
            <div className="bg-transparent border border-(--color-beranda-mauve)/15 rounded-3xl p-8 hover:bg-(--color-beranda-blush)/50 transition-colors duration-300">
              <HandHeart className="text-(--color-beranda-gold) mb-4" size={28} />
              <h4 className="font-serif text-xl text-(--color-beranda-mauve) mb-2">Kontribusi Siswa</h4>
              <p className="text-(--color-beranda-mauve-light) text-sm leading-relaxed">
                Pemikiran dan konstruksi mandiri siswa sangat dihargai.
              </p>
            </div>
            
            <div className="bg-transparent border border-(--color-beranda-mauve)/15 rounded-3xl p-8 hover:bg-(--color-beranda-blush)/50 transition-colors duration-300">
              <Users className="text-(--color-beranda-gold) mb-4" size={28} />
              <h4 className="font-serif text-xl text-(--color-beranda-mauve) mb-2">Interaktivitas</h4>
              <p className="text-(--color-beranda-mauve-light) text-sm leading-relaxed">
                Belajar adalah interaksi sosial yang penuh diskusi dan refleksi.
              </p>
            </div>

            <div className="bg-transparent border border-(--color-beranda-mauve)/15 rounded-3xl p-8 hover:bg-(--color-beranda-blush)/50 transition-colors duration-300 md:col-span-2 md:w-1/2 md:mx-auto">
              <Sparkles className="text-(--color-beranda-gold) mb-4" size={28} />
              <h4 className="font-serif text-xl text-(--color-beranda-mauve) mb-2">Keterkaitan Antarkonsep</h4>
              <p className="text-(--color-beranda-mauve-light) text-sm leading-relaxed">
                Matematika adalah satu kesatuan struktur, bukan bab-bab terpisah.
              </p>
            </div>
          </div>
        </motion.section>

      </motion.div>
    </div>
  );
};
