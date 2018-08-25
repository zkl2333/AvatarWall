var ws //websocket实例


var wsConf = {
	// wsUrl: 'ws://192.168.31.92:8888/chat/zkl',
	wsUrl: 'ws://123.207.167.163:9010/ajaxchattest',
	lockReconnect: false, //避免重复连接
	HeartBeatStr: 'HeartBeat',
}

var wall = {
	/* 
	 * 建立一个直角坐标系
	 * createArr(几行, 几列)
	 * 返回一个顺序的坐标数组
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
	/* 
	 * 向页面插入头像
	 * addImg(src, x, y, ani)
	 * 返回值为创建的元素
	 */
	addImg: function addImg(src, x, y) {
		try {
			if (src != undefined && x != undefined && y != undefined) {
				var imgEl = $('<img>')
				imgEl.attr({
					src: src
				}).css({
					left: x * 3 + 'vw',
					top: y * 3 + 'vw',
					position: 'absolute',
					width: '3vw'
				}).addClass('animated imgAnimation').appendTo('.tx').one(
					this.animationEnd(),
					function () {
						$(this).addClass('animated fast flash')
					})
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
		// if (items != undefined) {
		// 	for (var i in items) {
		// 		console.log(items[i])
		// 		// addImg(items[i].hear_img, 10, 10)
		// 		var imgXYarr = roa(createArr(20, 20))
		// 		addImg(items[i].hear_img, imgXYarr[i % imgXYarr.length].x, imgXYarr[i % imgXYarr.length].y)
		// 		// addImg('./img/3.jpeg', 10, 10)
		// 	}
		// }
		var timesRun = 0
		// 产生数组并打乱
		var imgXYarr = this.roa(this.createArr(20, 20))
		// 测试图片
		var img = items
		// 创建定时器，重复执行timesRun次，延时s
		var interval = setInterval(function () {
			console.log("添加", timesRun, "个")
			if (timesRun === items.length) {
				// 清除定时器
				clearInterval(interval)
				console.log("结束")
			}
			var src = img[timesRun].hear_img
			// 插入图片
			self.addImg(src,
				imgXYarr[timesRun % imgXYarr.length].x,
				imgXYarr[timesRun % imgXYarr.length].y
			)
			timesRun += 1
		}, 1000)
	}
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
		reconnect(wsConf.wsUrl)
		console.log('连接断开')
	}
	ws.onerror = function () {
		reconnect(wsConf.wsUrl)
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
		// console.log(e.data)
		// 判断消息类型
		if (e.data !== wsConf.HeartBeatStr){
			try {
				var mag = JSON.parse(e.data)
				if (typeof mag == 'object' && mag && wsConf.HeartBeatStr) {
					onMessageCallback()
				}
			} catch (e) {
				console.log('无效的消息')
			}
		} else {
			console.log('收到心跳')
		}
	}
}

// 接收消息时间回调函数
function onMessageCallback(data) {
	if (data.Item) {
		wall.showAllItems(data.Item)
	}
}

// 重连
function reconnect(url) {
	if (wsConf.lockReconnect) return
	wsConf.lockReconnect = true
	//没连接上会一直重连，设置延迟避免请求过多
	setTimeout(function () {
		createWebSocket(url)
		wsConf.lockReconnect = false
	}, 2000)
}

//心跳检测
var heartCheck = {
	timeout: 15000, //15秒
	timeoutObj: null,
	serverTimeoutObj: null,
	reset: function () {
		clearTimeout(this.timeoutObj)
		clearTimeout(this.serverTimeoutObj)
		return this
	},
	start: function () {
		var self = this
		this.timeoutObj = setTimeout(function () {
			//这里发送一个心跳，后端收到后，返回一个心跳消息，
			//onmessage拿到返回的心跳就说明连接正常
			ws.send(wsConf.HeartBeatStr)
			self.serverTimeoutObj = setTimeout(function () { //如果超过一定时间还没重置，说明后端主动断开了
				ws.close() //如果onclose会执行reconnect，我们执行ws.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次
			}, self.timeout)
		}, this.timeout)
	}
}

// 测试
function test(x, y, s) {
	if (x != undefined && y != undefined && s != undefined) {
		var timesRun = 0
		// 产生数组并打乱
		var imgXYarr = wall.roa(wall.createArr(x, y))
		// 测试图片
		var img = ['./img/1.jpg', './img/2.jpeg', './img/3.jpeg', './img/4.jpg', './img/5.jpg', './img/6.jpg', './img/7.jpg', './img/8.png']
		// 创建定时器，重复执行timesRun次，延时s
		var interval = setInterval(function () {
			console.log("添加", timesRun, "个")
			if (timesRun === x * y) {
				// 清除定时器
				clearInterval(interval)
				console.log("结束")
			}
			var src = img[Math.floor(Math.random() * img.length) % img.length]
			var ani = 'imgAnimation'
			// 插入图片
			wall.addImg(src, imgXYarr[timesRun % imgXYarr.length].x, imgXYarr[timesRun % imgXYarr.length].y, ani)
			timesRun += 1
		}, s)
	} else {
		console.log('缺少参数')
	}
	return this
}

// test(10, 10, 100)

function start() {
	// 创建连接
	createWebSocket(wsConf.wsUrl)
	// 获取头像地址
	// if (wsConf.lockReconnect)
	// 	ws.send('getAll')
	// 创建头像

	// // 绘制坐标系
	// var imgXYarr = roa(createArr(10, 10))
	// // 插入头像
	// addImg('./img/1.jpg', 1, 1).attr('id', 12);
}

start()