const File = require("./src/read_file")

;(async () => {
  const filePath = './csv/abril_2025.csv'
  const users = await File.csvToJSON(filePath)

  users.forEach(user => {
    const finalizado = user.Finalizado.trim()

    user.Finalizado = (
      finalizado.includes('CANCELADO') ||
      finalizado === '' || 
      /^[\?]+$/.test(finalizado)
    ) ? false : finalizado
  })

  const usersWithInvalidNames = users.filter(user => {
    const nome = user.Nome?.trim()
    return nome === '' || /^[\?]+$/.test(nome)
  })
  .map(user => ({
    Nome: user.Nome,
    Whatsapp: user.Whatsapp
  }))

  console.log(users)
})()
