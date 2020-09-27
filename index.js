#!/usr/bin/env node

let shell = require('shelljs')
let colors = require('colors')
let fs = require('fs')

let templates = require('./templates/templates.js')

let appName = process.argv[2]
let appDirectory = `${process.cwd()}/${appName}`

const run = async () => {
  let success = await createReactApp()
  if (!success) {
    console.log(
      `There was an error while trying to create your new React app using create-react-app!`
        .red
    )
    return false
  }

  await cdIntoNewApp()
  await installPackages()
  await updateTemplates()
  await auditFix()

  console.log(`\nCongratulations, you are all done!\n cd => ${appName}\n`.cyan)
}

const createReactApp = () => {
  return new Promise((resolve) => {
    if (appName) {
      shell.exec(`npx create-react-app ${appName}`, (code) => {
        console.log('You new Lambda React app has been created!')
        console.log(`Exit with code ${code}`)
        resolve(true)
      })
    } else {
      console.log('\nYou did not provide an app name!'.red)
      console.log('\nProvide an app name using the following format: ')
      console.log('\nlambda-react ', 'app-name\n'.cyan)
      resolve(false)
    }
  })
}

const cdIntoNewApp = () => {
  return new Promise((resolve) => {
    // shell.cd(appDirectory)
    shell.exec(`cd ${appName}`)
    resolve()
  })
}

const installPackages = () => {
  return new Promise((resolve) => {
    console.log('\nInstalling axios --> install axios dependency\n'.rainbow)

    shell.exec(`cd ${appName} && npm install axios`, () => {
      console.log('\nAll your packages have been installed!'.green)
      resolve()
    })
    console.log('\nRemoving unused files\n'.cyan)
    shell.exec(
      `cd ${appName}/src && rm App.test.js logo.svg serviceWorker.js setupTests.js`,
      () => {
        console.log('\nUnused files have been removed!\n'.green)
      }
    )
  })
}

const updateTemplates = () => {
  return new Promise((resolve) => {
    let promises = []
    Object.keys(templates).forEach((fileName, i) => {
      promises[i] = new Promise((res) => {
        fs.writeFile(
          `${appDirectory}/src/${fileName}`,
          templates[fileName],
          function (err) {
            if (err) {
              return console.log(err)
            }
            res()
          }
        )
      })
    })
    Promise.all(promises).then(() => {
      resolve()
    })
  })
}

const auditFix = () => {
  return new Promise((resolve) => {
    shell.exec(`cd ${appName} && npm audit fix`, () => {
      console.log('Ran npm audit fix\n'.brightGreen)
      resolve()
    })
  })
}

run()
