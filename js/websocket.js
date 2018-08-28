var myWebSocket = function (option) {
	// var wsUrl = url || 'ws://123.207.167.163:9010/ajaxchattest'
	var wsUrl = option.url || 'ws://127.0.0.1'
	var lockReconnect = false //避免重复连接
	this.HeartBeatStr = option.HeartBeatStr || 'HeartBeat'
	var ws
	var allListener = []
	createWebSocket(wsUrl)
	// 添加事件监听
	this.addEventListener = function (event, callback) {
		allListener.push({
			event: event,
			callback: callback
		})
		ws.addEventListener(event, callback)
	}

	// 关闭连接
	this.close = function (arg) {
		ws.close()
	}

	// 发送消息
	this.send = function (arg) {
		ws.send(arg)
	}

	// 创建连接
	function createWebSocket(url) {
		try {
			ws = new WebSocket(url)
			initEventHandle()
		} catch (e) {
			reconnect(url)
		}
	}
	// 初始化连接
	function initEventHandle() {
		ws.onclose = function () {
			reconnect(wsUrl)
			console.log('连接断开')
		}
		ws.onerror = function () {
			reconnect(wsUrl)
			console.log('连接错误')
		}
		ws.onopen = function () {
			// 心跳检测重置
			heartCheck.reset().start()
			console.log('连接成功')
			// ws.send('getAll')
		}
		ws.onmessage = function (e) {
			// 如果获取到消息，心跳检测重置
			// 拿到任何消息都说明当前连接是正常的
			heartCheck.reset().start()
		}
		allListener.forEach(function (listener) {
			ws.addEventListener(listener.event, listener.callback)
		})
	}

	// 重连
	function reconnect(url) {
		if (lockReconnect) return
		lockReconnect = true
		// 没连接上会一直重连，设置延迟避免请求过多
		setTimeout(function () {
			createWebSocket(url)
			lockReconnect = false
		}, 2000)
	}

	// 心跳检测
	var heartCheck = {
		timeout: option.timeout || 15000, //默认15秒
		timeoutObj: null,
		serverTimeoutObj: null,
		HeartBeatStr: this.HeartBeatStr,
		reset: function () {
			clearTimeout(this.timeoutObj)
			clearTimeout(this.serverTimeoutObj)
			return this
		},
		start: function () {
			var self = this
			this.timeoutObj = setTimeout(function () {
				// 这里发送一个心跳，后端收到后，返回一个心跳消息，
				// onmessage拿到返回的心跳就说明连接正常
				ws.send(self.HeartBeatStr)
				// console.log('发送心跳')
				self.serverTimeoutObj = setTimeout(function () { // 如果超过一定时间还没重置，说明后端主动断开了
					console.log('超时重连')
					ws.close() // 如果onclose会执行reconnect，我们执行ws.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次
				}, self.timeout)
			}, this.timeout)
		}
	}
}