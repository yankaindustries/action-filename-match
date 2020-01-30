const core = require('@actions/core')
const github = require('@actions/github')
const { filter } = require('lodash')


async function run() {
  if (!github.context.payload.pull_request) {
    core.error('This action is only valid on Pull Requests')
    return
  }

  const token = core.getInput('github-token')
  const octokit = new github.GitHub(token)

  const { data: files } = await octokit.pulls.listFiles({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: github.context.payload.pull_request.number,
  })

  const match = core.getInput('match') ? new RegExp(core.getInput('match')) : false
  const before = core.getInput('before') ? new RegExp(core.getInput('before')) : false

  const matched =
    filter(files, file => {
      if (before && match && file.previous_filename) {
        return
          before.test(file.previous_filename) &&
          match.test(file.filename)
      }

      if (before && file.previous_filename) {
        return before.test(file.previous_filename)
      }

      if (match) {
        return match.test(file.filename)
      }
    })

  console.log(matched)
  core.setOutput('files', JSON.stringify(matched))
}



run()
