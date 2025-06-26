"use client"

import { AnimatedCard } from "@/components/ui/AnimatedCard"
import { Input } from "@/components/ui/input"
import { LoadingBrush } from "@/components/ui/LoadingBrush"
import { PrimaryButton } from "@/components/ui/PrimaryButton"
import { ProjectStats } from "@/components/ui/ProjectStats"
import { ResponsiveContainer } from "@/components/ui/ResponsiveContainer"
import { UserSettingsModal } from "@/components/UserSettingsModal"
import type { Project, User } from "@/lib/database"
import { useLanguage } from "@/lib/language"
import { AnimatePresence, motion } from "framer-motion"
import {
  Clock,
  Heart,
  LogIn,
  LogOut,
  Menu,
  Search,
  Sparkles,
  TrendingUp,
  User as UserIcon
} from "lucide-react"
import { useState } from "react"

interface ExploreViewProps {
  publicProjects: Project[]
  publicProjectsLoading: boolean
  publicProjectsSort: string
  setPublicProjectsSort: (sort: string) => void
  loadPublicProjects: (sort: string) => Promise<void>
  user: User | null
  view: string
  setView: (view: string) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  setSidebarOpen: (open: boolean) => void
  logout: () => void
  onLogin?: () => void
}

export function ExploreView({
  publicProjects,
  publicProjectsLoading,
  publicProjectsSort,
  setPublicProjectsSort,
  loadPublicProjects,
  user,
  view,
  setView,
  searchTerm,
  setSearchTerm,
  setSidebarOpen,
  logout,
  onLogin
}: ExploreViewProps) {
  const { t } = useLanguage()
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)

  const handleSortChange = async (newSort: string) => {
    setPublicProjectsSort(newSort)
    await loadPublicProjects(newSort)
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-40"
        >
          <ResponsiveContainer className="py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                </div>
                <motion.img
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  src="/icons/tinti-text.png"
                  alt="Tinti.art"
                  className="h-12 sm:h-16"
                />
                <nav className="hidden sm:flex items-center gap-2">
                  {user && (
                    <>

                    <PrimaryButton
                      variant={view === "dashboard" ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setView("dashboard")}
                    >
                      {t('navigation.dashboard')}
                    </PrimaryButton>
                    
                  <PrimaryButton
                    variant={view === "explore" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setView("explore")}
                  >
                    {t('navigation.explore')}
                  </PrimaryButton>
                  </>
                  )}
                  {!user && (
                    <PrimaryButton
                      variant="outline"
                      size="sm"
                      onClick={() => setView("")}
                      icon={LogOut}
                    >
                      {t('explore.goBack')}
                    </PrimaryButton>
                  )}
                </nav>
              </div>
  
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="relative hidden sm:block">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder={t('common.searchProjects')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-48 lg:w-80 bg-white/80 border-purple-200 rounded-2xl"
                  />
                </div>
  
                <div className="flex items-center gap-2 sm:gap-3">
                  {user ? (
                    <>
                    <button className="flex items-center gap-2 sm:gap-3 hover:bg-white/50 rounded-full px-2 py-1 transition-colors"
                    onClick={() => setIsSettingsModalOpen(true)}>
                      <img
                        src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                        alt={user.display_name || user.username}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white shadow-lg hover:border-purple-500 transition-all"
                      />
                      <span className="hidden sm:block font-medium text-gray-700 text-sm lg:text-base">
                        {user.display_name || user.username}
                      </span>
                    </button>
                      <PrimaryButton variant="outline" size="sm" onClick={logout} icon={LogOut} className="hidden sm:flex">
                        {t('auth.logout')}
                      </PrimaryButton>
                      <button
                        onClick={logout}
                        className="sm:hidden w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 border-2 border-white shadow-lg flex items-center justify-center">
                        <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                      </div>
                      <span className="hidden sm:block font-medium text-gray-700 text-sm lg:text-base">
                        {t('explore.offlineMode')}
                      </span>
                      {onLogin && (
                        <PrimaryButton variant="primary" size="sm" onClick={onLogin} className="hidden sm:flex"
                        icon={LogIn}>
                          {t('auth.login')}
                        </PrimaryButton>
                      )}
                      {onLogin && (
                        <button
                          onClick={onLogin}
                          className="sm:hidden w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600"
                        >
                          <UserIcon className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
  
            {/* Mobile search */}
            <div className="sm:hidden mt-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder={t('common.searchProjects')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full bg-white/80 border-purple-200 rounded-2xl"
                />
              </div>
            </div>
  
            {/* Mobile navigation */}
            <div className="sm:hidden flex items-center gap-2 mt-3">
              {user && (
                <PrimaryButton
                  variant={view === "dashboard" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setView("dashboard")}
                  className="flex-1"
                >
                  {t('navigation.dashboard')}
                </PrimaryButton>
              )}
              <PrimaryButton
                variant={view === "explore" ? "primary" : "outline"}
                size="sm"
                onClick={() => setView("explore")}
                className={user ? "flex-1" : "w-full"}
              >
                {t('navigation.explore')}
              </PrimaryButton>
            </div>
          </ResponsiveContainer>
        </motion.header>

        <ResponsiveContainer className="py-2 sm:py-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            {t('explore.title')}
          </h2>
          <p className="text-gray-600">
            {t('explore.description')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PrimaryButton
            variant={publicProjectsSort === "popular" ? "primary" : "outline"}
            size="sm"
            onClick={() => handleSortChange("popular")}
            icon={TrendingUp}
          >
            {t('explore.popular')}
          </PrimaryButton>
          <PrimaryButton
            variant={publicProjectsSort === "recent" ? "primary" : "outline"}
            size="sm"
            onClick={() => handleSortChange("recent")}
            icon={Clock}
          >
            {t('explore.recent')}
          </PrimaryButton>
          <PrimaryButton
            variant={publicProjectsSort === "liked" ? "primary" : "outline"}
            size="sm"
            onClick={() => handleSortChange("liked")}
            icon={Heart}
          >
            {t('explore.mostLiked')}
          </PrimaryButton>
        </div>
      </div>

      {publicProjectsLoading ? (
        <div className="flex justify-center py-12">
          <LoadingBrush />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          <AnimatePresence>
            {publicProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="cursor-pointer"
                onClick={() => window.open(`/p/${project.id}`, "_blank")}
              >
                <AnimatedCard className="overflow-hidden group">
                  <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 relative overflow-hidden">
                    {project.thumbnail_url ? (
                      <img
                        src={project.thumbnail_url}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        style={{ imageRendering: "pixelated" }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-purple-300" />
                      </div>
                    )}

                  </div>

                  <div className="p-4 sm:p-6">
                    <h3 className="font-bold text-gray-800 mb-2 truncate">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {project.description || t('project.noDescription')}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={project.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${project.username}`}
                          alt={project.display_name || project.username}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm text-gray-600">
                          @{project.display_name || project.username}
                        </span>
                      </div>
                      <ProjectStats 
                        likes={project.likes_count || 0}
                        views={project.views_count}
                        size="sm"
                      />
                    </div>

                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {project.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                        {project.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                            +{project.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        {new Date(project.created_at).toLocaleDateString(t('explore.locale'), {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </AnimatedCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!publicProjectsLoading && publicProjects.length === 0 && (
        <div className="text-center py-12">
          <Sparkles className="w-16 h-16 text-purple-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {t('explore.noProjects')}
          </h3>
          <p className="text-gray-600">
            {t('explore.beFirst')}
          </p>
        </div>
      )}
          </motion.div>
        </ResponsiveContainer>

        {/* User Settings Modal */}
        <UserSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
        user={user as any}
        onUpdateUser={async (updates) => {
          // Update user settings - you may need to implement this API call
          try {
            const response = await fetch('/api/auth/update-profile', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updates)
            })
            
            if (!response.ok) {
              throw new Error('Failed to update profile')
            }
            
            // Optionally refresh user data here
            console.log('Profile updated successfully')
          } catch (error) {
            console.error('Error updating profile:', error)
            throw error
          }
        }}
        />
      </div>
    )

}
