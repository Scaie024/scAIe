import type { Contact, AgentLog } from "../types" // Assuming Contact and AgentLog are defined in a types file

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-$$$$]{10,}$/
  return phoneRegex.test(phone)
}

export const validateContact = (contact: Partial<Contact>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!contact.name?.trim()) {
    errors.push("Name is required")
  }

  if (!contact.email?.trim()) {
    errors.push("Email is required")
  } else if (!validateEmail(contact.email)) {
    errors.push("Invalid email format")
  }

  if (contact.phone && !validatePhone(contact.phone)) {
    errors.push("Invalid phone format")
  }

  if (!contact.status || !["Prospect", "Client", "Inactive"].includes(contact.status)) {
    errors.push("Valid status is required")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, "")
}

export const validateAgentLog = (log: Partial<AgentLog>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!log.agent_type) {
    errors.push("Agent type is required")
  }

  if (!log.action?.trim()) {
    errors.push("Action is required")
  }

  if (typeof log.success !== "boolean") {
    errors.push("Success status is required")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
