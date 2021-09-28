class BaseAdvice {
  constructor (data, container) {
    this.id = data.id
    this.title = data.title
    this.body = data.body
    this.sortPosition = data.sortPosition
    this.tags = data.tags
    this.isSelected = data.isSelected
    this.isParentScenario = data.isParentScenario
    this.container = container
  }
}
export class ParentScenario extends BaseAdvice {
  constructor (data, container) {
    super(data, container)
    this.isCurrentParentScenario = data.isCurrentParentScenario
    this.files = data.files
  }

  changeParentScenarioOnSearchResult () {
    this.container.parentScenarios().forEach(element => {
      element.isSelected(false)
    })
    this.container.parentScenarios().forEach(element => {
      element.isCurrentParentScenario(false)
    })

    this.isSelected(!this.isSelected())
    this.isCurrentParentScenario(true)
    this.container.currentParentScenario(this)
    this.container.getAdvice()
  }

  changeParentScenario (isBackUrl) {
    this.container.deactivateSelectedItems()
    this.isSelected(true)
    this.container.currentAdvice(this)

    if (!this.container.currentParentScenario() || this.id() !== this.container.currentParentScenario().id()) {
      this.container.parentScenarioIdInQuerystring(this.id())
      if (isBackUrl !== true) {
        this.container.adviceIdInQuerystring('')
        this.container.pushHistory()
      }

      this.container.parentScenarios().forEach(element => {
        element.isCurrentParentScenario(false)
      })

      this.isCurrentParentScenario(true)
      this.container.currentParentScenario(this)
      this.container.getAdvice(true)
    } else {
      if (isBackUrl !== true) {
        this.container.adviceIdInQuerystring('')
        this.container.pushHistory()
      }
    }
  }
}

export class Advice extends BaseAdvice {
  constructor (data, container) {
    super(data, container)
    this.parentScenarioId = data.parentScenarioId
    this.files = data.files
  }

  changeAdvice (isBackUrl) {
    this.container.deactivateSelectedItems()
    this.isSelected(true)
    this.container.currentAdvice(this)
    this.container.adviceIdInQuerystring(this.container.currentAdvice().id())
    if (isBackUrl !== true) {
      this.container.pushHistory()
    }
  }
}

export class FAQ {
  constructor (data, container) {
    this.id = data.id
    this.title = data.title
    this.body = data.body
    this.sortPosition = data.sortPosition
    this.tags = data.tags
    this.isSelected = data.isSelected
    this.parentScenarioIds = data.parentScenarioIds
    this.container = container
  }

  toggle () {
    this.isSelected(!this.isSelected())
  }
}

export class Guide extends BaseAdvice {
  constructor (data, container) {
    super(data, container)
    this.isExpanded = data.isExpanded
    this.files = data.files
  }

  toggle (isBackUrl) {
    this.container.guides().filter(x => x.id() !== this.id()).forEach(x => x.isSelected(false))
    this.isSelected(!this.isSelected())

    if (this.isSelected()) {
      this.container.guideIdInQuerystring(this.id())
    } else {
      this.container.guideIdInQuerystring('')
    }

    if (isBackUrl !== true) {
      this.container.pushHistory()
    }

    this.container.guides().forEach(x => x.isExpanded(false))
  }

  expand () {
    this.container.guides().filter(x => x.id() !== this.id()).forEach(x => x.isExpanded(false))
    this.isExpanded(!this.isExpanded())
  }
}
