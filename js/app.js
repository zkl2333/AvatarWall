var maxid = 0
var X = parseInt(document.body.clientWidth / 50)
var Y = parseInt(document.body.clientHeight / 50)
var imgXYarr = wall.roa(wall.createArr(X, Y))

/**
 * 消息处理函数
 * @param  {} data 接收到的消息
 */
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

/**
 * 入口函数
 */
function start() {
	// 创建连接
	window.myws = new myWebSocket({
		// url: 'ws://192.168.31.92:8888/chat/zkl',
		// url: 'ws://123.207.167.163:9010/ajaxchattest',
		url: 'ws://127.0.0.1:8080',
		timeout: 10000
	})
	// 监听接受消息事件
	window.myws.addEventListener('message', onMessage)
	window.myws.addEventListener('open', onOpen)

	function onOpen(e) {
		window.myws.send('getAll')
	}

	function onMessage(e) {
		// 判断消息类型是否为json
		if (e.data !== window.myws.HeartBeatStr) {
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

start()