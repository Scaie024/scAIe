"use client"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase/client"
import { Plus, Search, Download, Edit, Trash2, Save, X } from "lucide-react"

interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  status: "Prospect" | "Client" | "Inactive"
  notes?: string
  created_at: string
  updated_at: string
}

interface DatabaseTableProps {
  initialContacts: Contact[]
}

export function DatabaseTable({ initialContacts }: DatabaseTableProps) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Contact>>({})
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "Prospect",
    notes: "",
  })
  const { toast } = useToast()

  // Filter contacts based on search and status
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const matchesSearch =
        searchTerm === "" ||
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || contact.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [contacts, searchTerm, statusFilter])

  const handleEdit = (contact: Contact) => {
    setEditingId(contact.id)
    setEditForm(contact)
  }

  const handleSave = async () => {
    if (!editingId || !editForm.name || !editForm.email) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase
        .from("contacts")
        .update({
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          company: editForm.company,
          status: editForm.status,
          notes: editForm.notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingId)

      if (error) throw error

      setContacts(
        contacts.map((contact) =>
          contact.id === editingId ? { ...contact, ...editForm, updated_at: new Date().toISOString() } : contact,
        ),
      )

      setEditingId(null)
      setEditForm({})

      toast({
        title: "Success",
        description: "Contact updated successfully",
      })
    } catch (error) {
      console.error("Error updating contact:", error)
      toast({
        title: "Error",
        description: "Failed to update contact",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return

    try {
      const { error } = await supabase.from("contacts").delete().eq("id", id)

      if (error) throw error

      setContacts(contacts.filter((contact) => contact.id !== id))

      toast({
        title: "Success",
        description: "Contact deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting contact:", error)
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      })
    }
  }

  const handleAdd = async () => {
    if (!newContact.name || !newContact.email) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive",
      })
      return
    }

    try {
      console.log("[v0] Adding contact:", newContact)

      const { data, error } = await supabase
        .from("contacts")
        .insert([
          {
            name: newContact.name,
            email: newContact.email,
            phone: newContact.phone,
            company: newContact.company,
            status: newContact.status || "Prospect",
            notes: newContact.notes,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("[v0] Error adding contact:", error)
        throw error
      }

      console.log("[v0] Contact added successfully:", data)
      setContacts([data, ...contacts])
      setNewContact({
        name: "",
        email: "",
        phone: "",
        company: "",
        status: "Prospect",
        notes: "",
      })
      setIsAddDialogOpen(false)

      toast({
        title: "Success",
        description: "Contact added successfully",
      })
    } catch (error: any) {
      console.error("[v0] Error adding contact:", error)
      toast({
        title: "Error",
        description: `Failed to add contact: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Phone", "Company", "Status", "Notes", "Created At"]
    const csvContent = [
      headers.join(","),
      ...filteredContacts.map((contact) =>
        [
          contact.name,
          contact.email,
          contact.phone || "",
          contact.company || "",
          contact.status,
          contact.notes || "",
          new Date(contact.created_at).toLocaleDateString(),
        ]
          .map((field) => `"${field}"`)
          .join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "contacts.csv"
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Success",
      description: "Contacts exported to CSV",
    })
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            placeholder="Search by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-gray-300"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-white border-gray-300">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Prospect">Prospect</SelectItem>
            <SelectItem value="Client">Client</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={exportToCSV} variant="outline" className="bg-white border-gray-300 hover:bg-stone-50">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gray-900 hover:bg-gray-800 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-stone-200 border-gray-500">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Add New Contact</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-gray-700">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    className="bg-white border-gray-300"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-700">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    className="bg-white border-gray-300"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone" className="text-gray-700">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    className="bg-white border-gray-300"
                  />
                </div>
                <div>
                  <Label htmlFor="company" className="text-gray-700">
                    Company
                  </Label>
                  <Input
                    id="company"
                    value={newContact.company}
                    onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                    className="bg-white border-gray-300"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status" className="text-gray-700">
                  Status
                </Label>
                <Select
                  value={newContact.status}
                  onValueChange={(value) => setNewContact({ ...newContact, status: value as Contact["status"] })}
                >
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Prospect">Prospect</SelectItem>
                    <SelectItem value="Client">Client</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes" className="text-gray-700">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={newContact.notes}
                  onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                  className="bg-white border-gray-300"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAdd} className="bg-gray-900 hover:bg-gray-800 text-white">
                  Add Contact
                </Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {filteredContacts.length} of {contacts.length} contacts
      </div>

      {/* Table */}
      <div className="border border-gray-300 rounded-lg bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-stone-50">
              <TableHead className="text-gray-900 font-medium">Name</TableHead>
              <TableHead className="text-gray-900 font-medium">Email</TableHead>
              <TableHead className="text-gray-900 font-medium">Phone</TableHead>
              <TableHead className="text-gray-900 font-medium">Company</TableHead>
              <TableHead className="text-gray-900 font-medium">Status</TableHead>
              <TableHead className="text-gray-900 font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.map((contact) => (
              <TableRow key={contact.id} className="hover:bg-stone-50">
                <TableCell>
                  {editingId === contact.id ? (
                    <Input
                      value={editForm.name || ""}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="bg-white border-gray-300"
                    />
                  ) : (
                    <span className="font-medium text-gray-900">{contact.name}</span>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === contact.id ? (
                    <Input
                      type="email"
                      value={editForm.email || ""}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="bg-white border-gray-300"
                    />
                  ) : (
                    <span className="text-gray-700">{contact.email}</span>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === contact.id ? (
                    <Input
                      value={editForm.phone || ""}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="bg-white border-gray-300"
                    />
                  ) : (
                    <span className="text-gray-700">{contact.phone || "—"}</span>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === contact.id ? (
                    <Input
                      value={editForm.company || ""}
                      onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                      className="bg-white border-gray-300"
                    />
                  ) : (
                    <span className="text-gray-700">{contact.company || "—"}</span>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === contact.id ? (
                    <Select
                      value={editForm.status}
                      onValueChange={(value) => setEditForm({ ...editForm, status: value as Contact["status"] })}
                    >
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Prospect">Prospect</SelectItem>
                        <SelectItem value="Client">Client</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge
                      variant={
                        contact.status === "Client"
                          ? "default"
                          : contact.status === "Prospect"
                            ? "secondary"
                            : "outline"
                      }
                      className={
                        contact.status === "Client"
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : contact.status === "Prospect"
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }
                    >
                      {contact.status}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === contact.id ? (
                    <div className="flex gap-1">
                      <Button size="sm" onClick={handleSave} className="bg-gray-900 hover:bg-gray-800 text-white">
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(contact)}
                        className="bg-white border-gray-300 hover:bg-stone-50"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(contact.id)}
                        className="bg-white border-gray-300 hover:bg-red-50 text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredContacts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm || statusFilter !== "all" ? "No contacts match your filters" : "No contacts found"}
        </div>
      )}
    </div>
  )
}
