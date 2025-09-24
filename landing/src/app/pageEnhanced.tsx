"use client";
import { useEffect, useState } from "react";
import { useI18n } from "./i18n";

const DEMO_YOUTUBE_ID = "-XoQCPTgyEA";
const ADMIN_ORIGIN = process.env.NEXT_PUBLIC_ADMIN_ORIGIN || "http://localhost:3000";

export default function HomeEnhanced() {
  const { t, locale, setLocale } = useI18n();
  const [adminReachable, setAdminReachable] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${ADMIN_ORIGIN}/dashboard`, { method: 'GET', mode: 'no-cors', signal: controller.signal })
      .then(() => setAdminReachable(true))
      .catch(() => setAdminReachable(false));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-900">
      {/* Enhanced Navigation */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">⚙️</span>
            </div>
            <span className="font-extrabold text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {t('brand')}
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <a href="#features" className="hover:text-indigo-600 transition-colors duration-200 relative group">
              {t('nav_features')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-200"></span>
            </a>
            <a href="#video" className="hover:text-indigo-600 transition-colors duration-200 relative group">
              {t('nav_demo')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-200"></span>
            </a>
            <a href="#downloads" className="hover:text-indigo-600 transition-colors duration-200 relative group">
              {t('nav_download')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-200"></span>
            </a>
            <a href="#faq" className="hover:text-indigo-600 transition-colors duration-200 relative group">
              {t('nav_faq')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-200"></span>
            </a>
            <a href="#contact" className="hover:text-indigo-600 transition-colors duration-200 relative group">
              {t('nav_contact')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-200"></span>
            </a>
            <button 
              onClick={() => setLocale(locale === 'en' ? 'ur' : 'en')} 
              className="px-4 py-2 rounded-lg border border-gray-300 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 text-xs font-medium"
            >
              {t('toggle_label')}
            </button>
          </nav>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/50 via-purple-50/30 to-blue-100/50"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-32 grid lg:grid-cols-2 gap-16 items-center">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2 animate-pulse"></span>
              Live Demo Available
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                {t('hero_title')}
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {t('hero_sub')}
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button className="group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg">
                <span className="flex items-center">
                  {t('get_app')}
                  <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
              <a href="#video" className="group flex items-center text-indigo-600 hover:text-indigo-700 font-semibold text-lg transition-colors duration-200">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-3 group-hover:bg-indigo-200 transition-colors duration-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                {t('watch_demo')}
              </a>
            </div>
          </div>
          
          <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur-lg opacity-20 scale-105"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl p-4 border border-gray-200">
                {adminReachable ? (
                  <iframe
                    src={`${ADMIN_ORIGIN}/dashboard`}
                    className="w-full aspect-video rounded-xl border"
                  />
                ) : (
                  <div className="w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">📊</span>
                      </div>
                      <p className="text-gray-600 font-medium">Dashboard Preview</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm" id="features">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('core_title')}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful tools designed to streamline your repair business operations
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {icon:'📋', title:t('f1_t'), desc:t('f1_d'), color:'from-blue-500 to-blue-600'},
              {icon:'🔔', title:t('f2_t'), desc:t('f2_d'), color:'from-green-500 to-green-600'},
              {icon:'📈', title:t('f3_t'), desc:t('f3_d'), color:'from-purple-500 to-purple-600'},
              {icon:'🧭', title:'Technician App', desc:'Simple mobile-first experience for techs.', color:'from-orange-500 to-orange-600'},
              {icon:'🧩', title:'Integrations', desc:'Connect payments, maps, and more.', color:'from-pink-500 to-pink-600'},
              {icon:'🔒', title:'Secure', desc:'SSO, roles, and audit-ready.', color:'from-indigo-500 to-indigo-600'},
            ].map((f, i) => (
              <div key={i} className="group bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className={`w-16 h-16 bg-gradient-to-r ${f.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-3xl">{f.icon}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Video Section */}
      <section className="py-20" id="video">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">See SmartFix in Action</h2>
            <p className="text-xl text-gray-600">Watch our comprehensive demo to understand how SmartFix can transform your business</p>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl blur-2xl opacity-20 scale-105"></div>
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${DEMO_YOUTUBE_ID}`}
                title="SmartFix Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Downloads Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600" id="downloads">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="text-white">
            <h2 className="text-4xl font-bold mb-6">{t('dl_title')}</h2>
            <p className="text-xl text-indigo-100 mb-8">{t('dl_sub')}</p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
              <button className="group bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center">
                <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
                {t('play')}
              </button>
              <button className="group bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center">
                <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z"/>
                </svg>
                {t('appstore')}
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 rounded-3xl blur-2xl"></div>
            <div className="relative bg-white rounded-3xl p-4 shadow-2xl">
              {adminReachable ? (
                <iframe
                  src={`${ADMIN_ORIGIN}/notifications`}
                  className="w-full aspect-[4/3] rounded-2xl border"
                />
              ) : (
                <div className="w-full aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🔔</span>
                    </div>
                    <p className="text-gray-600 font-medium">Notifications Preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced FAQ Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm" id="faq">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('faq_title')}</h2>
            <p className="text-xl text-gray-600">Frequently asked questions about SmartFix</p>
          </div>
          <div className="space-y-6">
            {[
              {q:t('faq_q1'), a:t('faq_a1')}, 
              {q:t('faq_q2'), a:t('faq_a2')}, 
              {q:t('faq_q3'), a:t('faq_a3')}
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="font-semibold text-lg text-gray-900 mb-3">{f.q}</div>
                <div className="text-gray-600 leading-relaxed">{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('what_users')}</h2>
            <p className="text-xl text-gray-600">Hear from our satisfied customers</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {name:'Ali Khan', quote:'Reduced turnaround time by 30%.', role:'Operations Manager'},
              {name:'Fatima Ali', quote:'Customers love the live updates.', role:'Customer Service'},
              {name:'Zeeshan Ahmed', quote:'Setup was fast and simple.', role:'Business Owner'}
            ].map((tst, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {tst.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900">{tst.name}</div>
                    <div className="text-sm text-gray-500">{tst.role}</div>
                  </div>
                </div>
                <p className="text-gray-700 italic">&ldquo;{tst.quote}&rdquo;</p>
                <div className="flex text-yellow-400 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Contact Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600" id="contact">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">{t('contact_title')}</h2>
            <p className="text-xl text-indigo-100">Get in touch with our team</p>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            <form className="grid gap-6">
              <div className="grid md:grid-cols-2 gap-6">
                <input 
                  className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200" 
                  placeholder={t('contact_name')} 
                />
                <input 
                  className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200" 
                  placeholder={t('contact_email')} 
                />
              </div>
              <textarea 
                className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200" 
                placeholder={t('contact_msg')} 
                rows={4} 
              />
              <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg">
                {t('contact_send')}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">⚙️</span>
            </div>
            <span className="font-extrabold text-2xl">{t('brand')}</span>
          </div>
          <p className="text-gray-400 mb-6">© {new Date().getFullYear()} {t('brand')}. {t('footer')}</p>
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors duration-200">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors duration-200">Support</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
