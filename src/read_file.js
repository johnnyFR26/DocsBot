const { readFile } = require('fs/promises')
const { error } = require('./constants')

const FIELDS_TO_PROCESS = ['Finalizado', 'Nome', 'Whatsapp']

class File {
  static async csvToJSON(filePath) {
    const content = await readFile(filePath, "utf8")
    const validation = this.isValid(content)
    if(!validation.valid) throw new Error(validation.error)

    const result = this.parseCSVToJSON(content)
    return result
  }

  static isValid(csvString) {
    const [header, ...fileWithoutHeader] = csvString.split(/\r?\n/)
    if (!fileWithoutHeader.length) {
      return {
        error: 'O arquivo está vazio ou possui apenas o header',
        valid: false
      }
    }
    return { valid: true }
  }

  static parseCSVToJSON(csvString) {
    const lines = csvString.split(/\r?\n/).filter(Boolean)
    const header = lines.shift().split(',')

    const indexesToExtract = FIELDS_TO_PROCESS.map(field => header.indexOf(field))

    const users = lines.map(line => {
      const columns = line.split(',')
      const user = {}

      FIELDS_TO_PROCESS.forEach((field, i) => {
        const columnIndex = indexesToExtract[i]
        user[field] = columns[columnIndex]?.trim() ?? null
      })

      return user
    })

    return users
  }
}

module.exports = File
