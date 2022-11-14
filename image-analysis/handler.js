'use strict'
const { get } = require('axios')
class Handler {
  constructor(rekognitionService, translatorService) {
    this.rekognitionService = rekognitionService
    this.translatorService = translatorService
  }

  async detectImageLabels(imgBuffer) {
    const result = await this.rekognitionService.detectLabels({
      Image: {
        Bytes: imgBuffer
      }
    }).promise()

    const workingItens = result.Labels.filter(({ Confidence }) => Confidence > 80)
    const labelNames = workingItens.map(({ Name }) => Name).join(', ')

    return {workingItens, labelNames}
  }

  async translateText(text) {
    const params = {
      SourceLanguageCode: 'en',
      TargetLanguageCode: 'pt',
      Text: text
    }

    const result = await this.translatorService.translateText(params).promise()

    return result.TranslatedText;
  }

  formatTextsResults(workingItens, translatedLabels) {
    const finalText = []
    const translatedLabelsArray = translatedLabels.split(', ')

    for (const indexText in translatedLabelsArray) {
      const nameInPortuguese = translatedLabelsArray[indexText]
      const cofidence = workingItens[indexText].Confidence
      finalText.push(`${cofidence.toFixed(2)}% de ser um ${nameInPortuguese}`)
    }

    return finalText;
  }

  async getImageBuffer(imageUrl) {
    const response = await get(imageUrl, { responseType: 'arraybuffer' })
    const buffer = Buffer.from(response.data, 'base64')
    return buffer;
  }

  async main(event) {
    try {

      console.log('Downloading image...')
      // const imgBuffer = await readFile('./images/cat.jpeg')
      const { imageUrl } = event.queryStringParameters
      const imgBuffer = await this.getImageBuffer(imageUrl)

      console.log('Detecting labels...')
      const {workingItens, labelNames} = await this.detectImageLabels(imgBuffer)
      console.log(labelNames)

      console.log('Translating text to Portuguese...')
      const translatedLabels = await this.translateText(labelNames)
      console.log(translatedLabels)

      console.log('Formatting text...')
      const formattedText = this.formatTextsResults(workingItens, translatedLabels)
      console.log(formattedText)
      console.log('Finishing...')

      return {
        statusCode: 200,
        body: 'A imagem tem\n '.concat(formattedText)
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        body: 'Internal Server Error'
      }
    }
  }
 }

const aws = require('aws-sdk')
const rekoginition = new aws.Rekognition()
const translator = new aws.Translate()
const handler = new Handler(
  rekoginition,
  translator
)

module.exports.main = handler.main.bind(handler)
