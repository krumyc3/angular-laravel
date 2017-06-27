class QuickViewController {
  constructor (API, $state, $stateParams, $timeout, $scope, $rootScope, $sce, $filter, ContextService) {
    'ngInject'

    this.userRoute = API.all('users');

    this.API = API
    this.scope = $scope
    this.message = ''
    this.userRoute.get('all-chat-user').then((response) => {
        this.chatUsers = response.plain().data
    })

    this.userRoute.get('me').then((response) => {
        let data = response.plain().data
        this.userInfo = data

        //Subscribe to the channel we specified in our Laravel Event
        console.log('chat-channel-' + data.id)
        let channel = pusher.subscribe('chat-channel-' + data.id)
        let that = this
        //Bind a function to a Event (the full Laravel class)
        channel.bind('App\\Events\\MessagePostEvent', function(messageData) {
            console.log(messageData)
            console.log(that.openChanelId)
            if (messageData.user.id == that.openChanelId) {
                that.addMessage(messageData)
                $scope.$apply()
            }
        })
    })
  }

  addMessage(message) {
      this.messageList.push(message)
  }
  openChanel(userInfo) {
      console.log(userInfo);
      console.log(userInfo)
      this.openChanelId = userInfo.id
      this.API.one('message', 'message-with').get({
          with_id: this.openChanelId
      }).then((response) => {
          this.messageList = response.plain().data
      })
  }

  sendMessage(message) {
      if (message == '')
          return
      this.message = ''
      let newMessage = {
          to_id: this.openChanelId,
          message: message
      }

      this.API.all('message/create').post(newMessage).then((response) => {
          this.addMessage({
              message: message,
              to_id: this.openChanelId,
              user: this.userInfo
          })
      })
  }

  $onInit () {}
}

export const QuickViewComponent = {
  templateUrl: './views/app/components/quick-view/quick-view.component.html',
  controller: QuickViewController,
  controllerAs: 'vm',
  bindings: {}
}
