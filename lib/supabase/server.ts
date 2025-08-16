import { Client } from 'pg'
import { cookies } from "next/headers"
import { cache } from "react"

// Check if PostgreSQL environment variables are available
export const isSupabaseConfigured = true // Always true since we're using PostgreSQL

class DatabaseClient {
  from(table: string) {
    return new TableQuery(table)
  }
}

class QueryBuilder {
  protected table: string
  protected queryParts: string[]
  protected values: any[]

  constructor(table: string) {
    this.table = table
    this.queryParts = []
    this.values = []
  }

  eq(column: string, value: any) {
    this.queryParts.push(`WHERE ${column} = $1`)
    this.values.push(value)
    return this
  }

  order(column: string, options: { ascending: boolean }) {
    const direction = options.ascending ? 'ASC' : 'DESC'
    this.queryParts.push(`ORDER BY ${column} ${direction}`)
    return this
  }

  limit(count: number) {
    this.queryParts.push(`LIMIT ${count}`)
    return this
  }
}

class SelectQuery extends QueryBuilder {
  private columns: string

  constructor(table: string, columns: string = '*') {
    super(table)
    this.columns = columns
  }

  eq(column: string, value: any) {
    super.eq(column, value)
    return this
  }

  order(column: string, options: { ascending: boolean }) {
    super.order(column, options)
    return this
  }

  limit(count: number) {
    super.limit(count)
    return this
  }

  async execute() {
    const client = new Client({
      connectionString: process.env.POSTGRES_URL,
    })

    try {
      await client.connect()
      const query = `SELECT ${this.columns} FROM ${this.table} ${this.queryParts.join(' ')}`
      const res = await client.query(query, this.values)
      await client.end()
      return { data: res.rows, error: null }
    } catch (error) {
      await client.end()
      return { data: null, error }
    }
  }

  // Proxy the promise methods to the execute method
  then(onFulfilled?: any, onRejected?: any) {
    return this.execute().then(onFulfilled, onRejected)
  }

  catch(onRejected?: any) {
    return this.execute().catch(onRejected)
  }
}

class TableQuery extends QueryBuilder {
  select(columns: string = '*') {
    const selectQuery = new SelectQuery(this.table, columns)
    selectQuery.queryParts = [...this.queryParts]
    selectQuery.values = [...this.values]
    return selectQuery
  }

  eq(column: string, value: any) {
    super.eq(column, value)
    return this
  }

  order(column: string, options: { ascending: boolean }) {
    super.order(column, options)
    return this
  }

  limit(count: number) {
    super.limit(count)
    return this
  }

  async insert(values: any[]) {
    const client = new Client({
      connectionString: process.env.POSTGRES_URL,
    })

    try {
      await client.connect()
      const keys = Object.keys(values[0])
      const valuesPlaceholders = values.map((_, index) => 
        `(${keys.map((_, keyIndex) => `$${index * keys.length + keyIndex + 1}`).join(', ')})`
      ).join(', ')
      
      const query = `INSERT INTO ${this.table} (${keys.join(', ')}) VALUES ${valuesPlaceholders} RETURNING *`
      const flatValues = values.flatMap(obj => Object.values(obj))
      
      const res = await client.query(query, flatValues)
      await client.end()
      return { data: res.rows, error: null }
    } catch (error) {
      await client.end()
      return { data: null, error }
    }
  }

  async update(updates: any) {
    const client = new Client({
      connectionString: process.env.POSTGRES_URL,
    })

    try {
      await client.connect()
      const keys = Object.keys(updates).filter(key => key !== 'id')
      const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ')
      const values = [...Object.values(updates).filter((_, index) => keys[index] !== 'id'), updates.id]
      
      const query = `UPDATE ${this.table} SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`
      const res = await client.query(query, values)
      await client.end()
      return { data: res.rows, error: null }
    } catch (error) {
      await client.end()
      return { data: null, error }
    }
  }

  async delete() {
    const client = new Client({
      connectionString: process.env.POSTGRES_URL,
    })

    try {
      await client.connect()
      const whereClause = this.queryParts.find(part => part.startsWith('WHERE')) || ''
      const query = `DELETE FROM ${this.table} ${whereClause} RETURNING *`
      const res = await client.query(query, this.values)
      await client.end()
      return { data: res.rows, error: null }
    } catch (error) {
      await client.end()
      return { data: null, error }
    }
  }
}

// Create a cached version of the database client for Server Components
export const createClient = cache(() => {
  return new DatabaseClient()
})

export const createServerClient = (cookieStore: any) => {
  return new DatabaseClient()
}