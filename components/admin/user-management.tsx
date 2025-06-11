"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, UserCheck, Shield, User } from "lucide-react"
import type { UserRole } from "@/lib/supabase/types"

interface UserWithProfile {
  id: string
  email: string
  created_at: string
  profile: {
    full_name: string | null
  } | null
  roles: UserRole[]
}

export function UserManagement() {
  const [users, setUsers] = useState<UserWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      // Get all users with their profiles
      const { data: profiles, error: profilesError } = await supabase.from("user_profiles").select(`
          user_id,
          full_name
        `)

      if (profilesError) throw profilesError

      // Get all user roles
      const { data: roles, error: rolesError } = await supabase.from("user_roles").select("user_id, role")

      if (rolesError) throw rolesError

      // Get auth users (admin only can see this)
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

      if (authError) throw authError

      // Combine the data
      const usersWithData = authUsers.users.map((user) => ({
        id: user.id,
        email: user.email || "",
        created_at: user.created_at,
        profile: profiles?.find((p) => p.user_id === user.id) || null,
        roles: roles?.filter((r) => r.user_id === user.id).map((r) => r.role as UserRole) || [],
      }))

      setUsers(usersWithData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    setUpdating(userId)
    setError(null)

    try {
      // Remove existing roles
      await supabase.from("user_roles").delete().eq("user_id", userId)

      // Add new role
      const { error } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: newRole,
      })

      if (error) throw error

      // Log the action
      await supabase.rpc("log_admin_action", {
        action_type: "role_updated",
        resource_type: "user",
        action_details: { user_id: userId, new_role: newRole },
      })

      // Refresh users list
      await fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user role")
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          User Management
        </CardTitle>
        <CardDescription>Manage user roles and permissions</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Current Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.roles.includes("admin") ? (
                        <Shield className="h-4 w-4 text-blue-600" />
                      ) : (
                        <User className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="font-medium">{user.profile?.full_name || "Unknown"}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {user.roles.map((role) => (
                        <Badge key={role} variant={role === "admin" ? "default" : "secondary"}>
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Select
                      value={user.roles[0] || "user"}
                      onValueChange={(value) => updateUserRole(user.id, value as UserRole)}
                      disabled={updating === user.id}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
