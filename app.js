var maxid = 0
var X = parseInt(document.body.clientWidth / 50)
var Y = parseInt(document.body.clientHeight / 50)

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

// 创建连接
var myws = new myWebSocket({
	// url: 'ws://192.168.31.92:8888/chat/zkl',
	// url: 'ws://123.207.167.163:9010/ajaxchattest',
	url: 'ws://127.0.0.1:8080',
	timeout: 1000
})

var wall = {
	/** 
	 * 建立一个直角坐标系
	 * @param x
	 * @param y
	 * @return {Array} 返回一个顺序的坐标数组
	 * createArr(几行, 几列)
	 */
	createArr: function createArr(x, y) {
		var arr = new Array()
		for (var i = 0; i < x; i++) {
			for (var j = 0; j < y; j++) {
				arr.push({
					x: i,
					y: j
				})
			}
		}
		return arr
	},
	/* 
	 * 打乱数组
	 * 返回乱序的新数组
	 */
	roa: function roa(arr) //arr为可能出现的元素集合
	{
		var temp = new Array() //temp存放生成的随机数组
		var count = arr.length
		for (var i = 0; i < count; i++) {
			var num = Math.floor(Math.random() * arr.length) //生成随机数num
			temp.push(arr[num]) //获取arr[num]并放入temp
			arr.splice(num, 1)
		}
		return temp
	},
	/* 
	 * 创建动画完成事件
	 * 通过创建一个div元素，判断他的style属性来确定
	 * 返回带有当前浏览器前缀的“动画完成事件”
	 */
	animationEnd: function animationEnd() {
		var el = document.createElement('div')
		// 各种浏览器的动画完成事件
		var animations = {
			animation: 'animationend',
			OAnimation: 'oAnimationEnd',
			MozAnimation: 'mozAnimationEnd',
			WebkitAnimation: 'webkitAnimationEnd',
		}
		// 枚举事件是否定义
		for (var t in animations) {
			if (el.style[t] !== undefined) {
				// 返回事件
				return animations[t]
			}
		}
	},

	/** 
	 * 向页面插入头像 
	 * @param src  {string} 头像的路径
	 * @param id {number} 用户的id
	 * @param x {number} 在x轴的位置
	 * @param y {number} 在y轴的位置
	 * @return {Element} 产生的元素
	 */
	addImg: function addImg(src, id, x, y) {
		if (id > maxid) {
			maxid = id
		}
		try {
			if (src != undefined && x != undefined && y != undefined) {
				var imgEl
				if ($('#' + id).length > 0) {
					imgEl = $('#' + id).attr({
						src: src
					}).css({
						left: x * 50 + 'px',
						top: y * 50 + 'px',
						position: 'absolute',
						width: '50px'
					})
				} else {
					imgEl = $('<img>').attr({
						id: id,
						src: src
					}).css({
						left: x * 50 + 'px',
						top: y * 50 + 'px',
						position: 'absolute',
						width: '50px'
					}).addClass('animated imgAnimation').appendTo('.tx').one(
						this.animationEnd(),
						function () {
							$(this).addClass('animated fast flash')
						})
				}
				return imgEl
			} else {
				throw new Error('缺少参数')
			}
		} catch (error) {
			console.log('创建图片失败', error, src, x, y)
		}
	},
	showAllItems: function showAllItems(data) {
		var self = this
		var items = data.Item
		var timesRun = 0
		// 测试图片
		var img = items
		// 创建定时器，重复执行items.length次，延时s，遍历数组
		var interval = setInterval(function () {
			console.log("添加", timesRun + 1, "个")
			if (timesRun + 1 === items.length) {
				// 清除定时器
				clearInterval(interval)
				console.log("结束")
			}
			var src = img[timesRun].hear_img
			var id = img[timesRun].id
			// 插入图片
			self.addImg(src,
				id,
				imgXYarr[timesRun % imgXYarr.length].x,
				imgXYarr[timesRun % imgXYarr.length].y
			)
			timesRun += 1
		}, 200)
	}
}

var imgXYarr = wall.roa(wall.createArr(X, Y))

// 测试
function test(n, s) {
	if (n != undefined && s != undefined) {
		var timesRun = 0
		// 产生数组并打乱
		// 测试图片
		var img = ['./img/1.jpg', './img/2.jpeg', './img/3.jpeg', './img/4.jpg', './img/5.jpg', './img/6.jpg', './img/7.jpg', './img/8.png']
		// 创建定时器，重复执行timesRun次，延时s
		var interval = setInterval(function () {
			console.log("添加", timesRun, "个")
			if (timesRun === n) {
				// 清除定时器
				clearInterval(interval)
				console.log("结束")
			}
			var src = img[Math.floor(Math.random() * img.length) % img.length]
			var ani = 'imgAnimation'
			// 插入图片
			wall.addImg(src, timesRun, imgXYarr[timesRun % imgXYarr.length].x, imgXYarr[timesRun % imgXYarr.length].y)
			timesRun += 1
		}, s)
	} else {
		console.log('缺少参数')
	}
	return this
}

function start() {

	// 监听接受消息事件
	myws.addEventListener('message', onMessage)
	myws.addEventListener('open', onOpen)

	function onOpen(e) {
		myws.send('getAll')
		console.log('123')
	}

	function onMessage(e) {
		// 判断消息类型是否为json
		if (e.data !== myws.HeartBeatStr) {
			try {
				var msg = JSON.parse(e.data)
				if (typeof msg == 'object' && msg) {
					onMessageCallback(msg)
				} else {
					throw new Error()
				}
			} catch (e) {
				console.log('收到无效的消息,请返回json格式')
			}
		} else {
			console.log('收到心跳')
		}
	}
}

// 接收消息事件回调函数
function onMessageCallback(data) {
	// console.log(data)
	try {
		if (data.Item) {
			wall.showAllItems(data)
		} else if (data.add) {
			console.log(data.add.hear_img,
				data.add.id,
				imgXYarr[data.add.id % imgXYarr.length].x,
				imgXYarr[data.add.id % imgXYarr.length].y)
			wall.addImg(
				data.add.hear_img,
				data.add.id,
				imgXYarr[data.add.id % imgXYarr.length].x,
				imgXYarr[data.add.id % imgXYarr.length].y)
		} else {
			console.log('未处理的消息', data)
		}
	} catch (e) {
		console.log('处理的消息失败')
	}

}

// start()