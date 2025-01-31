"use client"

import { useState, useEffect } from 'react'
import { FilledButton } from "@/components/ui/FilledButton"
import { Moon, Bell, HelpCircle, Flag, FileText, Crown } from "lucide-react"
import { SettingsCard } from "@/components/ui/SettingsCard"
import { ToggleSwitch } from "@/components/ui/ToggleSwitch"
import { MembershipCard } from "@/components/ui/MembershipCard"
import { NotificationsToggle } from "@/components/ui/NotificationsToggle"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { clearVerificationSession } from "@/hooks/useVerification"
import { motion } from 'framer-motion'
import { LucideIcon, Settings } from 'lucide-react'

interface SettingItem {
  Icon: LucideIcon
  label: string
  element?: React.ReactNode
  onClick?: () => void
}

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        await response.json()
      } catch (error) {
        console.error('Error fetching settings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleLogout = async () => {
    try {
      // Clear verification session data
      clearVerificationSession()
      
      // Clear session cookie
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      })

      if (response.ok) {
        // Redirect to sign-in page
        window.location.href = '/sign-in'
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen">
      <div className="bg-brand-tertiary rounded-b-[50px] shadow-lg pb-8 sm:pb-14 mb-6 sm:mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-20" />
        <motion.div 
          className="relative z-10 w-full max-w-2xl mx-auto px-4 pt-16 sm:pt-20 space-y-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center space-y-3">
            <Settings className="h-10 w-10 mx-auto text-[#E36C59]" />
            <h1 className="text-center text-white text-3xl sm:text-4xl md:text-5xl font-bold font-spaceGrotesk leading-tight sm:leading-[50px] mb-3 sm:mb-4">
              Settings
            </h1>
          </div>
          
          <p className="text-center text-[#C9CDCE] text-lg font-normal font-spaceGrotesk leading-[25px]">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full"
            >
              <Crown className="w-5 h-5 text-[#e36c59]" />
              <span className="text-white/90 font-medium">Premium Member</span>
            </motion.div>
          </p>
        </motion.div>
      </div>

      <motion.div 
        className="max-w-md mx-auto px-4 mt-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Membership Section */}
        <motion.div 
          className="relative"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <MembershipCard 
            expiryDate="March 15, 2024"
            isActive={true}
            cost={3}
          />
          
          {/* Upgrade Button with Enhanced Styling */}
          <div className="mt-4 relative">
            <div className="absolute -inset-3 bg-accent-red/20 blur-xl rounded-2xl animate-pulse"></div>
            <FilledButton
              variant="default"
              size="lg"
              className={cn(
                "w-full bg-accent-red hover:bg-accent-red/90",
                "transform transition-all duration-300 hover:scale-[1.02]",
                "shadow-[0_10px_20px_rgba(227,108,89,0.3)]",
                "hover:shadow-[0_14px_28px_rgba(227,108,89,0.4)]",
                "relative z-10"
              )}
              onClick={() => router.push('/awaken-pro')}
            >
              <div className="flex items-center justify-center gap-2">
                <Crown className="w-5 h-5" />
                <span>Upgrade to Awaken Pro</span>
              </div>
            </FilledButton>
            
            {/* Enhanced Promotional Text */}
            <div className="relative z-10 mt-3 mb-4 text-center py-2 px-4">
              <p className="text-sm font-medium">
                <span className="text-neutral-black">Unlock</span>
                <span className="text-accent-red"> advanced features </span>
                <span className="text-neutral-black">and</span>
                <span className="text-accent-red"> exclusive content </span>
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="space-y-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {([
            { Icon: Bell, label: "Notifications", element: <NotificationsToggle /> },
            { Icon: Moon, label: "Dark Theme", element: <ToggleSwitch /> },
            { Icon: FileText, label: "View Privacy Policy", onClick: () => {} },
            { Icon: HelpCircle, label: "Help Center", onClick: () => {} },
            { Icon: Flag, label: "Report an Issue", onClick: () => {} }
          ] as SettingItem[]).map((setting, index) => (
            <motion.div
              key={setting.label}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + (index * 0.1) }}
            >
              <SettingsCard
                icon={setting.Icon}
                label={setting.label}
                rightElement={setting.element}
                onClick={setting.onClick}
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="mt-8 mb-20"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.8 }}
        >
          <FilledButton
            variant="warning"
            size="lg"
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600"
          >
            Log Out
          </FilledButton>
        </motion.div>
      </motion.div>
    </div>
  )
} 