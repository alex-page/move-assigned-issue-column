# Move assinged issue to column

> ✨ GitHub action to automagically move assinged issue to a column.


## How to use

To use this action we need the project number and the name of the column for the new issue to go into. 
- Get the project number from the project URL `projects/1` the number would be `1`.
- Get the column name from the project board for example "To do".

In your project create a new workflow file `.github/main.workflow`:
```
workflow "✨ Move assinged issue to column" {
  resolves = ["Move assigned issue to column"]
  on = "issue"
}

action "Move assigned issue to column" {
  uses = "alex-page/move-assigned-issue-column@master"
  args = [ "1", "In progress"]
  secrets = ["GITHUB_TOKEN"]
}
```

> Note: Replace `1` with your project number and `To do` with your project column.


## Release history

- v0.0.1 - First release
