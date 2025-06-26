"use client"

import { SimpleLanguageSelector } from "@/components/SimpleLanguageSelector"
import { AnimatedCard } from "@/components/ui/AnimatedCard"
import { LoadingBrush } from "@/components/ui/LoadingBrush"
import { PrimaryButton } from "@/components/ui/PrimaryButton"
import { ProjectStats } from "@/components/ui/ProjectStats"
import { ResponsiveContainer } from "@/components/ui/ResponsiveContainer"
import { WelcomeBanner } from "@/components/ui/WelcomeBanner"
import type { Project } from "@/lib/database"
import { useLanguage } from "@/lib/language"
import { motion } from "framer-motion"
import {
  Globe,
  Heart,
  MessageCircle,
  Sparkles,
  Users
} from "lucide-react"

interface LandingViewProps {
  publicProjects: Project[]
  publicProjectsLoading: boolean
  stats: {
    users: number
    projects: number
    likes: number
    comments: number
  }
  createGuestProject: () => void
  setShowAuthModal: (show: boolean) => void
  setView: (view: any) => void
}

export function LandingView({
  publicProjects,
  publicProjectsLoading,
  stats,
  createGuestProject,
  setShowAuthModal,
  setView
}: LandingViewProps) {
  const { t } = useLanguage()
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="sm:p-2">
        <ResponsiveContainer>
          <div className="flex items-center justify-between">
            <motion.img
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              src="/icons/tinti-text.png"
              alt="Tinti.art"
              className="h-12 sm:h-16"
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2"
            >
              <SimpleLanguageSelector />
              <PrimaryButton size="sm" onClick={createGuestProject} className="hidden sm:flex">
                {t('project.tryFree')}
              </PrimaryButton>
              <PrimaryButton size="sm" onClick={() => setShowAuthModal(true)}>
                {t('auth.login')}
              </PrimaryButton>
            </motion.div>
          </div>
        </ResponsiveContainer>
      </motion.header>

      <main>
        <ResponsiveContainer className="py-6 sm:py-12">
          <WelcomeBanner />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mb-8 sm:mb-16 space-y-4"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <PrimaryButton size="lg" onClick={createGuestProject}>
                {t('project.createWithoutRegister')}
              </PrimaryButton>
              <PrimaryButton variant="outline" size="lg" onClick={() => setShowAuthModal(true)}>
                {t('auth.register')}
              </PrimaryButton>
            </div>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              {t('landing.hero.subtitle')}
            </p>
          </motion.div>

          {/* Sección de características */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">{t('landing.hero.whyChoose')}</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                {t('landing.hero.title')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <AnimatedCard delay={0.2} className="p-6 sm:p-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#A678FF] to-purple-600 flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
                  {t('landing.features.collaboration.title')}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  {t('landing.features.collaboration.description')}
                </p>
              </AnimatedCard>

              <AnimatedCard delay={0.4} className="p-6 sm:p-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#FFB6A6] to-pink-500 flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                  <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">{t('landing.features.cloud.title')}</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  {t('landing.features.cloud.description')}
                </p>
              </AnimatedCard>

              <AnimatedCard delay={0.6} className="p-6 sm:p-8 md:col-span-2 lg:col-span-1">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#A9FBD7] to-teal-500 flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">{t('landing.features.tools.title')}</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  {t('landing.features.tools.description')}
                </p>
              </AnimatedCard>
            </div>
          </motion.div>

          {/* Separador visual */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent mb-16"></div>

          {/* Galería de proyectos públicos */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">{t('landing.community.title')}</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                {t('landing.community.description')}
              </p>
            </div>

            {publicProjectsLoading ? (
              <div className="flex justify-center">
                <LoadingBrush />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
                {publicProjects.slice(0, 12).map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="cursor-pointer"
                    onClick={() => window.open(`/p/${project.id}`, "_blank")}
                  >
                    <AnimatedCard className="overflow-hidden group">
                      <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 relative overflow-hidden">
                        {project.thumbnail_url ? (
                          <img
                            src={project.thumbnail_url || "/placeholder.svg"}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            style={{ imageRendering: "pixelated" }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-purple-300" />
                          </div>
                        )}

                        {/* Overlay con información */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                          <h3 className="text-white font-bold text-sm truncate mb-2">{project.title}</h3>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-white/80">@{project.owner?.display_name}</span>
                            <ProjectStats 
                              likes={project.likes_count || 0}
                              views={project.views_count}
                              size="sm"
                              className="text-white/90"
                            />
                          </div>
                        </div>
                      </div>
                    </AnimatedCard>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="text-center mt-8">
              <PrimaryButton variant="outline" onClick={() => {
                setView("explore")
              }}>
                {t('buttons.viewMoreProjects')}
              </PrimaryButton>
            </div>
          </motion.div>

          {/* Separador visual */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent mb-16"></div>

          {/* Estadísticas */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">{t('landing.buttons.joinThousandsArtists')}</h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              <AnimatedCard delay={0.2} className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#A678FF] to-purple-600 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{stats.users.toLocaleString()}+</div>
                <div className="text-gray-600 text-sm">{t('landing.stats.activeArtists')}</div>
              </AnimatedCard>

              <AnimatedCard delay={0.4} className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFB6A6] to-pink-500 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{stats.projects.toLocaleString()}+</div>
                <div className="text-gray-600 text-sm">{t('landing.stats.projectsCreated')}</div>
              </AnimatedCard>

              <AnimatedCard delay={0.6} className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#A9FBD7] to-teal-500 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{stats.likes.toLocaleString()}+</div>
                <div className="text-gray-600 text-sm">{t('landing.stats.likesGiven')}</div>
              </AnimatedCard>

              <AnimatedCard delay={0.8} className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{stats.comments.toLocaleString()}+</div>
                <div className="text-gray-600 text-sm">{t('landing.stats.comments')}</div>
              </AnimatedCard>
            </div>
          </motion.div>

          {/* Call to Action final */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
            className="text-center"
          >
            <AnimatedCard className="p-8 sm:p-12 bg-gradient-to-br from-purple-50 to-pink-50">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">{t('project.ready')}</h2>
              <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
                {t('landing.hero.joinThousands')}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <PrimaryButton size="lg" onClick={createGuestProject}>
                  {t('landing.hero.startNow')}
                </PrimaryButton>
                <PrimaryButton variant="outline" size="lg" onClick={() => setShowAuthModal(true)}>
                  {t('landing.hero.cta')}
                </PrimaryButton>
              </div>
            </AnimatedCard>
          </motion.div>
        </ResponsiveContainer>
      </main>
    </div>
  )
}
