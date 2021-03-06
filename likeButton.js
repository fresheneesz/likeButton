var dropDown = require ('./dropDown')

registerPlugin(proto(Gem, function(){
	this.name = 'LikeButton'

	this.initialize = function(options){
		return{
			likesField: 'likes'
		}
	}

	this.build = function(ticket, optionsObservee, api){
		var that = this
		this.api = api
		this.ticket = ticket
		var likeButton = Image(require('url-loader!./star.png'))
		var numOfLikes = Text()
		this.whoLiked = Text('')
		var like = Block(likeButton, drop = dropDown(numOfLikes, this.whoLiked))
		this.add(like)

		this.likesField = optionsObservee.subject.likesField

		if(ticket.get(this.likesField).subject === undefined){
			numOfLikes.text = 0
			ticket.set(this.likesField, [])
		} else{
			numOfLikes.text = ticket.get(this.likesField).subject.length
			// get current user and see if already in likers
			api.User.current().then(function(user){
				that.currentUser = user.subject._id
			}).done()
			for(var i=0; i<ticket.get(this.likesField).subject.length; i++){
				if(that.currentUser === ticket.get(this.likesField).subject[i]){
					likeButton.src = require('url-loader!./star1.png')
				}
			}
			// get list of names
			if(ticket.get(this.likesField).subject.length > 0){
				this.getLikersName()
			}
		}

		likeButton.on('click', function(){
			api.User.current().then(function(curUser){
				var curUserIndex = ticket.get(that.likesField).subject.indexOf(curUser.subject._id)
				if(curUserIndex === -1){
					 // user isn't in list so add
					 ticket.get(that.likesField).push(curUser.subject._id)
					 likeButton.src = require('url-loader!./star1.png')
				} else{
					// user is in list so remove
					ticket.get(that.likesField).splice(curUserIndex, 1)
					likeButton.src = require('url-loader!./star.png')
					numOfLikes.text = ticket.get(that.likesField).subject.length
					// not sure if needed if more than 1 liker
					that.getLikersName()
				}
			}).done()
		})

		ticket.get(this.likesField).on('change', function(){
			that.getLikersName()
			numOfLikes.text = ticket.get(that.likesField).subject.length
		})

		// view likers
		numOfLikes.on('mouseover', function(){
			drop.open()
		})
		numOfLikes.on('mouseout', function(){
			drop.close()
		})
	}

	this.getLikersName = function(){
		var that = this
		this.api.User.load(this.ticket.get(this.likesField).subject).then(function(users){
			if(users.length === 0 || users === undefined){
				drop.close()
				that.whoLiked.text = ''
			} else if(users.length === 1){
				that.whoLiked.text = users[0].displayName()
			} else{
				for(var i=0; i<users.length; i++){
					that.whoLiked.text += users[i].displayName() + ', '
				}
			}
		}).done()
	}

	this.getStyle = function(){
		return Style({
			Image: {
				cursor: 'pointer'
			},
			Block: {
				border: '1px solid #ccc',
				Text: {
					display: 'block',
					marginBottom: 3
				}
			}
		})
	}
}))