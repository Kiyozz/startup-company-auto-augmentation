import * as path from 'path'

interface RootScope {
  settings: {
    balance: number
    actions: Action[]
  }
  daysPlayed: number
  Message: { image: unknown }

  showMessage(title: string, message: string, onClick: () => void, extra: string): void
  addTransaction(title: string, amount: number, bool: boolean): void
  $broadcast: (...args: unknown[]) => unknown
}

interface Action {
  id: number
  bonus: number
  employeeId: number
  salaryRaise: number
  type: string
}

declare function GetRootScope(): RootScope

declare const _: _.__
declare const Enums: {
  GameEvents: Record<string, string>
}
declare const EventNames: Record<string, unknown>
declare const Helpers: {
  GetAllEmployees: () => {
    id: number
    salary: number
    lastCompetitorJobOffer: unknown
    mood: unknown
    name: string
  }[]
  GetLocalized: (id: string, properties: unknown) => string
  ShowNotification: (text: string, color: string, importance: number) => void
  ConsoleInfo: typeof console.info
}

declare const rs: RootScope

declare const Game: {
  mods: {
    id: string
    name: string
    modPath: string
    imageUrl: string
  }[]
}

const options = {
  modPath: '',
  scope: GetRootScope(),
  dependencies: true,
  languageModule: null
}

try {
  const lm = require(path.resolve('../languages_module/languages.module.min'))
  options.languageModule = new lm.LanguagesModule()
} catch (error) {
  console.log(path.resolve('..'))
  console.error(error)

  options.dependencies = false
}

/**
 * When the game started
 */
export function initialize(modPath: string): void {
  checkForDependencies(() => {
    options.modPath = modPath
    options.languageModule.init(this, [{ code: 'en' }, { code: 'fr' }], 'Auto Accept Augmentations mod')
  })
}

export function onLoadGame(settings: RootScope['settings']): void {
  if (options.dependencies) {
    options.languageModule.initSettings(settings)
  } else {
    const impactedMod = Game.mods.find(m => {
      return m.id === this.modId
    })

    rs.showMessage(
      '',
      impactedMod.name +
        ' mod requires "Languages Module" mod.<br><br>You must subscribe to it in Startup Company\'s Workshop.',
      function () {
        // Reset the image to avoid display it in the futures showMessage()
        rs.Message.image = null
        console.error(
          impactedMod.name +
            ' mod requires "Languages Module" mod. You must subscribe to it in Startup Company\'s Workshop.'
        )
      },
      impactedMod.modPath + impactedMod.imageUrl
    )
  }
}

/**
 * When the game notify new hour
 */
export function onNewHour({ actions }: { actions: Action[] }): void {
  console.log('New hour')

  checkForDependencies(() => {
    console.log(actions)

    const competitorOfferActions = actions.filter(action => action.type === EventNames.EmployeeCompetitorOffer)

    const employeesAugmented = []

    competitorOfferActions.forEach((action: Action) => {
      const employee = Helpers.GetAllEmployees().find(employee => employee.id === action.employeeId) // Get the employee

      if (!employee) {
        // In case if undefined, do nothing
        console.log(`Employee with id ${action.employeeId} not found`)

        return
      }

      options.scope.settings.balance -= action.bonus // Change the balance according the offer
      employee.salary += action.salaryRaise // Raise the salary
      employee.lastCompetitorJobOffer = options.scope.daysPlayed
      employee.mood = 100

      options.scope.addTransaction(
        Helpers.GetLocalized('auto_accept_augmentations.accept_transaction_text', { employee: employee.name }),
        -action.bonus,
        true
      )
      options.scope.$broadcast(Enums.GameEvents.EmployeeChange)

      employeesAugmented.push({ employee, action })
    })

    const actionsToExclude = _.map(competitorOfferActions, 'id') // Get all ids
    actions = _.filter(actions, action => !_.includes(actionsToExclude, action.id)) // Remove actions from the list

    options.scope.settings.actions = actions

    employeesAugmented.forEach(({ employee, action }) => {
      Helpers.ShowNotification(
        Helpers.GetLocalized('auto_accept_augmentations.accept_text', {
          employee: employee.name,
          priceRaise: action.salaryRaise.toFixed(0),
          priceBonus: action.bonus.toFixed(0)
        }),
        'yellow',
        5
      )
    })
  })
}

export function onUnsubscribe(done: () => void): void {
  done()
}

function checkForDependencies(cb: () => void) {
  if (!options.dependencies) {
    Helpers.ConsoleInfo('Dependencies check for Auto Accept Augmentations mod failed.')

    return
  }

  cb()
}
