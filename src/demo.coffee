"use strict"

angular.module "Foo", ["completelysuckless"]
.controller "FooController", class
  constructor: ($scope) ->
    $scope.input =
      choices: @demoChoices()
      value: undefined

    $scope.update = (value, ctrl) =>
      # we use this to call auto select
      ctrl.reselect()

      # fetch choices from server
      choices = @demoChoices()

      if value
        if not @findChoice(choices, value)?
          # create a new choice on demand? ask server...
          newChoice =
            id: Math.round(Math.random() * 100 + 3)
            name: value
          choices.splice(0, 0, newChoice)

      $scope.input.choices = choices

    $scope.autoSelect = (value, choice) ->
      if value? and value.toLowerCase() == choice.name.toLowerCase()
        true
      else false

    $scope.choose = (selection, value, ctrl) ->
      # call reset if you need to blur the list and the clean the input
      #ctrl.reset()

      $scope.chosen =
        selection: selection
        input: value
        ctrl: ctrl

  demoChoices: ->
    [
      id: 1
      name: "foo"
    ,
      id: 2
      name: "bar"
    ,
      id: 3
      name: "baz"
    ]

  findChoice: (choices, name) ->
    for choice in choices
      if choice.name.toLowerCase() == name.toLowerCase()
        return choice

    undefined
