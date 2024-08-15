module.exports = {
  main: {
    // input: './src/shared/api/swagger.yaml', // Укажите URL вашего Swagger-документа
    input: 'http://localhost:4000/yaml',
    output: {
      target: './src/shared/api/generated.ts', // Укажите папку для генерации файлов API
      override: {
        mutator: {
          path: './src/shared/api/axios.instance.ts',
          name: 'customInstance',
        },
      },
    },
  },
}
