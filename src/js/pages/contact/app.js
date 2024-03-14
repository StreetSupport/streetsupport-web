import '../../common'
import { qAndAs } from './qAndAs'

const marked = require('marked')
const accordion = require('../../accordion')
const templating = require('../../template-render')

const listener = {
  accordionOpened: () => {

  }
}

const template = 'js-tpl'
const viewModel = {
  qAndAs: qAndAs
    .map((qa) => {
      return {
        question: marked(qa.question),
        answer: marked(qa.answer)
      }
    })
}

const onRenderCallback = function () {
  accordion.init(true, 0, listener, false)
}

templating.renderTemplate(template, viewModel, 'js-output', onRenderCallback)
