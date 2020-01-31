// include Bugsnag from the installed dependencies
var bugsnag = require('@bugsnag/js')

// initialise Bugsnag with some basic options
var bugsnagClient = bugsnag({
  // this loads the apiKey from the environment so be sure to pass it in
  apiKey: process.env.BUGSNAG_API_KEY,
  // setting the appVersion is useful to track when errors are introduced/fixed
  appVersion: '1.2.3',
  // using a combination of releaseStage/notifyReleaseStages you can ensure you
  // only get reports from the environments you care about
  releaseStage: 'production',
  notifyReleaseStages: [ 'staging', 'production' ],
  // you can set global metaData when you initialise Bugsnag
  metaData: {}
})

console.log(`
  Welcome to the plain Node.js example app. Type one of the
  following keys, followed by enter, to perform each action:

  u = report an (u)nhandled error
    Throws an error which will crash the process. Bugsnag will keep the process
    alive just long enough to report the error before allowing it to exit.

  h = report a (h)andled error
    Creates a new error and reports it with a call to .notify(err).

  b = calling notify with a (b)efore send callback
    Runs custom logic before a report is sent. This contrived example will
    pseudo-randomly prevent 50% of the reports from sending.
`)

process.stdin.resume()
process.stdin.on('data', function (d) {
  d = String(d).replace(/\s+/g, '')
  switch (d) {
    case 'u': return unhandledError()
    case 'h': return handledError()
    //case 'l': return leaveBreadcrumb()
    case 'b': return beforeSend()
    default: return unknown(d)
  }
})

function unknown (str) {
  console.log(`nothing configured for "${str}"`)
}

function unhandledError () {
  console.log('throwing an error…')
  // unhandled exceptions and unhandled promise rejections are detected automatically
  throw new Error('unresolveable musical differences')
}

function handledError () {
  console.log('notifying of a handled error…')
  // you can notify Bugsnag of errors you handled or created yourself
  bugsnagClient.notify(new Error('scheduling clash'))
}

// TODO Breadcrumbs not yet implemented for Node
function leaveBreadcrumb () {
  console.log('leaving a breadcrumb…')
  // you can record all kinds of events which will be sent along with error reports
  // these can help when trying to understand the conditions leading up to an error
  bugsnagClient.leaveBreadcrumb('network blip')
}

function beforeSend () {
  console.log('calling notify() with a beforeSend callback…')
  // beforeSend can be used to modify a report or prevent it from being sent at all
  // this example pseudo-randomly filters out approximately half of the reports
  bugsnagClient.notify(new Error('sometimes will send'), {
    beforeSend: (report) => {
      const n = Math.random()
      if (n <= 0.5) report.ignore()
    }
  })
}
