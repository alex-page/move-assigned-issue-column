# ‼️This is no longer supported ‼️

Please use [`GitHub Project Automation+`](https://github.com/marketplace/actions/github-project-automation) instead. The following snippet adds or moves all assigned issues to a project column using GitHub Project Automation+:

```yml
name: Automate project columns

on: [issues]

jobs:
  automate-project-columns:
    runs-on: ubuntu-latest
    steps:
      - name: Move assigned pull requests into To do
        if: github.event_name == 'issues' && github.event.action == 'assigned'
        uses: alex-page/automate-project-columns@master
        with:
          project: Backlog
          column: To do
          repo-token: ${{ secrets.GITHUB_TOKEN }}
```

---


# Move assigned issue to column

> ✨ GitHub action to automagically move assigned issue to a column.


## How to use

To use this action we need the project name and the name of the column for the new issues will go into. The project and column names will be used to get a column ID for automation.

In your project create a new workflow file `.github/main.workflow`:
```
workflow "✨ Move assigned issue to column" {
  resolves = ["Move assigned issue to column"]
  on = "issues"
}

action "Move assigned issue to column" {
  uses = "alex-page/move-assigned-issue-column@master"
  args = [ "🎒 Backlog", "In progress"]
  secrets = ["GITHUB_TOKEN"]
}
```

> Note: Replace `🎒 Backlog` with your project name and `In progress` with your project column.


## Private repositories

In some cases you may want to do add this functionality for a private repository or one you do not have admin rights to. You may get an error like:
```shell
GraphqlError: Resource not accessible by integration
```

When this happens you will need to provide a [personal access token](https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line). To do this you will need to create a new secret called `GH_PAT` with your secret. You will then need to change the `.github/main.workflow` secrets to include that token:
```
secrets = ["GH_PAT"]
```

With certain organisations there may be SAML enforcement. This means you will need to `Enable SSO` when you create the personal access token.
```
GraphqlError: Resource protected by organization SAML enforcement. You must grant your personal token access to this organization
```


## Release history

- v0.0.5 - Deprecated
- v0.0.4 - Fix incorrect documentation
- v0.0.3 - Support for private repos
- v0.0.2 - End in a neutral state for unsupported issue action
- v0.0.1 - First release
