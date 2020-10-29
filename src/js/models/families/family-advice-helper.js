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
          this.container.adviceIdInQuerystring("")
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
          this.container.adviceIdInQuerystring("")
          this.container.pushHistory()
        }
      }
    }
  }
  
  export class Advice extends BaseAdvice {
    constructor (data, container) {
      super(data, container)
      this.parentScenarioId = data.parentScenarioId
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
      this.parentScenarioId = data.parentScenarioId
      this.container = container
    }
  
    toggle () {
      this.isSelected(!this.isSelected())
    }
  }