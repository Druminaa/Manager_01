"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { SidebarContent } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChatbotWidget } from "@/components/chatbot-widget"
import { ProfileSkeleton } from "@/components/profile-skeleton"
import { Camera, Eye, EyeOff, Save } from "lucide-react"
import { toast } from "react-toastify"
import { createClient } from "@/lib/supabase-client"
import { cn } from "@/lib/utils"

interface UserProfile {
  name: string
  email: string
  phone?: string
  address?: string
  avatar?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    address: "",
    avatar: "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  useEffect(() => {
    // Set sidebar state based on window size only on the client
    setIsSidebarOpen(window.innerWidth > 1024)

    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (error) {
        toast.error("Could not fetch profile.")
        console.error(error)
      } else if (data) {
        setProfile({
          name: data.name || "",
          email: user.email || "",
          phone: data.phone || "",
          address: data.address || "",
          avatar: data.avatar_url || "",
        })
      }
      setIsLoading(false)
    }

    fetchProfile()
  }, [router])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from("profiles")
      .update({
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
      })
      .eq("id", user.id)

    if (error) {
      toast.error("Failed to update profile.")
    } else {
      toast.success("Profile has been successfully updated.")
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match.")
      return
    }
    const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Password has been successfully changed.")
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const filePath = `${user.id}/${Date.now()}`
    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file)

    if (uploadError) {
      toast.error("Failed to upload image.")
      return
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath)

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id)

    if (updateError) {
      toast.error("Failed to update profile picture.")
    } else {
      setProfile({ ...profile, avatar: publicUrl })
      toast.info("Profile picture has been updated.")
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <div className="hidden lg:block">
        <SidebarContent isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      </div>
      <div className="flex flex-col w-full">
        <MobileHeader isSidebarOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className={cn("transition-all duration-300", isSidebarOpen ? "lg:pl-56" : "lg:pl-[4.5rem]")}>
            {isLoading ? (
              <ProfileSkeleton />
            ) : (
              <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                  <h1 className="text-2xl sm:text-3xl font-bold">Profile Settings</h1>
                  <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
                </div>

                <Tabs defaultValue="profile" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 h-auto sm:h-10">
                    <TabsTrigger value="profile">Profile Information</TabsTrigger>
                    <TabsTrigger value="password">Password & Security</TabsTrigger>
                  </TabsList>

                  <TabsContent value="profile">
                    <Card>
                      <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>Update your personal information and profile picture</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleProfileUpdate} className="space-y-6">
                          {/* Profile Picture */}
                          <div className="flex flex-col sm:flex-row items-center gap-6">
                            <Avatar className="h-24 w-24 border-4 border-primary">
                              <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                                {profile.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-center sm:text-left">
                              <Label
                                htmlFor="avatar-upload"
                                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                              >
                                <Camera className="h-4 w-4" />
                                Upload Photo
                              </Label>
                              <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                              />
                              <p className="text-xs text-muted-foreground mt-2">JPG, PNG or GIF. Max size 2MB.</p>
                            </div>
                          </div>

                          {/* Form Fields */}
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="name">Full Name</Label>
                              <Input
                                id="name"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email Address</Label>
                              <Input
                                id="email"
                                type="email"
                                value={profile.email}
                                disabled // Email is usually not editable
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="phone">Phone Number</Label>
                              <Input
                                id="phone"
                                type="tel"
                                placeholder="+1 (555) 000-0000"
                                value={profile.phone}
                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="address">Address</Label>
                              <Input
                                id="address"
                                placeholder="123 Main St, City, State"
                                value={profile.address}
                                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                              />
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <Button type="submit" className="gap-2">
                              <Save className="h-4 w-4" />
                              Save Changes
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="password">
                    <Card>
                      <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Update your password to keep your account secure</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handlePasswordUpdate} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <div className="relative">
                              <Input
                                id="newPassword"
                                type={showPasswords.new ? "text" : "password"}
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <div className="relative">
                              <Input
                                id="confirmPassword"
                                type={showPasswords.confirm ? "text" : "password"}
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>

                          <div className="flex justify-end pt-4">
                            <Button type="submit" className="gap-2">
                              <Save className="h-4 w-4" />
                              Update Password
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </main>
      </div>
      <ChatbotWidget />
    </div>
  )
}
