/**
 * Watson Assistant Chat Integration
 * Handles initialization of Watson Assistant chat widget with geolocation support
 */

// Default config - can be overridden by setting window.WATSON_PAGE_CONFIG before loading this script
var WATSON_DEFAULT_CONFIG = {
  integrationID: '2146349f-ef06-4e9d-ad65-c7846775c0b6',
  region: 'eu-gb',
  serviceInstanceID: 'a3a6beaa-5967-4039-8390-d48ace365d86'
}

// Merge page-level config with defaults
var WATSON_CONFIG = Object.assign({}, WATSON_DEFAULT_CONFIG, window.WATSON_PAGE_CONFIG || {})

var GEOLOCATION_OPTIONS = {
  timeout: 15000,
  maximumAge: 0,
  enableHighAccuracy: true
}

var GEOLOCATION_RETRY_DELAY = 2000
var MAX_GEOLOCATION_RETRIES = 1

var savedContext = {}
var watsonInstance = null

/**
 * Attempts to get the user's geolocation
 * @param {number} attempts - Current retry attempt count
 */
function tryGeolocation (attempts) {
  attempts = attempts || 0

  if (!watsonInstance) return

  if (!navigator.geolocation) {
    sendLocationError({ code: -1, message: 'No geolocation API' })
    return
  }

  navigator.geolocation.getCurrentPosition(
    function (position) {
      sendLocation(position)
    },
    function (error) {
      if (error.code === error.POSITION_UNAVAILABLE && attempts < MAX_GEOLOCATION_RETRIES) {
        setTimeout(function () {
          tryGeolocation(attempts + 1)
        }, GEOLOCATION_RETRY_DELAY)
      } else {
        sendLocationError(error)
      }
    },
    GEOLOCATION_OPTIONS
  )
}

/**
 * Sends the user's location to Watson Assistant
 * @param {GeolocationPosition} position - The user's position
 */
function sendLocation (position) {
  var context = savedContext
  var oldSkills = context.skills || {}
  var newSkills = {}

  Object.keys(oldSkills).forEach(function (skillName) {
    var skillData = oldSkills[skillName]
    var existingVars = skillData.skill_variables || {}

    newSkills[skillName] = Object.assign({}, skillData, {
      skill_variables: Object.assign({}, existingVars, {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      })
    })
  })

  var payload = {
    input: {
      text: "Ok I've shared my location.",
      options: { return_context: true }
    },
    context: Object.assign({}, context, { skills: newSkills })
  }

  watsonInstance.send(payload)
}

/**
 * Gets a user-friendly error message based on the geolocation error
 * @param {GeolocationPositionError} error - The geolocation error
 * @returns {string} User-friendly error message
 */
function getLocationErrorMessage (error) {
  if (error.code === 1) { // PERMISSION_DENIED
    return "I don't want to share my location at this time."
  } else if (error.code === 2) { // POSITION_UNAVAILABLE
    return "I wasn't able to get a precise location. Could you enter your postcode?"
  } else if (error.code === 3) { // TIMEOUT
    return 'Getting your location timed out. Could you please enter your postcode?'
  } else {
    return 'There was an error sharing my location.'
  }
}

/**
 * Shows a notification message on the page
 * @param {string} message - The message to display
 */
function showNotification (message) {
  // Remove any existing notification
  var existing = document.getElementById('watson-notification')
  if (existing) {
    existing.remove()
  }

  // Create notification element
  var notification = document.createElement('div')
  notification.id = 'watson-notification'
  notification.style.cssText = 'position: fixed; bottom: 100px; right: 20px; background: #333; color: white; padding: 12px 20px; border-radius: 8px; max-width: 300px; font-size: 14px; z-index: 9999; box-shadow: 0 2px 10px rgba(0,0,0,0.2);'

  notification.textContent = message

  // Add close button
  var closeBtn = document.createElement('button')
  closeBtn.textContent = '×'
  closeBtn.style.cssText = 'background: none; border: none; color: white; font-size: 18px; position: absolute; top: 5px; right: 8px; cursor: pointer; padding: 0; line-height: 1;'
  closeBtn.onclick = function () {
    notification.remove()
  }
  notification.style.position = 'fixed'
  notification.style.paddingRight = '30px'
  notification.appendChild(closeBtn)

  document.body.appendChild(notification)

  // Auto-remove after 8 seconds
  setTimeout(function () {
    if (notification.parentNode) {
      notification.remove()
    }
  }, 8000)
}

/**
 * Handles geolocation errors by showing a notification
 * @param {GeolocationPositionError} error - The geolocation error
 */
function sendLocationError (error) {
  var message = getLocationErrorMessage(error)
  showNotification(message)
}

/**
 * Handles incoming messages from Watson Assistant
 * @param {Object} event - The receive event from Watson
 * @param {Object} instance - The Watson Assistant instance
 */
function receiveHandler (event, instance) {
  watsonInstance = instance
  savedContext = event.data.context || {}

  var genericResponses = event.data.output.generic || []
  genericResponses.forEach(function (item) {
    if (
      item.response_type === 'user_defined' &&
      item.user_defined &&
      item.user_defined.user_defined_type === 'share_location'
    ) {
      tryGeolocation()
    }
  })
}

/**
 * Called when Watson Assistant has loaded
 * @param {Object} instance - The Watson Assistant instance
 */
function onWatsonLoad (instance) {
  watsonInstance = instance
  instance.on({ type: 'receive', handler: receiveHandler })

  // Customise the launcher greeting message
  instance.updateLauncherGreetingMessage('Need help finding support?')

  instance.render().then(function () {
    // Explicitly show the greeting message after render
    instance.showLauncherGreetingMessage()
  }).catch(function (error) {
    console.error('Failed to render Watson Assistant:', error)
  })
}

/**
 * Loads the Watson Assistant chat script
 */
function loadWatsonScript () {
  window.watsonAssistantChatOptions = {
    integrationID: WATSON_CONFIG.integrationID,
    region: WATSON_CONFIG.region,
    serviceInstanceID: WATSON_CONFIG.serviceInstanceID,
    openChatByDefault: false,
    showLauncher: true,
    onLoad: onWatsonLoad
  }

  var script = document.createElement('script')
  var version = window.watsonAssistantChatOptions.clientVersion || 'latest'
  script.src = 'https://web-chat.global.assistant.watson.appdomain.cloud/versions/' + version + '/WatsonAssistantChatEntry.js'

  script.onerror = function () {
    console.error('Failed to load Watson Assistant chat script')
  }

  document.head.appendChild(script)
}

/**
 * Initializes Watson Assistant
 */
function initWatsonAssistant () {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadWatsonScript)
  } else {
    loadWatsonScript()
  }
}

// Auto-initialize when module is imported
initWatsonAssistant()

module.exports = {
  init: initWatsonAssistant
}
