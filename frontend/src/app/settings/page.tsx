"use client"

import { FilledButton } from "@/components/ui/FilledButton"
import { LogOut, Moon, Bell, Shield, User } from "lucide-react"

export default function SettingsPage() {
  const settingsGroups = [
    {
      title: "Account",
      items: [
        { icon: User, label: "Profile Settings", onClick: () => {} },
        { icon: Shield, label: "Privacy & Security", onClick: () => {} },
      ]
    },
    {
      title: "Preferences",
      items: [
        { icon: Bell, label: "Notifications", onClick: () => {} },
        { icon: Moon, label: "Appearance", onClick: () => {} },
      ]
    }
  ]

  return (
    <div className="flex flex-col items-center p-4 md:p-6 mt-16 md:mt-14">
      <div className="w-full max-w-2xl px-4">
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-spaceGrotesk mb-2">
            Settings
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="space-y-8">
          {settingsGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-4">
              <h2 className="text-xl font-semibold font-spaceGrotesk">
                {group.title}
              </h2>
              <div className="space-y-2">
                {group.items.map((item, itemIndex) => (
                  <button
                    key={itemIndex}
                    onClick={item.onClick}
                    className="w-full flex items-center gap-3 p-4 rounded-lg bg-brand-tertiary hover:bg-brand-secondary transition-colors"
                  >
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <FilledButton
            variant="warning"
            size="lg"
            icon={LogOut}
            className="w-full"
          >
            Sign Out
          </FilledButton>
        </div>
      </div>
    </div>
  )
} 